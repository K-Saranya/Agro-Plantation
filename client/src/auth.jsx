import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { apiError } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((response) => setUser(response.data.data))
      .catch(() => localStorage.removeItem("agro_token"))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(email, password) {
        const response = await api.post("/auth/login", { email, password });
        const payload = response.data.data;
        localStorage.setItem("agro_token", payload.token);
        setUser(payload.user);
        return payload.user;
      },
      async register(form) {
        const response = await api.post("/auth/addnew", form);
        const payload = response.data.data;
        localStorage.setItem("agro_token", payload.token);
        setUser(payload.user);
        return payload.user;
      },
      async updateProfile(form) {
        const response = await api.post(`/auth/update/${user.id}`, form);
        setUser(response.data.data);
        return response.data.data;
      },
      logout() {
        localStorage.removeItem("agro_token");
        setUser(null);
      },
      error: apiError,
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
