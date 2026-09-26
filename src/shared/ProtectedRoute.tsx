import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "../features/auth/hooks/useAuthSession";
import type { Role } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isBootstrapping } = useAuthSession();

  if (isBootstrapping) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}
