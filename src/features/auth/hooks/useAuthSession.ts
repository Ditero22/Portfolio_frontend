import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthSession must be used inside an AuthProvider");
  }

  return context;
}
