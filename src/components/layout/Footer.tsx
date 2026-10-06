import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand-block">
          <Link className="site-brand" to="/" aria-label="Shelter home">
            shelter<span>.</span>
          </Link>
          <p>Stays that feel like yours.</p>
        </div>
        <p className="site-footer-note">Find a place for your next getaway.</p>
        <p className="site-footer-copyright">
          © {new Date().getFullYear()} Shelter
        </p>
      </div>
    </footer>
  );
}
