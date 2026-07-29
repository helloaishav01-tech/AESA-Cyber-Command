"""
Admin agent: produces remediation commands based on the Investigator's
findings. Reads structured input from the investigator's task (via
`context=`) rather than parsing its raw text.
"""
from crewai import Agent, Task
from pydantic import BaseModel, Field
from typing import List


class RemediationResult(BaseModel):
    mitigation_commands: List[str] = Field(description="Concrete Linux commands, e.g. iptables/fail2ban rules")
    recommendations: str = Field(description="2-4 sentences of longer-term hardening advice")


def create_admin_agent(llm) -> Agent:
    return Agent(
        role="Infrastructure Hardening Engineer",
        goal="Provide immediate, actionable Linux remediation commands based on a confirmed threat finding",
        backstory=(
            "You are a Linux security expert specializing in server hardening. "
            "You give concise, production-ready iptables/fail2ban commands and "
            "clear best-practice recommendations - no filler, no vague advice."
        ),
        llm=llm,
        verbose=True,
    )


def create_admin_task(investigator_task: Task, agent: Agent) -> Task:
    return Task(
        description=(
            "Based on the threat classification from the previous task, provide: "
            "1) immediate Linux mitigation commands (iptables, fail2ban) and "
            "2) longer-term hardening recommendations. If the finding was 'safe', "
            "mitigation_commands can be an empty list and recommendations should say so."
        ),
        expected_output="Structured mitigation commands and recommendations",
        agent=agent,
        context=[investigator_task],
        output_pydantic=RemediationResult,
    )
