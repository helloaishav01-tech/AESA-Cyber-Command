"""
Email alerts via Resend - notifies immediately when a critical
threat is detected, so nobody has to remember to check the dashboard.
"""
import os
import httpx


async def send_critical_alert(threat_type: str, source_ip: str, summary: str, risk_score: float) -> bool:
    api_key = os.environ.get("RESEND_API_KEY")
    to_email = os.environ.get("ALERT_EMAIL_TO")
    from_email = os.environ.get("ALERT_EMAIL_FROM", "onboarding@resend.dev")

    if not api_key or not to_email:
        print("WARNING: RESEND_API_KEY or ALERT_EMAIL_TO not set - skipping alert")
        return False

    html = f"""
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2 style="color: #FF3B30;">Critical Threat Detected</h2>
      <p><strong>Threat type:</strong> {threat_type}</p>
      <p><strong>Source IP:</strong> {source_ip or 'Unknown'}</p>
      <p><strong>Risk score:</strong> {risk_score}/100</p>
      <p><strong>Summary:</strong> {summary}</p>
      <p style="color: #94A3B8; font-size: 13px;">Sent automatically by AESA.</p>
    </div>
    """

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "from": from_email,
                    "to": [to_email],
                    "subject": f"[AESA] Critical threat detected: {threat_type}",
                    "html": html,
                },
            )
            resp.raise_for_status()
            return True
    except Exception as e:
        # Never let an alert failure break the actual analysis
        print(f"WARNING: Alert email failed to send: {e}")
        return False
