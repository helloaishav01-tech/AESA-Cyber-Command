import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  safe: "#82D5E5",
  warning: "#FF9500",
  critical: "#FF3B30",
};

export default function DynamicBackground({ severity = "safe" }) {
  const color = COLORS[severity] || COLORS.safe;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={severity}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${color}, transparent 65%)`,
            filter: "blur(80px)",
          }}
        />
      </AnimatePresence>
    </div>
  )
}
