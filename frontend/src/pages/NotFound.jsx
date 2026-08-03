import { Link } from "react-router-dom";
import { Shield, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Shield className="w-12 h-12 text-status-safe/40 mx-auto mb-6" />
        <p className="font-mono text-status-safe text-sm mb-2">ERROR 404</p>
        <h1 className="font-sans text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-text-secondary text-sm mb-8">
          This page doesn't exist, or it moved. Let's get you back somewhere useful.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-status-safe text-bg-base font-semibold px-5 py-2.5 rounded-lg hover:bg-status-safe/90 transition-colors"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
