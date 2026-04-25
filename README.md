# AESA: Autonomous Enterprise Security Agent (2026 Edition)

## 🚀 Overview
AESA is a high-performance, privacy-first security automation tool. It uses a **Multi-Agent System (MAS)** to analyze system logs in real-time, identify threats, and suggest mitigation strategies without sending data to the cloud.

## 🛠️ Tech Stack
* **Brain:** Llama 3 (Local via Ollama) - *Zero API Costs*
* **Orchestration:** CrewAI (Agentic Framework)
* **Interface:** Streamlit (Python-based Dashboard)
* **Security Focus:** Zero Trust & eBPF Observability

## 🛡️ Why This Matters
Traditional Security Operations Centers (SOCs) suffer from "Alert Fatigue." AESA solves this by:
1. **Machine-Speed Response:** Analyzing logs faster than humanly possible.
2. **Privacy-Preserving:** Runs 100% locally; sensitive enterprise logs never leave the infrastructure.
3. **Agentic Logic:** Unlike simple rules, the agent understands *intent* and *context*.

## 🚦 How to Run
1. Install [Ollama](https://ollama.com) and run `ollama pull llama3`.
2. Clone this repo and install requirements: `pip install crewai streamlit`.
3. Launch the dashboard: `streamlit run app.py`.