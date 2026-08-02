import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <h1 className="font-sans text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-text-secondary mb-6">{user?.email}</p>
      <button
        onClick={logout}
        className="px-4 py-2 bg-status-critical/20 text-status-critical border border-status-critical/50 rounded-lg text-sm"
        data-testid="logout-button"
      >
        Logout
      </button>
    </div>
  )
}
