import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retried && !originalRequest.url.includes("/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve) => refreshQueue.push(resolve)).then(() => api(originalRequest));
      }

      originalRequest._retried = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        refreshQueue.forEach((resolve) => resolve());
        refreshQueue = [];
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue = [];
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(" ");
  return String(detail);
}

export default api;
