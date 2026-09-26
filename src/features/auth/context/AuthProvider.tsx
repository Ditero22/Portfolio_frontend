import { useState, type ReactNode } from "react";

import type { AuthUser } from "../../../types/auth";
import { AuthContext } from "./AuthContext";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "../services/authStorage";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    getAccessToken() ? { role: "admin" } : null,
  );
  const isBootstrapping = false;

  function login(authUser: AuthUser, accessToken?: string) {
    setUser(authUser);

    if (accessToken) {
      saveAccessToken(accessToken);
    }
  }

  function logout() {
    clearAccessToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isBootstrapping,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
