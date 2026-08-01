"""
Main FastAPI application - wires together db, auth, schemas, and the
CrewAI agents into a running API.
"""
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Response, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

from utils.db import connect_db, close_db, get_db
from utils.auth import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    get_current_user,
    check_lockout,
    record_login_attempt,
)
from models.schemas import UserRegister, UserLogin, LogAnalysisRequest, LogAnalysisResponse

from crewai import Crew, LLM
from agents.investigator import create_investigator_agent, create_investigator_task
from agents.admin import create_admin_agent, create_admin_task
from utils.threat_intel import check_ip_reputation
from utils.email_alerts import send_critical_alert
from utils.report_generator import generate_report_pdf


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await seed_admin()
    print("AESA Backend Server Started")
    yield
    await close_db()
    print("AESA Backend Server Stopped")


app = FastAPI(title="AESA API", version="1.0.0", lifespan=lifespan)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_admin():
    db = get_db()
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@aesa.local")
    admin_password = os.environ.get("ADMIN_PASSWORD")

    if not admin_password:
        print("WARNING: ADMIN_PASSWORD not set in .env - skipping admin seed")
        return

    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin User",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        print(f"Admin user created: {admin_email}")


@app.get("/")
def read_root():
    return {"service": "AESA API", "status": "operational", "version": "1.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/auth/register")
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister, response: Response):
    db = get_db()
    email = user_data.email.lower()

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Registration failed. Please try a different email or log in.")

    validate_password_strength(user_data.password)
    password_hash = hash_password(user_data.password)

    result = await db.users.insert_one({
        "email": email,
        "password_hash": password_hash,
        "name": user_data.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    })
    user_id = str(result.inserted_id)

    _set_auth_cookies(response, user_id, email)
    return {"id": user_id, "email": email, "name": user_data.name, "role": "user"}


@app.post("/api/auth/login")
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, response: Response):
    db = get_db()
    email = credentials.email.lower()

    await check_lockout(db, email)

    user = await db.users.find_one({"email": email})
    valid = user is not None and verify_password(credentials.password, user["password_hash"])

    await record_login_attempt(db, email, success=valid)

    if not valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    _set_auth_cookies(response, user_id, email)
    return {"id": user_id, "email": user["email"], "name": user["name"], "role": user.get("role", "user")}


@app.get("/api/auth/me")
async def get_me(request: Request):
    db = get_db()
    return await get_current_user(request, db)


@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}


def _set_auth_cookies(response: Response, user_id: str, email: str):
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)

    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, secure=False, samesite="lax", max_age=900, path="/",
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=False, samesite="lax", max_age=604800, path="/",
    )


@app.post("/api/analyze", response_model=LogAnalysisResponse)
@limiter.limit("10/minute")
async def analyze_logs(request: Request, body: LogAnalysisRequest):
    db = get_db()
    user = await get_current_user(request, db)

    llm = LLM(model="groq/llama-3.3-70b-versatile", api_key=os.environ["GROQ_API_KEY"])
    investigator = create_investigator_agent(llm)
    admin_agent = create_admin_agent(llm)

    investigator_task = create_investigator_task(body.log_content, investigator)
    admin_task = create_admin_task(investigator_task, admin_agent)

    crew = Crew(agents=[investigator, admin_agent], tasks=[investigator_task, admin_task], verbose=False)

    try:
        await crew.kickoff_async()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    inv = investigator_task.output.pydantic
    rem = admin_task.output.pydantic

    if inv is None or rem is None:
        raise HTTPException(status_code=502, detail="AI returned an unexpected format. Please try again.")

    threat_intel = await check_ip_reputation(inv.source_ip)

    timeline_data = [{"time_estimate": e.time_estimate, "event": e.event} for e in inv.timeline]

    doc = {
        "user_id": user["id"],
        "log_content": body.log_content,
        "threat_type": inv.threat_type,
        "severity": inv.severity,
        "confidence_score": inv.confidence_score,
        "confidence_reasoning": inv.confidence_reasoning,
        "source_ip": inv.source_ip,
        "forensic_summary": inv.summary,
        "timeline": timeline_data,
        "root_cause": inv.root_cause,
        "mitre_techniques": inv.mitre_techniques,
        "risk_score": {"score": inv.risk_score.score, "factors": inv.risk_score.factors},
        "threat_intel": threat_intel.model_dump(),
        "mitigation_commands": rem.mitigation_commands,
        "timestamp": datetime.now(timezone.utc),
    }
    result = await db.analyses.insert_one(doc)

    if inv.severity == "critical":
        try:
            await send_critical_alert(
                threat_type=inv.threat_type,
                source_ip=inv.source_ip,
                summary=inv.summary,
                risk_score=inv.risk_score.score,
            )
        except Exception as e:
            print(f"WARNING: Critical alert failed: {e}")

    return LogAnalysisResponse(
        id=str(result.inserted_id),
        threat_type=inv.threat_type,
        severity=inv.severity,
        confidence_score=inv.confidence_score,
        confidence_reasoning=inv.confidence_reasoning,
        source_ip=inv.source_ip,
        forensic_summary=inv.summary,
        timeline=timeline_data,
        root_cause=inv.root_cause,
        mitre_techniques=inv.mitre_techniques,
        risk_score={"score": inv.risk_score.score, "factors": inv.risk_score.factors},
        threat_intel=threat_intel.model_dump(),
        mitigation_commands=rem.mitigation_commands,
        timestamp=doc["timestamp"],
        user_id=user["id"],
    )


@app.get("/api/history")
async def get_history(request: Request, limit: int = 10):
    db = get_db()
    user = await get_current_user(request, db)

    cursor = db.analyses.find({"user_id": user["id"]}).sort("timestamp", -1).limit(limit)
    analyses = await cursor.to_list(length=limit)

    for a in analyses:
        a["_id"] = str(a["_id"])

    return analyses


@app.get("/api/analyze/{analysis_id}/report")
async def download_report(analysis_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)

    try:
        analysis = await db.analyses.find_one({"_id": ObjectId(analysis_id), "user_id": user["id"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis["mitre_techniques"] = [m.replace("&", "and") for m in analysis.get("mitre_techniques", [])]
    pdf_bytes = generate_report_pdf(analysis)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="AESA_Report_{analysis_id}.pdf"'},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
