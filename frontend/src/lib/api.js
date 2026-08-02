import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the auth cookie automatically on every request
  headers: { "Content-Type": "application/json" },
});

export function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(" ");
  return String(detail);
}

export default api;
