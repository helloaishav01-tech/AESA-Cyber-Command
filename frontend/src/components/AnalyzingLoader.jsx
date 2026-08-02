import { useState, useEffect } from "react";
import { Search, Wrench, Globe, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { icon: Search, label: "Forensic analyst investigating the log data..." },
  { icon: Globe, label: "Cross-checking source IP against threat intelligence..." },
  { icon: Wrench, label: "Generating remediation commands..." },
  { icon: Sparkles, label: "Finalizing report..." },
];

export default function AnalyzingLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stage = STAGES[stageIndex];
  const Icon = stage.icon;

  return (
    <div className="bg-surface border border-white/10 rounded-lg p-8 flex flex-col items-center text-center" data-testid="analyzing-loader">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 border-2 border-status-safe/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-status-safe border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-5 h-5 text-status-safe" />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-text-secondary"
        >
          {stage.label}
        </motion.p>
      </AnimatePresence>
      <p className="text-xs text-text-secondary/60 mt-3">This usually takes 10-30 seconds</p>
    </div>
  )
}
