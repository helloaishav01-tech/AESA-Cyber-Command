import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, AlertOctagon, ArrowLeft, Clock } from "lucide-react";
import api from "../lib/api";

const SEVERITY_ICON = { safe: Shield, warning: AlertTriangle, critical: AlertOctagon };
const SEVERITY_COLOR = { safe: "text-status-safe", warning: "text-status-warning", critical: "text-status-critical" };

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data } = await api.get("/api/history?limit=20");
      setAnalyses(data);
    } catch {
      setError("Could not load history. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="font-sans text-2xl font-bold mb-6">Analysis History</h1>

      {loading && <p className="text-text-secondary text-sm">Loading...</p>}
      {error && <p className="text-status-critical text-sm">{error}</p>}

      {!loading && analyses.length === 0 && (
        <div className="bg-surface border border-white/10 rounded-lg p-8 text-center text-text-secondary text-sm">
          No analyses yet. Run your first one from the Dashboard.
        </div>
      )}

      <div className="space-y-3" data-testid="history-list">
        {analyses.map((a) => {
          const Icon = SEVERITY_ICON[a.severity] || Shield;
          const color = SEVERITY_COLOR[a.severity] || "text-status-safe";
          return (
            <div key={a._id} className="bg-surface border border-white/10 rounded-lg p-4 flex items-center gap-4">
              <Icon className={`w-6 h-6 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{a.threat_type}</p>
                  <span className={`text-xs uppercase font-mono ${color}`}>{a.severity}</span>
                </div>
                <p className="text-xs text-text-secondary truncate">{a.forensic_summary}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary flex-shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(a.timestamp).toLocaleDateString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
