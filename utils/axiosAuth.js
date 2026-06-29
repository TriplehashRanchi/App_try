import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Keep this in sync with HOST in context/AuthContext.jsx.
// Physical device: use your Mac's current LAN IP. localhost only works on simulator/web.
export const API_BASE_URL = "http://192.168.1.19:5050/api";

// Global axios instance
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptors
axiosAuth.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("rmclub_jwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Content-Type"] = "application/json";

  return config;
});

axiosAuth.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.message === "Network Error") {
      console.log("❌ No internet or API unreachable");
    }

    if (err.response?.status === 401) {
      console.log("❌ Token expired — auto logout");
      await AsyncStorage.removeItem("rmclub_jwt");
    }

    return Promise.reject(err);
  }
);

export default axiosAuth;
