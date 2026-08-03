import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, AlertOctagon, ArrowLeft, Clock, ChevronRight, Search } from "lucide-react";
import api from "../lib/api";

const SEVERITY_ICON = { safe: Shield, warning: AlertTriangle, critical: AlertOctagon };
const SEVERITY_COLOR = { safe: "text-status-safe", warning: "text-status-warning", critical: "text-status-critical" };

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data } = await api.get("/api/history?limit=50");
      setAnalyses(data);
    } catch {
      setError("Could not load history. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = analyses.filter((a) => {
    const matchesSearch =
      !search ||
      a.threat_type.toLowerCase().includes(search.toLowerCase()) ||
      a.forensic_summary?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="font-sans text-2xl font-bold mb-6">Analysis History</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by threat type or summary..."
            className="w-full bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-status-safe/50 focus:border-status-safe"
            data-testid="history-search-input"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-status-safe/50"
          data-testid="history-severity-filter"
        >
          <option value="all">All Severities</option>
          <option value="safe">Safe</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading && <p className="text-text-secondary text-sm">Loading...</p>}
      {error && <p className="text-status-critical text-sm">{error}</p>}

      {!loading && analyses.length === 0 && (
        <div className="bg-surface border border-white/10 rounded-lg p-8 text-center text-text-secondary text-sm">
          No analyses yet. Run your first one from the Dashboard.
        </div>
      )}

      {!loading && analyses.length > 0 && filtered.length === 0 && (
        <div className="bg-surface border border-white/10 rounded-lg p-8 text-center text-text-secondary text-sm">
          No results match your search or filter.
        </div>
      )}

      <div className="space-y-3" data-testid="history-list">
        {filtered.map((a) => {
          const Icon = SEVERITY_ICON[a.severity] || Shield;
          const color = SEVERITY_COLOR[a.severity] || "text-status-safe";
          return (
            <Link
              key={a._id}
              to={`/history/${a._id}`}
              className="bg-surface border border-white/10 rounded-lg p-4 flex items-center gap-4 hover:border-white/30 transition-colors"
            >
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
              <ChevronRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
