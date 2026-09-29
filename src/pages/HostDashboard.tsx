import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet } from "react-router-dom";
import { listHostBookings } from "../api/bookings";
import { listMyUnits } from "../api/units";
import { BookingActions } from "../components/features/bookings/BookingActions";
import type { Booking } from "../types/api";
import type { Unit } from "../types/api";
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

export function HostOverviewPage() {
  const unitsQuery = useQuery({
    queryKey: ["units", "mine"],
    queryFn: listMyUnits,
    staleTime: 30_000,
  });
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "host"],
    queryFn: listHostBookings,
    staleTime: 30_000,
  });

  return (
    <section
      className="host-page-section"
      aria-labelledby="host-overview-title"
    >
      <div className="host-page-heading">
        <p className="host-kicker">Your workspace</p>
        <h2 id="host-overview-title">Overview</h2>
        <p>Keep track of your listings and incoming booking requests.</p>
      </div>

      <div className="host-stat-grid">
        <Link className="host-stat" to="/host/units">
          <span className="host-stat-label">My units</span>
          <strong>
            {getQueryCount(
              unitsQuery.isLoading,
              unitsQuery.isError,
              unitsQuery.data?.length,
            )}
          </strong>
          <span className="host-stat-link">View listings</span>
        </Link>
        <Link className="host-stat" to="/host/bookings">
          <span className="host-stat-label">Pending requests</span>
          <strong>
            {getQueryCount(
              bookingsQuery.isLoading,
              bookingsQuery.isError,
              bookingsQuery.data?.filter(
                (booking) => booking.status === "PENDING",
              ).length,
            )}
          </strong>
          <span className="host-stat-link">Review bookings</span>
        </Link>
      </div>
    </section>
  );
}

export function HostUnitsPage() {
  const unitsQuery = useQuery({
    queryKey: ["units", "mine"],
    queryFn: listMyUnits,
    staleTime: 30_000,
  });
  const units = unitsQuery.data ?? [];

  return (
    <section className="host-page-section" aria-labelledby="host-units-title">
      <div className="host-page-heading">
        <p className="host-kicker">Your inventory</p>
        <h2 id="host-units-title">My Units</h2>
        <p>Manage the places you share with guests.</p>
      </div>
      {unitsQuery.isLoading ? (
        <p role="status">Loading your units...</p>
      ) : unitsQuery.isError ? (
        <div className="host-empty-state" role="alert">
          <p>Your units could not be loaded.</p>
          <button type="button" onClick={() => void unitsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : units.length === 0 ? (
        <p className="host-empty-state">You haven’t listed any units yet.</p>
      ) : (
        <div className="host-list">
          {units.map((unit) => (
            <UnitRow key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </section>
  );
}

export function HostBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "host"],
    queryFn: listHostBookings,
    staleTime: 30_000,
  });
  const bookings = bookingsQuery.data ?? [];

  return (
    <section
      className="host-page-section"
      aria-labelledby="host-bookings-title"
    >
      <div className="host-page-heading">
        <p className="host-kicker">Guest requests</p>
        <h2 id="host-bookings-title">Bookings</h2>
        <p>Review requests and keep up with upcoming stays.</p>
      </div>
      {bookingsQuery.isLoading ? (
        <p role="status">Loading booking requests...</p>
      ) : bookingsQuery.isError ? (
        <div className="host-empty-state" role="alert">
          <p>Booking requests could not be loaded.</p>
          <button type="button" onClick={() => void bookingsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <p className="host-empty-state">There are no booking requests yet.</p>
      ) : (
        <div className="host-list">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}

function getQueryCount(
  isLoading: boolean,
  isError: boolean,
  count: number | undefined,
) {
  if (isLoading) return "...";
  if (isError) return "—";
  return count ?? 0;
}

function UnitRow({ unit }: { unit: Unit }) {
  return (
    <article className="host-list-row">
      <div>
        <h3>{unit.title}</h3>
        <p>
          {unit.pricePerNight.toFixed(2)} / night · {unit.maxGuests} guests
        </p>
      </div>
      <span
        className={`host-status${unit.isActive === false ? " is-inactive" : ""}`}
      >
        {unit.isActive === false ? "Inactive" : "Active"}
      </span>
    </article>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <article className="host-list-row host-booking-row">
      <div>
        <h3>Booking {booking.id}</h3>
        <p>
          {booking.checkIn} to {booking.checkOut} · {booking.totalPrice}
        </p>
      </div>
      <div className="host-booking-actions">
        <span className="host-status">{booking.status.toLowerCase()}</span>
        <BookingActions booking={booking} actor="host" />
      </div>
    </article>
  );
}
