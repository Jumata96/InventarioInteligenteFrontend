import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7231";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("email");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const msg = err?.response?.data?.message || err.message;
    console.error("API error:", msg);

    return Promise.reject(err);
  }
);

export default api;
