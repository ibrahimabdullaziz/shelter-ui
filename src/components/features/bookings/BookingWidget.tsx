import { useMutation } from "@tanstack/react-query";
import { useId, useState, type FormEvent } from "react";
import { createBooking } from "../../../api/bookings";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { CreateBookingPayload } from "../../../types/api";
import { BookingDateField } from "./BookingDateField";
import { BookingPriceSummary } from "./BookingPriceSummary";
import {
  calculateBookingPrice,
  formatCurrency,
  getBookingDateErrors,
  getLocalDateToday,
  getTomorrow,
  isDateRangeValid,
  parseDateOnlyUtc,
  toApiDateOnly,
} from "./bookingDateUtils";
import { useLocalToday } from "./useLocalToday";

interface BookingWidgetProps {
  unitId: string;
  pricePerNight: number;
  currencyCode?: string;
}

export function BookingWidget({
  unitId,
  pricePerNight,
  currencyCode,
}: BookingWidgetProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const checkInErrorId = `${id}-check-in-error`;
  const checkOutErrorId = `${id}-check-out-error`;
  const { today, refreshToday } = useLocalToday();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const bookingMutation = useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
  });

  const checkOutTime = parseDateOnlyUtc(checkOut);
  const { checkInError, checkOutError } = getBookingDateErrors(
    checkIn,
    checkOut,
    today,
  );
  const priceError =
    !Number.isFinite(pricePerNight) || pricePerNight < 0
      ? "Price is unavailable. Booking cannot be submitted."
      : "";
  const validRange = Boolean(
    unitId &&
    isDateRangeValid(checkIn, checkOut, today) &&
    !checkInError &&
    !checkOutError &&
    !priceError,
  );
  const { nights, totalPrice } = calculateBookingPrice(
    checkIn,
    checkOut,
    pricePerNight,
  );
  const formattedTotal = formatCurrency(totalPrice, currencyCode);

  const handleCheckInChange = (nextCheckIn: string) => {
    const nextCheckInTime = parseDateOnlyUtc(nextCheckIn);
    if (
      nextCheckInTime !== null &&
      checkOutTime !== null &&
      nextCheckInTime >= checkOutTime
    ) {
      setCheckOut("");
    }
    setCheckIn(nextCheckIn);
    refreshToday();
    bookingMutation.reset();
  };

  const handleCheckOutChange = (nextCheckOut: string) => {
    setCheckOut(nextCheckOut);
    refreshToday();
    bookingMutation.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentToday = getLocalDateToday();
    refreshToday();

    const apiCheckIn = toApiDateOnly(checkIn);
    const apiCheckOut = toApiDateOnly(checkOut);
    if (
      !unitId ||
      priceError ||
      !isDateRangeValid(checkIn, checkOut, currentToday) ||
      !apiCheckIn ||
      !apiCheckOut
    ) {
      return;
    }

    bookingMutation.mutate({
      unitId,
      checkIn: apiCheckIn,
      checkOut: apiCheckOut,
    });
  };

  return (
    <section
      aria-labelledby={titleId}
      style={{
        marginTop: "24px",
        padding: "20px",
        border: "1px solid #dfe6e3",
        borderRadius: "8px",
        background: "#fff",
      }}
    >
      <h2 id={titleId} style={{ margin: "0 0 16px", color: "#173b34" }}>
        Choose your dates
      </h2>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <BookingDateField
            label="Check-in"
            value={checkIn}
            min={today}
            error={checkInError}
            errorId={checkInErrorId}
            disabled={bookingMutation.isPending}
            onFocus={refreshToday}
            onChange={handleCheckInChange}
          />
          <BookingDateField
            label="Check-out"
            value={checkOut}
            min={checkIn && checkIn >= today ? getTomorrow(checkIn) : today}
            error={checkOutError}
            errorId={checkOutErrorId}
            disabled={bookingMutation.isPending}
            onFocus={refreshToday}
            onChange={handleCheckOutChange}
          />
        </div>

        {priceError && (
          <p role="alert" style={{ color: "#a43129" }}>
            {priceError}
          </p>
        )}

        {validRange && (
          <BookingPriceSummary nights={nights} total={formattedTotal} />
        )}

        <button
          type="submit"
          disabled={!validRange || bookingMutation.isPending}
          style={{
            minHeight: "42px",
            padding: "0 16px",
            border: 0,
            borderRadius: "4px",
            background: "#1f594c",
            color: "#fff",
            cursor:
              validRange && !bookingMutation.isPending
                ? "pointer"
                : "not-allowed",
            opacity: validRange && !bookingMutation.isPending ? 1 : 0.65,
          }}
        >
          {bookingMutation.isPending ? "Submitting..." : "Request booking"}
        </button>

        {bookingMutation.isError && (
          <p role="alert" style={{ color: "#a43129" }}>
            {getApiErrorMessage(bookingMutation.error)}
          </p>
        )}
        {bookingMutation.isSuccess && (
          <p role="status" style={{ color: "#1f594c" }}>
            Booking request submitted. Status: {bookingMutation.data.status}.
          </p>
        )}
      </form>
    </section>
  );
}
