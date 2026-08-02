import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, Target, FileText, Bell, Globe, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Clock, title: "Attack Timeline Reconstruction", desc: "See exactly what happened, in order — not a wall of raw log lines." },
  { icon: Target, title: "MITRE ATT&CK Mapping", desc: "Every threat automatically mapped to industry-standard technique IDs." },
  { icon: Globe, title: "Real Threat Intelligence", desc: "Source IPs cross-checked against AbuseIPDB — not just an AI's opinion." },
  { icon: Bell, title: "Instant Critical Alerts", desc: "The moment something's critical, you get an email. No manual checking." },
  { icon: FileText, title: "Downloadable Incident Reports", desc: "Professional PDF reports ready for compliance or client documentation." },
  { icon: Shield, title: "Threat-Specific Remediation", desc: "Real fixes for the actual attack — not generic copy-pasted commands." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-status-safe" />
          <span className="font-sans font-bold tracking-tight">AESA</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-sm text-text-secondary hover:text-text-primary px-3 py-2">
            Pricing
          </Link>
          <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary px-3 py-2">
            Sign In
          </Link>
          <Link to="/register" className="text-sm bg-status-safe text-bg-base font-semibold px-4 py-2 rounded-lg hover:bg-status-safe/90">
            Get Started
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-status-safe text-xs uppercase tracking-widest font-mono mb-4">
            AI Security Copilot for SMBs & Solo Developers
          </p>
          <h1 className="font-sans text-5xl font-bold tracking-tight mb-6 leading-tight">
            A junior SOC analyst,<br />available 24/7, that costs nothing<br />like a real one.
          </h1>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Paste your security logs. Get instant AI-powered threat classification, MITRE-mapped forensics,
            real threat intelligence, and remediation commands that actually fix the problem.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-status-safe text-bg-base font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-status-safe/90 transition-colors"
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="text-text-secondary hover:text-text-primary px-6 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-surface border border-white/10 rounded-lg p-6"
              >
                <Icon className="w-6 h-6 text-status-safe mb-3" />
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-secondary">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-text-secondary">
        AESA — Autonomous Enterprise Security Agent
      </footer>
    </div>
  )
}

