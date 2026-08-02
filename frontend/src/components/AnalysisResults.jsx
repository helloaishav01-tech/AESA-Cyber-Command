import { useState } from "react";
import {
  Shield, AlertTriangle, AlertOctagon, Clock, Target,
  Gauge, Terminal, Download, Globe, CheckCircle2
} from "lucide-react";
import api from "../lib/api";

const SEVERITY_CONFIG = {
  safe: { icon: Shield, color: "text-status-safe", bg: "bg-status-safe/10", border: "border-status-safe/40" },
  warning: { icon: AlertTriangle, color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/40" },
  critical: { icon: AlertOctagon, color: "text-status-critical", bg: "bg-status-critical/10", border: "border-status-critical/40" },
};

export default function AnalysisResults({ result }) {
  const [downloading, setDownloading] = useState(false);
  const config = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.safe;
  const SeverityIcon = config.icon;

  async function handleDownload() {
    setDownloading(true);
    try {
      const response = await api.get(`/api/analyze/${result.id}/report`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `AESA_Report_${result.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4" data-testid="analysis-results">
      {/* Header: severity + threat type + download */}
      <div className={`rounded-lg border ${config.border} ${config.bg} p-5 flex items-center justify-between flex-wrap gap-4`}>
        <div className="flex items-center gap-3">
          <SeverityIcon className={`w-8 h-8 ${config.color}`} />
          <div>
            <p className={`text-xs uppercase tracking-widest font-mono ${config.color}`}>{result.severity}</p>
            <h2 className="font-sans text-xl font-bold">{result.threat_type}</h2>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm hover:border-white/30 transition-colors disabled:opacity-50"
          data-testid="download-report-button"
        >
          <Download className="w-4 h-4" />
          {downloading ? "Preparing..." : "Download PDF Report"}
        </button>
      </div>

      {/* Summary + confidence */}
      <div className="bg-surface border border-white/10 rounded-lg p-5">
        <p className="text-sm leading-relaxed mb-4">{result.forensic_summary}</p>
        <div className="flex items-center gap-2 text-xs text-text-secondary border-t border-white/10 pt-3">
          <Gauge className="w-3.5 h-3.5" />
          <span>
            <strong className="text-text-primary">{result.confidence_score}% confidence</strong> — {result.confidence_reasoning}
          </span>
        </div>
        {result.source_ip && (
          <div className="flex items-center gap-2 text-xs text-text-secondary mt-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Source IP: <strong className="text-text-primary font-mono">{result.source_ip}</strong></span>
            {result.threat_intel?.checked && (
              <span className={result.threat_intel.is_known_malicious ? "text-status-critical" : "text-status-safe"}>
                {" "}· AbuseIPDB: {result.threat_intel.is_known_malicious ? "Known malicious" : "No strong match"}
                {" "}({result.threat_intel.total_reports ?? 0} reports)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      {result.timeline?.length > 0 && (
        <div className="bg-surface border border-white/10 rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-safe" /> Attack Timeline
          </h3>
          <div className="space-y-3">
            {result.timeline.map((event, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-status-safe text-xs whitespace-nowrap pt-0.5">{event.time_estimate}</span>
                <span className="text-text-secondary">{event.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Root cause + MITRE, side by side on wider screens */}
      <div className="grid md:grid-cols-2 gap-4">
        {result.root_cause?.length > 0 && (
          <div className="bg-surface border border-white/10 rounded-lg p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Root Cause</h3>
            <ul className="space-y-2">
              {result.root_cause.map((cause, i) => (
                <li key={i} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-status-warning">•</span> {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.mitre_techniques?.length > 0 && (
          <div className="bg-surface border border-white/10 rounded-lg p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-status-safe" /> MITRE ATT&CK
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.mitre_techniques.map((t, i) => (
                <span key={i} className="px-2.5 py-1 bg-bg-base border border-white/10 rounded text-xs font-mono text-status-safe">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk score */}
      {result.risk_score && (
        <div className="bg-surface border border-white/10 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wide">Risk Score</h3>
            <span className={`font-mono font-bold ${config.color}`}>{result.risk_score.score}/100</span>
          </div>
          <div className="w-full h-2 bg-bg-base rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${result.severity === "critical" ? "bg-status-critical" : result.severity === "warning" ? "bg-status-warning" : "bg-status-safe"}`}
              style={{ width: `${result.risk_score.score}%` }}
            />
          </div>
          <ul className="space-y-1.5">
            {result.risk_score.factors?.map((f, i) => (
              <li key={i} className="text-xs text-text-secondary flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-text-secondary" /> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Remediation terminal panel */}
      {result.mitigation_commands?.length > 0 && (
        <div className="bg-black border border-status-safe/30 rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 text-status-safe">
            <Terminal className="w-4 h-4" /> Remediation Commands
          </h3>
          <div className="space-y-2 font-mono text-sm">
            {result.mitigation_commands.map((cmd, i) => (
              <div key={i} className="text-status-safe">
                <span className="text-text-secondary">$</span> {cmd}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
