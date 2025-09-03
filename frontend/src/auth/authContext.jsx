import * as React from "react";
import { apiLogin, apiMe } from "../api/services/auth";
import { setAuthToken } from "../api/httpClient";
import { setFileAuthToken } from "../api/fileClient";

const AuthCtx = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(() => localStorage.getItem("auth_token") || "");
  const [profile, setProfile] = React.useState(null);

  // 1) Define loadMe first
  const loadMe = React.useCallback(async () => {
    if (!localStorage.getItem("auth_token")) {
      setProfile(null);
      return null;
    }
    try {
      const res = await apiMe(); // GET auth/me (Bearer attached by httpClient)
      setProfile(res);
      return res;
    } catch {
      // token invalid/expired → clean up
      localStorage.removeItem("auth_token");
      setAuthToken("");
      setFileAuthToken("");
      setToken("");
      setProfile(null);
      return null;
    }
  }, []);

  // 2) Boot-time/me refresh when token changes
  React.useEffect(() => {
    if (token) {
      // ensure both clients know the token on reload
      setAuthToken(token);
      setFileAuthToken(token);
      loadMe();
    } else {
      setProfile(null);
    }
  }, [token, loadMe]);

  // 3) Login uses loadMe
  const login = React.useCallback(
    async ({ identifier, password }) => {
      const { access_token } = await apiLogin({ identifier, password });
      localStorage.setItem("auth_token", access_token);
      setAuthToken(access_token);
      setFileAuthToken(access_token);
      setToken(access_token);
      return loadMe();
    },
    [loadMe]
  );

  const logout = React.useCallback(() => {
    localStorage.removeItem("auth_token");
    setAuthToken("");
    setFileAuthToken("");
    setToken("");
    setProfile(null);
  }, []);

  const displayName =
    profile?.person?.display_name ||
    profile?.user?.name ||
    profile?.user?.user_name ||
    profile?.user?.email ||
    "";

  const value = React.useMemo(
    () => ({ token, profile, login, logout, reloadMe: loadMe, displayName }),
    [token, profile, login, logout, loadMe, displayName]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider/>");
  return ctx;
}
