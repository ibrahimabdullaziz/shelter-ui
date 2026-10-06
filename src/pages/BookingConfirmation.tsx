import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { listMyBookings } from "../api/bookings";
import { listCurrencies } from "../api/catalog";
import { useUnitQuery } from "../hooks/useUnitsQuery";
import {
  calculateBookingPrice,
  formatBookingDate,
  parseDateOnlyUtc,
} from "../components/features/bookings/bookingDateUtils";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { PageTransition } from "../components/ui/PageTransition";
import { BookingStatusBadge } from "../components/features/bookings/BookingStatusBadge";
import { bookingKeys } from "../queries/bookingKeys";
import { catalogKeys } from "../queries/catalogKeys";
import type { Booking } from "../types/api";

interface BookingConfirmationState {
  booking?: Booking;
  currencyCode?: string;
}

function formatBookingTotal(
  totalPrice: number | string,
  currencyCode?: string,
): string {
  const amount = Number(totalPrice);
  if (!Number.isFinite(amount)) return "Amount unavailable";
  if (!currencyCode) return amount.toFixed(2);

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

function normalizeBookingDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const dateOnly = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return undefined;
  if (value.length > 10 && !Number.isFinite(Date.parse(value))) {
    return undefined;
  }
  return parseDateOnlyUtc(dateOnly) === null ? undefined : dateOnly;
}

function getValidBooking(
  value: unknown,
  expectedId?: string,
): Booking | undefined {
  if (!value || typeof value !== "object") return undefined;

  const booking = value as Partial<Booking>;
  if (
    !expectedId ||
    booking.id !== expectedId ||
    typeof booking.unitId !== "string" ||
    !booking.unitId ||
    typeof booking.guestId !== "string" ||
    !booking.guestId
  ) {
    return undefined;
  }

  if (
    booking.status !== "PENDING" &&
    booking.status !== "CONFIRMED" &&
    booking.status !== "REJECTED" &&
    booking.status !== "CANCELLED" &&
    booking.status !== "COMPLETED"
  ) {
    return undefined;
  }

  const checkIn = normalizeBookingDate(booking.checkIn);
  const checkOut = normalizeBookingDate(booking.checkOut);
  if (!checkIn || !checkOut) return undefined;
  const nights = calculateBookingPrice(checkIn, checkOut, 1).nights;
  const totalPrice = Number(booking.totalPrice);
  if (
    nights <= 0 ||
    !Number.isFinite(totalPrice) ||
    totalPrice < 0 ||
    (typeof booking.totalPrice !== "number" &&
      typeof booking.totalPrice !== "string")
  ) {
    return undefined;
  }

  return {
    id: booking.id,
    unitId: booking.unitId,
    guestId: booking.guestId,
    checkIn,
    checkOut,
    totalPrice: booking.totalPrice,
    status: booking.status,
  };
}

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as BookingConfirmationState | null;
  const bookingFromState = getValidBooking(state?.booking, id);

  const bookingsQuery = useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: listMyBookings,
    enabled: Boolean(id && !bookingFromState),
    retry: false,
  });

  const bookingFromApi = bookingsQuery.data
    ?.map((item) => getValidBooking(item, id))
    .find((item) => item !== undefined);
  const booking = bookingFromState ?? bookingFromApi;
  const {
    data: unit,
    isLoading: isUnitLoading,
    isError: isUnitError,
    error: unitError,
    refetch: refetchUnit,
  } = useUnitQuery(booking?.unitId ?? "");
  const currenciesQuery = useQuery({
    queryKey: catalogKeys.currencies(),
    queryFn: listCurrencies,
    enabled: Boolean(unit?.currencyId),
    staleTime: 5 * 60_000,
  });

  if (!booking && bookingsQuery.isLoading) {
    return (
      <main className="route-state" aria-live="polite">
        Loading booking confirmation...
      </main>
    );
  }

  if (!booking && bookingsQuery.isError) {
    return (
      <main className="route-state">
        <QueryErrorState
          error={bookingsQuery.error}
          onRetry={() => void bookingsQuery.refetch()}
        />
        <Link to="/bookings">View your bookings</Link>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="route-state">
        <h1>Booking not found</h1>
        <p>The booking data is missing or invalid.</p>
        <Link to="/bookings">View your bookings</Link>
      </main>
    );
  }

  const currencyCode =
    state?.currencyCode ??
    currenciesQuery.data?.find((currency) => currency.id === unit?.currencyId)
      ?.code;
  const amount = formatBookingTotal(booking.totalPrice, currencyCode);
  const nights = calculateBookingPrice(
    booking.checkIn,
    booking.checkOut,
    1,
  ).nights;
  const unitName =
    unit?.title ??
    (isUnitLoading ? "Loading unit..." : `Unit ${booking.unitId}`);

  return (
    <PageTransition>
      <main className="unit-confirmation-page">
      <section
        className="unit-confirmation-card ui-surface"
        aria-labelledby="booking-confirmation-title"
      >
        <h1 id="booking-confirmation-title">Booking confirmation</h1>
        {booking.status === "PENDING" && (
          <p className="booking-confirmation-message" role="status">
            Your request has been sent to the host. You’ll see an update here
            after they review it.
          </p>
        )}
        <p className="unit-confirmation-status">
          <span>Booking status</span>
          <BookingStatusBadge status={booking.status} />
        </p>
        <dl className="unit-confirmation-facts">
          <div>
            <dt>Unit</dt>
            <dd>
              <Link to={`/units/${booking.unitId}`}>{unitName}</Link>
            </dd>
          </div>
          <div>
            <dt>Confirmation</dt>
            <dd>{booking.id}</dd>
          </div>
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
            <dt>Number of nights</dt>
            <dd>{nights}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{amount}</dd>
          </div>
        </dl>
        {isUnitError && (
          <QueryErrorState
            error={unitError}
            onRetry={() => void refetchUnit()}
          />
        )}
        <Link to={`/units/${booking.unitId}`}>Return to the listing</Link>
      </section>
      </main>
    </PageTransition>
  );
}
