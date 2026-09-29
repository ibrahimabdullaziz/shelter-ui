import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCurrencies } from "../api/catalog";
import {
  cancelBooking,
  confirmBooking,
  listHostBookings,
  listMyBookings,
  rejectBooking,
} from "../api/bookings";
import { useCurrentUserQuery } from "../hooks/useAuthQueries";
import { useUnitQuery } from "../hooks/useUnitsQuery";
import { formatCurrency } from "../components/features/bookings/bookingDateUtils";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import type { Booking, Currency } from "../types/api";

type BookingActionsMode = "guest" | "host";

interface MyBookingCardProps {
  booking: Booking;
  currencies: Currency[];
  actionsMode: BookingActionsMode;
}

function BookingActions({
  booking,
  mode,
}: {
  booking: Booking;
  mode: BookingActionsMode;
}) {
  const queryClient = useQueryClient();
  const refreshBookings = () =>
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking.id),
    onSuccess: refreshBookings,
  });
  const confirmMutation = useMutation({
    mutationFn: () => confirmBooking(booking.id),
    onSuccess: refreshBookings,
  });
  const rejectMutation = useMutation({
    mutationFn: () => rejectBooking(booking.id),
    onSuccess: refreshBookings,
  });

  const isPending =
    cancelMutation.isPending ||
    confirmMutation.isPending ||
    rejectMutation.isPending;
  const buttonStyle = {
    minHeight: "38px",
    padding: "0 12px",
    border: "1px solid #b9c9c2",
    borderRadius: "4px",
    background: "#fff",
    color: "#173b34",
    cursor: isPending ? "wait" : "pointer",
  };

  if (mode === "guest" && ["PENDING", "CONFIRMED"].includes(booking.status)) {
    return (
      <div style={{ marginTop: "16px" }}>
        <button
          type="button"
          style={buttonStyle}
          disabled={isPending}
          onClick={() => cancelMutation.mutate()}
        >
          {cancelMutation.isPending ? "Cancelling..." : "Cancel booking"}
        </button>
        {cancelMutation.isError && (
          <p role="alert" style={{ color: "#a43129" }}>
            {getApiErrorMessage(cancelMutation.error)}
          </p>
        )}
      </div>
    );
  }

  if (mode === "host" && booking.status === "PENDING") {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <button
          type="button"
          style={buttonStyle}
          disabled={isPending}
          onClick={() => confirmMutation.mutate()}
        >
          {confirmMutation.isPending ? "Confirming..." : "Confirm"}
        </button>
        <button
          type="button"
          style={buttonStyle}
          disabled={isPending}
          onClick={() => rejectMutation.mutate()}
        >
          {rejectMutation.isPending ? "Rejecting..." : "Reject"}
        </button>
        {confirmMutation.isError && (
          <p role="alert" style={{ flexBasis: "100%", color: "#a43129" }}>
            {getApiErrorMessage(confirmMutation.error)}
          </p>
        )}
        {rejectMutation.isError && (
          <p role="alert" style={{ flexBasis: "100%", color: "#a43129" }}>
            {getApiErrorMessage(rejectMutation.error)}
          </p>
        )}
      </div>
    );
  }

  return null;
}

function MyBookingCard({
  booking,
  currencies,
  actionsMode,
}: MyBookingCardProps) {
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
      <BookingActions booking={booking} mode={actionsMode} />
    </article>
  );
}

export default function MyBookingsPage() {
  const currentUserQuery = useCurrentUserQuery();
  const canManageBookings = ["HOST", "ADMIN"].includes(
    currentUserQuery.data?.role ?? "GUEST",
  );
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: listMyBookings,
    staleTime: 30_000,
  });
  const hostBookingsQuery = useQuery({
    queryKey: ["bookings", "host"],
    queryFn: listHostBookings,
    enabled: canManageBookings,
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

      <section aria-labelledby="my-bookings-title">
        <h2 id="my-bookings-title" style={{ color: "#173b34" }}>
          Your bookings
        </h2>
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
                actionsMode="guest"
              />
            ))}
          </div>
        )}
      </section>

      {canManageBookings && (
        <section
          aria-labelledby="host-bookings-title"
          style={{ marginTop: "32px" }}
        >
          <h2 id="host-bookings-title" style={{ color: "#173b34" }}>
            Requests for your units
          </h2>
          {hostBookingsQuery.isLoading ? (
            <p role="status">Loading booking requests...</p>
          ) : hostBookingsQuery.isError ? (
            <div role="alert">
              <p>Booking requests could not be loaded.</p>
              <button
                type="button"
                onClick={() => void hostBookingsQuery.refetch()}
              >
                Retry
              </button>
            </div>
          ) : !hostBookingsQuery.data?.length ? (
            <p>No booking requests for your units.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {hostBookingsQuery.data.map((booking) => (
                <MyBookingCard
                  key={booking.id}
                  booking={booking}
                  currencies={currencies}
                  actionsMode="host"
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
