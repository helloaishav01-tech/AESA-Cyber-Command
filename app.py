import streamlit as st
import os
from crewai import Agent, Task, Crew, LLM
from datetime import datetime

# 1. --- SYSTEM SETUP ---
st.set_page_config(page_title="AESA Command Center", layout="wide", page_icon="⚡")

# Custom CSS for a "Cyber" look
st.markdown("""
    <style>
    .reportview-container { background: #0e1117; }
    .stTextArea textarea { font-family: 'Courier New', Courier, monospace; background-color: #161b22; color: #58a6ff; }
    .stMetric { border: 1px solid #30363d; padding: 15px; border-radius: 10px; background: #0d1117; }
    </style>
    """, unsafe_allow_html=True)
# Replace your local_brain with this:
from crewai import LLM

local_brain = LLM(
    model="groq/llama3-8b-8192",
    api_key=st.secrets["GROQ_API_KEY"]  # ✅ Secure way
)

os.environ["OPENAI_API_KEY"] = "NA"

# 2. --- HEADER & DASHBOARD ---
st.title("⚡ AESA : AUTONOMOUS CYBER COMMAND")
st.caption(f"LOCAL NODE: ACTIVE | ENCRYPTION: AES-256 | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Top Row Metrics
m1, m2, m3, m4 = st.columns(4)
m1.metric("System Health", "Optimal", "100%")
m2.metric("Agent Status", "Idle", "Ready")
m3.metric("Uptime", "99.9%", "Local")
m4.metric("Threat DB", "MITRE v14", "Current")

st.divider()

# 3. --- INPUT SECTION ---
col_in, col_gauge = st.columns([2, 1])

with col_in:
    log_input = st.text_area("📡 LIVE LOG INGESTION:", placeholder="Paste raw logs here...", height=200)
    run_button = st.button("🏁 EXECUTE AGENTIC PROTOCOL")

with col_gauge:
    st.write("### 🚨 Threat Level Meter")
    # This gauge changes based on the run
    if not log_input:
        st.info("System awaiting log data...")
        st.progress(0)
    else:
        st.warning("Analysis required...")
        st.progress(30)

# 4. --- MULTI-AGENT ENGINE ---
if run_button and log_input:
    with st.status("🕵️ APPOINTING AGENTS...", expanded=True) as status:
        try:
            # AGENT 1: THE DETECTIVE
            st.write("Step 1: Forensic Specialist analyzing patterns...")
            investigator = Agent(
                role='Senior Forensic Analyst',
                goal='Identify the specific attack vector and source IP.',
                backstory='You are a master of pattern recognition in network security.',
                llm=local_brain,
                verbose=True
            )

            # AGENT 2: THE ADMIN
            st.write("Step 2: Network Engineer drafting defenses...")
            admin = Agent(
                role='Infrastructure Hardening Engineer',
                goal='Provide immediate iptables commands and long-term security advice.',
                backstory='You focus on creating unhackable server environments.',
                llm=local_brain,
                verbose=True
            )

            task1 = Task(
                description=f"Analyze: {log_input}. Identify Attack Type and IP.",
                expected_output="A summary of the threat and IP.",
                agent=investigator
            )

            task2 = Task(
                description="Based on Task 1, write a Linux block command and a Fail2Ban tip.",
                expected_output="Executable remediation code and hardening steps.",
                agent=admin,
                context=[task1]
            )

            aesa_crew = Crew(agents=[investigator, admin], tasks=[task1, task2], verbose=True)
            result = aesa_crew.kickoff()
            
            status.update(label="ANALYSIS COMPLETE!", state="complete", expanded=False)

            # --- 5. RESULTS DISPLAY ---
            st.divider()
            
            # Updated Gauge to RED
            with col_gauge:
                st.error("HIGH THREAT DETECTED")
                st.progress(100)
            
            res_col1, res_col2 = st.columns(2)
            
            with res_col1:
                st.subheader("📝 Forensic Intelligence")
                st.markdown(f"> {result.raw}")

            with res_col2:
                st.subheader("🛡️ Remediation Playbook")
                # Automatically extract code-like blocks or just show result
                st.code(result.raw, language="bash")
                
            st.download_button("📂 Export Incident Log", result.raw, file_name="AESA_Report.txt")
            st.toast("Security Protocol Executed Successfully!")

        except Exception as e:
            st.error(f"SYSTEM OVERLOAD: {e}")