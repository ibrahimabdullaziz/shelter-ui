import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "../../types/api";
import { useCurrentUserQuery } from "../../hooks/useAuthQueries";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.authStatus);
  const currentUserQuery = useCurrentUserQuery();

  if (authStatus === "initializing") {
    return (
      <main aria-busy="true" aria-live="polite">
        Checking your session...
      </main>
    );
  }

  if (authStatus === "error") {
    return (
      <main role="alert">
        Your session could not be verified. Please retry the session check.
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const user = currentUserQuery.data;
  if (!user) {
    return (
      <main aria-busy="true" aria-live="polite">
        Loading your account...
      </main>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
