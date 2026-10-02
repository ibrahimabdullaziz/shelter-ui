import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  useCurrentUserQuery,
  useLogoutMutation,
} from "../../hooks/useAuthQueries";
import { useAuthStore } from "../../store/authStore";

export function Navbar() {
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const isMenuOpen = menuPath === pathname;
  const authStatus = useAuthStore((state) => state.authStatus);
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const user = currentUserQuery.data;
  const isAuthenticated = authStatus === "authenticated" && Boolean(user);
  const canHost = user?.role === "HOST" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuPath(null);
        menuToggleRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setMenuPath(null);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/" aria-label="Shelter home">
          shelter<span>.</span>
        </Link>

        <button
          ref={menuToggleRef}
          className={`site-menu-toggle${isMenuOpen ? " is-open" : ""}`}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          aria-controls="site-header-menu"
          onClick={() => setMenuPath(isMenuOpen ? null : pathname)}
        >
          <span className="site-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div
          className={`site-header-menu${isMenuOpen ? " is-open" : ""}`}
          id="site-header-menu"
        >
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink
              className={({ isActive }) =>
                `site-nav-link${isActive ? " is-active" : ""}`
              }
              end
              to="/"
              onClick={closeMenu}
            >
              Explore stays
            </NavLink>
            {isAuthenticated && (
              <NavLink
                className={({ isActive }) =>
                  `site-nav-link${isActive ? " is-active" : ""}`
                }
                to="/bookings"
                onClick={closeMenu}
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
                onClick={closeMenu}
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
                onClick={closeMenu}
              >
                Host dashboard
              </NavLink>
            )}
            {isAuthenticated && isAdmin && (
              <NavLink
                className={({ isActive }) =>
                  `site-nav-link${isActive ? " is-active" : ""}`
                }
                to="/admin"
                onClick={closeMenu}
              >
                Admin
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
                <Link className="site-nav-link" to="/login" onClick={closeMenu}>
                  Sign in
                </Link>
                <Link
                  className="site-nav-join"
                  to="/register"
                  onClick={closeMenu}
                >
                  Join Shelter
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
