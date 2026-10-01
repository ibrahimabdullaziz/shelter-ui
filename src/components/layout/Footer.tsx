import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function Footer() {
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = authStatus === "authenticated";

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
            <Link to="/bookings">My bookings</Link>
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
