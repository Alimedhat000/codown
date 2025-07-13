import axios from "axios";
import { getAccessToken } from "@/utils/token";

export const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
