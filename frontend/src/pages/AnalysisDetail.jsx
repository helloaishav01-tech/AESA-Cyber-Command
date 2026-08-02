import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../lib/api";
import AnalysisResults from "../components/AnalysisResults";
import DynamicBackground from "../components/DynamicBackground";

export default function AnalysisDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/analyze/${id}`)
      .then(({ data }) => setResult(data))
      .catch(() => setError("Could not load this analysis."));
  }, [id]);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <DynamicBackground severity={result?.severity || "safe"} />
      <Link to="/history" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </Link>

      {error && <p className="text-status-critical text-sm">{error}</p>}
      {!error && !result && <p className="text-text-secondary text-sm">Loading...</p>}
      {result && <AnalysisResults result={result} />}
    </div>
  )
}
