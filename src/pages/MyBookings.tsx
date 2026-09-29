import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCurrencies } from "../api/catalog";
import { listMyBookings } from "../api/bookings";
import { useUnitQuery } from "../hooks/useUnitsQuery";
import { formatCurrency } from "../components/features/bookings/bookingDateUtils";
import type { Booking, Currency } from "../types/api";

interface MyBookingCardProps {
  booking: Booking;
  currencies: Currency[];
}

function MyBookingCard({ booking, currencies }: MyBookingCardProps) {
  const { data: unit, isLoading: isUnitLoading } = useUnitQuery(booking.unitId);
  const currencyCode = currencies.find(
    (currency) => currency.id === unit?.currencyId,
  )?.code;
  const total = formatCurrency(Number(booking.totalPrice), currencyCode);
  const unitLabel =
    unit?.title ??
    (isUnitLoading ? "Loading unit..." : "Unit details unavailable");

  return (
    <article
      style={{
        padding: "18px",
        border: "1px solid #dfe6e3",
        borderRadius: "6px",
        background: "#fff",
      }}
    >
      <h2 style={{ margin: "0 0 14px", color: "#173b34", fontSize: "18px" }}>
        <Link to={`/units/${booking.unitId}`} style={{ color: "inherit" }}>
          {unitLabel}
        </Link>
      </h2>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          margin: 0,
        }}
      >
        <div>
          <dt style={{ color: "#6b7a75", fontSize: "13px" }}>Check-in</dt>
          <dd style={{ margin: "4px 0 0", color: "#34443f" }}>
            <time dateTime={booking.checkIn}>{booking.checkIn}</time>
          </dd>
        </div>
        <div>
          <dt style={{ color: "#6b7a75", fontSize: "13px" }}>Check-out</dt>
          <dd style={{ margin: "4px 0 0", color: "#34443f" }}>
            <time dateTime={booking.checkOut}>{booking.checkOut}</time>
          </dd>
        </div>
        <div>
          <dt style={{ color: "#6b7a75", fontSize: "13px" }}>Total price</dt>
          <dd style={{ margin: "4px 0 0", color: "#34443f", fontWeight: 700 }}>
            {total}
          </dd>
        </div>
        <div>
          <dt style={{ color: "#6b7a75", fontSize: "13px" }}>Status</dt>
          <dd style={{ margin: "4px 0 0", color: "#34443f" }}>
            {booking.status.toLowerCase()}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function MyBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: listMyBookings,
    staleTime: 30_000,
  });
  const { data: currencies = [] } = useQuery({
    queryKey: ["currencies"],
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ margin: "0 0 20px", color: "#173b34" }}>My bookings</h1>

      {bookingsQuery.isLoading ? (
        <p role="status">Loading your bookings...</p>
      ) : bookingsQuery.isError ? (
        <div role="alert">
          <p>Your bookings could not be loaded.</p>
          <button type="button" onClick={() => void bookingsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : !bookingsQuery.data?.length ? (
        <section aria-live="polite">
          <p>You don’t have any bookings yet.</p>
          <Link to="/units">Browse available units</Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {bookingsQuery.data.map((booking) => (
            <MyBookingCard
              key={booking.id}
              booking={booking}
              currencies={currencies}
            />
          ))}
        </div>
      )}
    </main>
  );
}
