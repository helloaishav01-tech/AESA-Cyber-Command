import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Check, Star } from "lucide-react";

const PLANS = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    tagline: "For trying it out",
    features: [
      "5 log analyses / month",
      "Threat classification & timeline",
      "MITRE ATT&CK mapping",
      "Basic remediation commands",
    ],
    recommended: false,
  },
  {
    name: "Standard",
    price: "$19",
    period: "/month",
    tagline: "For active solo devs & small teams",
    features: [
      "100 log analyses / month",
      "Everything in Basic",
      "AbuseIPDB threat intelligence",
      "Real-time critical email alerts",
      "Downloadable PDF reports",
      "Full analysis history",
    ],
    recommended: true,
  },
  {
    name: "Premium",
    price: "$49",
    period: "/month",
    tagline: "For agencies managing multiple clients",
    features: [
      "Unlimited log analyses",
      "Everything in Standard",
      "Priority AI processing",
      "Multiple team members",
      "Priority support",
    ],
    recommended: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-status-safe" />
          <span className="font-sans font-bold tracking-tight">AESA</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary px-3 py-2">
            Sign In
          </Link>
          <Link to="/register" className="text-sm bg-status-safe text-bg-base font-semibold px-4 py-2 rounded-lg hover:bg-status-safe/90">
            Get Started
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-sans text-4xl font-bold tracking-tight mb-4">Simple, honest pricing</h1>
          <p className="text-text-secondary">
            Start free. Upgrade when you actually need more — no surprise limits, no lock-in.
          </p>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`relative rounded-lg p-6 border flex flex-col transition-all duration-300 ${
              plan.recommended
                ? "bg-status-safe/5 border-status-safe/50 md:-translate-y-3 shadow-lg shadow-status-safe/20 hover:shadow-2xl hover:shadow-status-safe/40 hover:border-status-safe"
                : "bg-surface border-white/10 hover:border-white/30"
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-status-safe text-bg-base text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-bg-base" /> Recommended
              </div>
            )}

            <h3 className="font-sans text-lg font-bold mb-1">{plan.name}</h3>
            <p className="text-text-secondary text-xs mb-4">{plan.tagline}</p>

            <div className="mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-text-secondary text-sm">{plan.period}</span>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-status-safe flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                plan.recommended
                  ? "bg-status-safe text-bg-base hover:bg-status-safe/90"
                  : "bg-bg-base border border-white/10 hover:border-white/30"
              }`}
            >
              {plan.price === "Free" ? "Start Free" : "Get Started"}
            </Link>
          </motion.div>
        ))}
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-text-secondary">
        AESA — Autonomous Enterprise Security Agent
      </footer>
    </div>
  )
}




