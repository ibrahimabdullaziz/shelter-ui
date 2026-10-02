import { Link } from "react-router-dom";
import { useCurrentUserQuery } from "../../hooks/useAuthQueries";
import { useAuthStore } from "../../store/authStore";

export function Footer() {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useCurrentUserQuery().data;
  const isAuthenticated = authStatus === "authenticated" && Boolean(user);
  const canHost = user?.role === "HOST";
  const canAccessBookings = user?.role === "GUEST" || user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand-block">
          <Link className="site-brand" to="/" aria-label="Shelter home">
            shelter<span>.</span>
          </Link>
          <p>Find a place that feels like yours.</p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer navigation">
          <Link to="/">Explore stays</Link>
          {isAuthenticated ? (
            <>
              {canAccessBookings && <Link to="/bookings">My bookings</Link>}
              {user?.role === "GUEST" && <Link to="/favorites">Favorites</Link>}
              {canHost && <Link to="/host">Host dashboard</Link>}
              {isAdmin && <Link to="/admin">Admin</Link>}
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
          )}
        </nav>

        <p className="site-footer-copyright">
          © {new Date().getFullYear()} Shelter
        </p>
      </div>
    </footer>
  );
}
