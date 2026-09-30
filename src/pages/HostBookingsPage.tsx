import { useQuery } from "@tanstack/react-query";
import { listHostBookings } from "../api/bookings";
import { BookingActions } from "../components/features/bookings/BookingActions";
import { BookingStatusBadge } from "../components/features/bookings/BookingStatusBadge";
import { bookingKeys } from "../queries/bookingKeys";
import type { Booking } from "../types/api";

export default function HostBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: bookingKeys.host(),
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
        <BookingStatusBadge status={booking.status} />
        <BookingActions booking={booking} actor="host" />
      </div>
    </article>
  );
}
