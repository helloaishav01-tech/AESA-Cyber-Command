"""
Pydantic models: request/response contracts for the API.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime


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


class LogAnalysisRequest(BaseModel):
    log_content: str = Field(min_length=1, max_length=20000, description="Raw security log data")


class TimelineEventOut(BaseModel):
    time_estimate: str
    event: str


class RiskScoreOut(BaseModel):
    score: float = Field(ge=0, le=100)
    factors: List[str]


class ThreatIntelOut(BaseModel):
    checked: bool
    is_known_malicious: bool = False
    abuse_confidence_score: Optional[int] = None
    total_reports: Optional[int] = None
    country: Optional[str] = None
    error: Optional[str] = None


class LogAnalysisResponse(BaseModel):
    id: str
    threat_type: str
    severity: Literal["safe", "warning", "critical"]
    confidence_score: float = Field(ge=0, le=100)
    confidence_reasoning: str
    source_ip: Optional[str] = None
    forensic_summary: str
    timeline: List[TimelineEventOut]
    root_cause: List[str]
    mitre_techniques: List[str]
    risk_score: RiskScoreOut
    threat_intel: ThreatIntelOut
    mitigation_commands: List[str]
    timestamp: datetime
    user_id: str
