import { useQuery } from "@tanstack/react-query";
import { listCurrencies } from "../api/catalog";
import { listHostBookings } from "../api/bookings";
import {
  formatBookingDate,
  formatCurrency,
} from "../components/features/bookings/bookingDateUtils";
import { BookingActions } from "../components/features/bookings/BookingActions";
import { BookingStatusBadge } from "../components/features/bookings/BookingStatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { catalogKeys } from "../queries/catalogKeys";
import { bookingKeys } from "../queries/bookingKeys";
import { useUnitQuery } from "../hooks/useUnitsQuery";
import type { Booking, Currency } from "../types/api";

export default function HostBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: bookingKeys.host(),
    queryFn: listHostBookings,
    staleTime: 30_000,
  });
  const currenciesQuery = useQuery({
    queryKey: catalogKeys.currencies(),
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });
  const bookings = bookingsQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];

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
      {currenciesQuery.isError && (
        <QueryErrorState
          error={currenciesQuery.error}
          onRetry={() => void currenciesQuery.refetch()}
        />
      )}
      {bookingsQuery.isLoading ? (
        <p role="status">Loading booking requests...</p>
      ) : bookingsQuery.isError ? (
        <QueryErrorState
          error={bookingsQuery.error}
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="▤"
          title="No booking requests"
          description="Guest requests for your units will appear here."
        />
      ) : (
        <div className="host-booking-list">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              currencies={currencies}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BookingRow({
  booking,
  currencies,
}: {
  booking: Booking;
  currencies: Currency[];
}) {
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
  const unitTitle =
    unit?.title ??
    (isUnitLoading ? "Loading listing..." : "Listing details unavailable");

  return (
    <article className="host-booking-card ui-surface">
      <div className="host-booking-card-heading">
        <div>
          <p className="host-booking-label">Guest request</p>
          <h3>{unitTitle}</h3>
          <p className="host-booking-reference">Booking {booking.id}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      {isUnitError && (
        <QueryErrorState error={unitError} onRetry={() => void refetchUnit()} />
      )}
      <dl className="host-booking-facts">
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
          <dt>Total</dt>
          <dd>{formatCurrency(Number(booking.totalPrice), currencyCode)}</dd>
        </div>
      </dl>
      <div className="host-booking-actions">
        <BookingActions booking={booking} actor="host" />
      </div>
    </article>
  );
}
