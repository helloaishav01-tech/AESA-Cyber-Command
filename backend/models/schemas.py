"""
Pydantic models: request/response contracts for the API.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime


# ---------- Auth ----------

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Min 8 chars, at least one number - enforced again in auth.py")
    name: str = Field(min_length=1, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str = "user"


# ---------- Log analysis ----------

class LogAnalysisRequest(BaseModel):
    # max_length matters here: this text gets sent straight to an LLM,
    # so an unbounded field is both a cost risk and an abuse vector
    log_content: str = Field(min_length=1, max_length=20000, description="Raw security log data")


class LogAnalysisResponse(BaseModel):
    id: str
    threat_type: str
    severity: Literal["safe", "warning", "critical"]
    confidence_score: float = Field(ge=0, le=100)
    source_ip: Optional[str] = None
    forensic_summary: str
    mitigation_commands: List[str]
    timestamp: datetime
    user_id: str
