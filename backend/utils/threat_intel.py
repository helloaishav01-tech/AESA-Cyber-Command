"""
AbuseIPDB lookup - cross-checks a source IP against a real-world
database of reported malicious activity, so severity isn't purely
an LLM opinion.
"""
import os
import httpx
from typing import Optional
from pydantic import BaseModel


class ThreatIntelResult(BaseModel):
    checked: bool
    is_known_malicious: bool = False
    abuse_confidence_score: Optional[int] = None
    total_reports: Optional[int] = None
    country: Optional[str] = None
    error: Optional[str] = None


async def check_ip_reputation(ip: Optional[str]) -> ThreatIntelResult:
    if not ip:
        return ThreatIntelResult(checked=False, error="No source IP to check")

    api_key = os.environ.get("ABUSEIPDB_API_KEY")
    if not api_key:
        return ThreatIntelResult(checked=False, error="ABUSEIPDB_API_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                params={"ipAddress": ip, "maxAgeInDays": 90},
                headers={"Key": api_key, "Accept": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()["data"]

            return ThreatIntelResult(
                checked=True,
                is_known_malicious=data["abuseConfidenceScore"] >= 50,
                abuse_confidence_score=data["abuseConfidenceScore"],
                total_reports=data["totalReports"],
                country=data.get("countryCode"),
            )
    except Exception as e:
        # A failed lookup should never break the whole analysis -
        # it just means "we couldn't get external confirmation this time"
        return ThreatIntelResult(checked=False, error=str(e))
