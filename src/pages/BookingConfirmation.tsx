import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { listMyBookings } from "../api/bookings";
import type { Booking } from "../types/api";

interface BookingConfirmationState {
  booking?: Booking;
  currencyCode?: string;
}

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as BookingConfirmationState | null;
  const bookingFromState =
    state?.booking?.id === id ? state?.booking : undefined;

  const bookingsQuery = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: listMyBookings,
    enabled: Boolean(id && !bookingFromState),
    retry: false,
  });

  const booking =
    bookingFromState ?? bookingsQuery.data?.find((item) => item.id === id);

  if (!booking && bookingsQuery.isLoading) {
    return (
      <main className="route-state" aria-live="polite">
        Loading booking confirmation...
      </main>
    );
  }

  if (!booking && bookingsQuery.isError) {
    return (
      <main className="route-state" role="alert">
        <p>We could not load this booking confirmation.</p>
        <Link to="/bookings">View your bookings</Link>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="route-state">
        <h1>Booking not found</h1>
        <p>This booking may no longer be available.</p>
        <Link to="/bookings">View your bookings</Link>
      </main>
    );
  }

  const amount = state?.currencyCode
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: state.currencyCode,
      }).format(booking.totalPrice)
    : booking.totalPrice.toFixed(2);

  return (
    <main className="route-state">
      <section aria-labelledby="booking-confirmation-title">
        <h1 id="booking-confirmation-title">Booking request submitted</h1>
        <p>Your booking is currently {booking.status.toLowerCase()}.</p>
        <dl>
          <div>
            <dt>Confirmation</dt>
            <dd>{booking.id}</dd>
          </div>
          <div>
            <dt>Check-in</dt>
            <dd>{booking.checkIn}</dd>
          </div>
          <div>
            <dt>Check-out</dt>
            <dd>{booking.checkOut}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{amount}</dd>
          </div>
        </dl>
        <Link to={`/units/${booking.unitId}`}>Return to the listing</Link>
      </section>
    </main>
  );
}
