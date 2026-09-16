import { createContext } from "react";
import type { AuthUser } from "../../../types/auth";

export interface AuthContextType {
  user: AuthUser | null;
  isBootstrapping: boolean;
  login: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);