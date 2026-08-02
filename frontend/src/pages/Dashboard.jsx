import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Upload, History as HistoryIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DynamicBackground from "../components/DynamicBackground";
import AnalysisResults from "../components/AnalysisResults";
import AnalyzingLoader from "../components/AnalyzingLoader";
import api, { formatApiError } from "../lib/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [logContent, setLogContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleAnalyze() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/analyze", { log_content: logContent });
      setResult(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <DynamicBackground severity={result?.severity || "safe"} />

      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-status-safe" />
          <span className="font-sans font-bold tracking-tight">AESA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/history" className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5">
            <HistoryIcon className="w-4 h-4" /> History
          </Link>
          <span className="text-sm text-text-secondary">{user?.name}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-status-critical/20 text-status-critical border border-status-critical/50 rounded-lg text-sm flex items-center gap-1.5"
            data-testid="logout-button"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="font-sans text-2xl font-bold mb-6">Security Log Analysis</h1>

        <div className="bg-surface border border-white/10 rounded-lg p-6 mb-6">
          <label className="block text-sm text-text-secondary mb-2">Paste security log data</label>
          <textarea
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            rows={6}
            disabled={loading}
            className="w-full bg-bg-base border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-status-safe/50 focus:border-status-safe disabled:opacity-60"
            placeholder="Failed password for admin from 192.168.1.100 port 22 ssh2..."
            data-testid="log-content-textarea"
          />
          {error && <p className="text-status-critical text-sm mt-3" data-testid="analyze-error">{error}</p>}
          <button
            onClick={handleAnalyze}
            disabled={loading || !logContent.trim()}
            className="mt-4 w-full bg-status-safe text-bg-base font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            data-testid="analyze-button"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Analyzing..." : "Analyze Logs"}
          </button>
        </div>

        {loading && <AnalyzingLoader />}
        {!loading && result && <AnalysisResults result={result} />}
      </main>
    </div>
  )
}
