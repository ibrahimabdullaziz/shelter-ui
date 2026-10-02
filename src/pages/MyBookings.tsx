import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listCurrencies } from "../api/catalog";
import { listHostBookings, listMyBookings } from "../api/bookings";
import { BookingActions } from "../components/features/bookings/BookingActions";
import { BookingStatusBadge } from "../components/features/bookings/BookingStatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { useCurrentUserQuery } from "../hooks/useAuthQueries";
import { useUnitQuery } from "../hooks/useUnitsQuery";
import {
  calculateBookingPrice,
  formatBookingDate,
  formatCurrency,
} from "../components/features/bookings/bookingDateUtils";
import { bookingKeys } from "../queries/bookingKeys";
import { catalogKeys } from "../queries/catalogKeys";
import type { Booking, Currency } from "../types/api";

type BookingActionsMode = "guest" | "host";

interface MyBookingCardProps {
  booking: Booking;
  currencies: Currency[];
  actionsMode: BookingActionsMode;
}

function MyBookingCard({
  booking,
  currencies,
  actionsMode,
}: MyBookingCardProps) {
  const {
    data: unit,
    isLoading: isUnitLoading,
    isError: isUnitError,
    error: unitError,
    refetch: refetchUnit,
  } = useUnitQuery(booking.unitId);
  const currencyCode = currencies.find(
    (currency) => currency.id === unit?.currencyId,
  )?.code;
  const total = formatCurrency(Number(booking.totalPrice), currencyCode);
  const nights = calculateBookingPrice(
    booking.checkIn,
    booking.checkOut,
    1,
  ).nights;
  const unitLabel =
    unit?.title ??
    (isUnitLoading ? "Loading unit..." : "Unit details unavailable");

  return (
    <article className="booking-card ui-surface">
      <div className="booking-card-heading">
        <div>
          <p className="booking-card-label">
            {actionsMode === "host" ? "Guest request" : "Your stay"}
          </p>
          <h3>
            <Link to={`/units/${booking.unitId}`}>{unitLabel}</Link>
          </h3>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      {isUnitError && (
        <QueryErrorState error={unitError} onRetry={() => void refetchUnit()} />
      )}

      <dl className="booking-facts">
        <div>
          <dt>Check-in</dt>
          <dd>
            <time dateTime={booking.checkIn}>
              {formatBookingDate(booking.checkIn)}
            </time>
          </dd>
        </div>
        <div>
          <dt>Check-out</dt>
          <dd>
            <time dateTime={booking.checkOut}>
              {formatBookingDate(booking.checkOut)}
            </time>
          </dd>
        </div>
        <div>
          <dt>Length of stay</dt>
          <dd>
            {nights} {nights === 1 ? "night" : "nights"}
          </dd>
        </div>
        <div>
          <dt>Total price</dt>
          <dd className="booking-facts-total">{total}</dd>
        </div>
      </dl>
      <BookingActions booking={booking} actor={actionsMode} />
    </article>
  );
}

export default function MyBookingsPage() {
  const currentUserQuery = useCurrentUserQuery();
  const canManageBookings = ["HOST", "ADMIN"].includes(
    currentUserQuery.data?.role ?? "GUEST",
  );
  const isGuest = currentUserQuery.data?.role === "GUEST";
  const bookingsQuery = useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: listMyBookings,
    enabled: isGuest,
    staleTime: 30_000,
  });
  const hostBookingsQuery = useQuery({
    queryKey: bookingKeys.host(),
    queryFn: listHostBookings,
    enabled: canManageBookings,
    staleTime: 30_000,
  });
  const currenciesQuery = useQuery({
    queryKey: catalogKeys.currencies(),
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });
  const currencies = currenciesQuery.data ?? [];

  return (
    <main className="booking-list-page">
      <header className="booking-list-heading">
        <p className="booking-list-eyebrow">YOUR TRIPS</p>
        <h1>Bookings</h1>
        <p>Review dates, totals, and the current status of each stay.</p>
      </header>
      {currenciesQuery.isError && (
        <QueryErrorState
          error={currenciesQuery.error}
          onRetry={() => void currenciesQuery.refetch()}
        />
      )}

      {isGuest && (
        <section
          className="booking-list-section"
          aria-labelledby="my-bookings-title"
        >
          <div className="booking-section-heading">
            <h2 id="my-bookings-title">Your reservations</h2>
            {bookingsQuery.data && (
              <span>{bookingsQuery.data.length} total</span>
            )}
          </div>
          {bookingsQuery.isLoading ? (
            <p role="status">Loading your bookings...</p>
          ) : bookingsQuery.isError ? (
            <QueryErrorState
              error={bookingsQuery.error}
              onRetry={() => void bookingsQuery.refetch()}
            />
          ) : !bookingsQuery.data?.length ? (
            <EmptyState
              icon="▤"
              title="No bookings yet"
              description="Your stays will appear here once you book a unit."
              action={<Link to="/units">Browse available units</Link>}
            />
          ) : (
            <div className="booking-list-grid">
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
      )}

      {canManageBookings && (
        <section
          className="booking-list-section"
          aria-labelledby="host-bookings-title"
        >
          <div className="booking-section-heading">
            <h2 id="host-bookings-title">Requests for your units</h2>
            {hostBookingsQuery.data && (
              <span>{hostBookingsQuery.data.length} total</span>
            )}
          </div>
          {hostBookingsQuery.isLoading ? (
            <p role="status">Loading booking requests...</p>
          ) : hostBookingsQuery.isError ? (
            <QueryErrorState
              error={hostBookingsQuery.error}
              onRetry={() => void hostBookingsQuery.refetch()}
            />
          ) : !hostBookingsQuery.data?.length ? (
            <EmptyState
              icon="▤"
              title="No booking requests"
              description="Guest requests for your units will appear here."
            />
          ) : (
            <div className="booking-list-grid">
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
