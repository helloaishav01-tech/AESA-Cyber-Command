"""
Admin agent: produces remediation commands tailored to the actual
threat type identified by the Investigator - not a fixed toolset.
"""
from crewai import Agent, Task
from pydantic import BaseModel, Field
from typing import List


class RemediationResult(BaseModel):
    mitigation_commands: List[str] = Field(description="Concrete commands appropriate to this specific threat type - not always iptables/fail2ban")
    recommendations: str = Field(description="2-4 sentences of longer-term hardening advice specific to this threat type")


def create_admin_agent(llm) -> Agent:
    return Agent(
        role="Infrastructure Hardening Engineer",
        goal="Provide remediation that actually fixes the specific vulnerability identified - not generic network-blocking advice",
        backstory=(
            "You are a security engineer who tailors remediation to the actual threat. "
            "For network-based attacks (brute force, port scanning, SSH attacks), you "
            "provide iptables/fail2ban commands to block the source. For application-layer "
            "attacks (SQL injection, XSS, command injection), blocking an IP does NOT fix "
            "the underlying vulnerability - you instead provide code-level fixes (parameterized "
            "queries, input sanitization, output encoding), WAF rule examples, and configuration "
            "changes. You never give iptables commands for an application vulnerability just "
            "because it's the default - the fix must match the actual attack type."
        ),
        llm=llm,
        verbose=True,
    )


def create_admin_task(investigator_task: Task, agent: Agent) -> Task:
    return Task(
        description=(
            "Based on the EXACT threat_type and severity identified in the previous task, "
            "provide remediation that actually addresses that specific vulnerability:\n\n"
            "- Network/auth attacks (brute force, SSH attacks, port scanning): iptables/fail2ban "
            "commands to block the source, plus auth hardening advice.\n"
            "- Application-layer attacks (SQL injection, XSS, command injection, path traversal): "
            "code-level and configuration fixes (e.g. parameterized queries, input validation, "
            "WAF rules, output encoding) - NOT iptables/fail2ban, since blocking one IP does not "
            "fix the underlying vulnerability and the attacker can simply use a different IP.\n"
            "- If severity is 'safe': mitigation_commands should be an empty list, and "
            "recommendations should say no action is needed.\n\n"
            "Match your response to the actual threat_type from the previous task - do not "
            "default to network-blocking commands unless the attack is genuinely network-based."
        ),
        expected_output="Remediation commands and recommendations genuinely appropriate to the specific threat type identified",
        agent=agent,
        context=[investigator_task],
        output_pydantic=RemediationResult,
    )
