import { Link, NavLink } from "react-router-dom";
import {
  useCurrentUserQuery,
  useLogoutMutation,
} from "../../hooks/useAuthQueries";
import { useAuthStore } from "../../store/authStore";

export function Navbar() {
  const authStatus = useAuthStore((state) => state.authStatus);
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const user = currentUserQuery.data;
  const isAuthenticated = authStatus === "authenticated" && Boolean(user);
  const canHost = user?.role === "HOST" || user?.role === "ADMIN";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/" aria-label="Shelter home">
          shelter<span>.</span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink
            className={({ isActive }) =>
              `site-nav-link${isActive ? " is-active" : ""}`
            }
            end
            to="/"
          >
            Explore stays
          </NavLink>
          {isAuthenticated && (
            <NavLink
              className={({ isActive }) =>
                `site-nav-link${isActive ? " is-active" : ""}`
              }
              to="/bookings"
            >
              My bookings
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink
              className={({ isActive }) =>
                `site-nav-link${isActive ? " is-active" : ""}`
              }
              to="/favorites"
            >
              Favorites
            </NavLink>
          )}
          {isAuthenticated && canHost && (
            <NavLink
              className={({ isActive }) =>
                `site-nav-link${isActive ? " is-active" : ""}`
              }
              to="/host"
            >
              Host dashboard
            </NavLink>
          )}
        </nav>

        <div className="site-nav-actions">
          {isAuthenticated ? (
            <>
              <span className="site-user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                className="site-nav-button"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                type="button"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link className="site-nav-link" to="/login">
                Sign in
              </Link>
              <Link className="site-nav-join" to="/register">
                Join Shelter
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
