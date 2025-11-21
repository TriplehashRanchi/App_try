import { registerForPushNotificationsAsync } from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native"; // also missing

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// YOUR BACKEND URL
const API_BASE_URL = "https://8xkbnlt0-5050.inc1.devtunnels.ms/api";

const TOKEN_KEY = "rmclub_jwt";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create axios instance with auth header
  const axiosAuth = useCallback(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  }, [token]);

  useEffect(() => {
  const savePushToken = async () => {
    if (!user || !token) return;

    console.log("🔄 Registering push token for logged in user:", user.id);

    const expoPushToken = await registerForPushNotificationsAsync();
    if (!expoPushToken) return;

    console.log("📲 Expo Push Token:", expoPushToken);

    try {
      await axiosAuth().post("/device/register", {
        expoPushToken,
        platform: Platform.OS,
      });

      console.log("✅ Push token saved successfully");
    } catch (err) {
      console.log("❌ Failed to save push token:", err.response?.data || err.message);
    }
  };

  savePushToken();
}, [user, token]);


  // Restore token + fetch /auth/me
useEffect(() => {
  const init = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (savedToken) {
        setToken(savedToken);

        try {
          const res = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          console.log("AUTH/ME RESULT:", res.data);
          setUser(res.data);

        } catch (err) {
          console.log("Token invalid:", err?.response?.data || err.message);
          await AsyncStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  init();
}, []);


  // LOGIN FUNCTION
const login = async (username, password) => {
  console.log("LOGIN CALL:", username);

  const res = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });

  console.log("LOGIN RESPONSE:", res.data);

  const jwt = res.data.token;
  const userObj = res.data.user;

  // Save token
  await AsyncStorage.setItem(TOKEN_KEY, jwt);

  // Set state
  setToken(jwt);
  setUser(userObj);

  console.log("STATE UPDATED. USER:", userObj);

  return userObj; // ⭐ required for redirect
};


  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
        axiosAuth,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
