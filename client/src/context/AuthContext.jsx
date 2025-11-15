import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ===========================
  // Auto-login on first load
  // ===========================
  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true);

        const res = await API.get("/user/me");

        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }

      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  // ===========================
  // Refresh after profile update
  // ===========================
  const refreshUser = async () => {
    try {
      setLoading(true);

      const res = await API.get("/user/me");

      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }

    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
