import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  const expiresAt = Cookies.get("token_expires_at");

  if (expiresAt && dayjs().isAfter(dayjs(expiresAt))) {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("token_expires_at");
    window.location.href = "/login";
    throw new Error("Token expired");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
