import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUserQuery } from "../../hooks/useAuthQueries";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../types/api";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.authStatus);
  const currentUserQuery = useCurrentUserQuery();

  if (authStatus === "initializing") {
    return (
      <div className="session-route-message" aria-hidden="true" />
    );
  }

  if (authStatus === "error") {
    return (
      <div className="session-route-message" role="alert">
        This page is unavailable until your session can be verified.
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (authStatus === "forbidden") {
    return <Navigate to="/403" replace />;
  }

  const user = currentUserQuery.data;
  if (!user) {
    return (
      <div className="session-route-message" aria-busy="true" role="status">
        Preparing your page…
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}