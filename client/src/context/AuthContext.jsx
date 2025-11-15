import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Auto-login check
  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true); // 🔥 IMPORTANT FIX

        const res = await API.get("/user/me");

        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null); // 🔥 CRITICAL FIX
        }

      } catch (err) {
        setUser(null); // 🔥 MUST RESET USER
      } finally {
        setLoading(false); // 🔥 MUST UNLOCK RENDER
      }
    };

    check();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
