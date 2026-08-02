import { useState, useEffect } from "react";
import { Shield, AlertOctagon, Activity, Database } from "lucide-react";
import api from "../lib/api";

export default function StatsOverview() {
  const [stats, setStats] = useState({ total: 0, critical: 0, lastThreat: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/api/history?limit=50")
      .then(({ data }) => {
        const critical = data.filter((a) => a.severity === "critical").length;
        setStats({
          total: data.length,
          critical,
          lastThreat: data[0]?.threat_type || null,
        });
      })
      .finally(() => setLoaded(true));
  }, []);

  const cards = [
    { label: "System Health", value: "Operational", icon: Shield, color: "text-status-safe" },
    { label: "Agent Status", value: "Active", icon: Activity, color: "text-status-safe" },
    {
      label: "Critical Threats",
      value: loaded ? stats.critical : "—",
      icon: AlertOctagon,
      color: stats.critical > 0 ? "text-status-critical" : "text-status-safe",
    },
    { label: "Total Analyses", value: loaded ? stats.total : "—", icon: Database, color: "text-status-safe" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="stats-overview">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-surface border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-text-secondary uppercase tracking-wide">{card.label}</span>
            </div>
            <p className={`text-xl font-bold font-mono ${card.color}`}>{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
