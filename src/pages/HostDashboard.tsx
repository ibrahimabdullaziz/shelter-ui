import { Link, NavLink, Outlet } from "react-router-dom";
import "./HostDashboard.css";

const hostNavigation = [
  { to: "/host", label: "Overview", end: true },
  { to: "/host/units", label: "My Units", end: false },
  { to: "/host/bookings", label: "Bookings", end: false },
];

export default function HostDashboard() {
  return (
    <div className="host-dashboard">
      <header className="host-header">
        <div>
          <p className="host-kicker">Shelter / Host</p>
          <h1>Host dashboard</h1>
        </div>
        <Link className="host-marketplace-link" to="/units">
          Browse marketplace
        </Link>
      </header>
      <div className="host-layout">
        <nav className="host-nav" aria-label="Host dashboard">
          {hostNavigation.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `host-nav-link${isActive ? " is-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="host-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
