import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createBooking } from "../../../api/bookings";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

interface BookingPrice {
  nights: number;
  totalPrice: number;
}

export function calculateBookingPrice(
  checkIn: string,
  checkOut: string,
  pricePerNight: number,
): BookingPrice {
  if (!checkIn || !checkOut || !Number.isFinite(pricePerNight)) {
    return { nights: 0, totalPrice: 0 };
  }

  const checkInTime = Date.parse(`${checkIn}T00:00:00Z`);
  const checkOutTime = Date.parse(`${checkOut}T00:00:00Z`);
  if (
    !Number.isFinite(checkInTime) ||
    !Number.isFinite(checkOutTime) ||
    new Date(checkInTime).toISOString().slice(0, 10) !== checkIn ||
    new Date(checkOutTime).toISOString().slice(0, 10) !== checkOut ||
    checkOutTime <= checkInTime
  ) {
    return { nights: 0, totalPrice: 0 };
  }

  const nights = (checkOutTime - checkInTime) / 86_400_000;
  return { nights, totalPrice: nights * pricePerNight };
}

interface BookingWidgetProps {
  unitId: string;
  pricePerNight: number;
  currencyCode?: string;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrow(dateValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  return formatLocalDate(new Date(year, month - 1, day + 1));
}

export function BookingWidget({
  unitId,
  pricePerNight,
  currencyCode,
}: BookingWidgetProps) {
  const today = formatLocalDate(new Date());
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const bookingMutation = useMutation({
    mutationFn: () => createBooking({ unitId, checkIn, checkOut }),
  });

  const checkInError =
    checkIn && checkIn < today ? "Check-in cannot be in the past." : "";
  const checkOutError =
    checkOut && checkOut < today
      ? "Check-out cannot be in the past."
      : checkIn && checkOut && checkOut <= checkIn
        ? "Check-out must be after check-in."
        : "";
  const validRange = Boolean(
    checkIn && checkOut && !checkInError && !checkOutError,
  );
  const { nights, totalPrice } = calculateBookingPrice(
    checkIn,
    checkOut,
    pricePerNight,
  );
  const formattedTotal = currencyCode
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      }).format(totalPrice)
    : `${totalPrice.toFixed(2)} (currency unavailable)`;

  const resetBookingState = () => bookingMutation.reset();

  return (
    <section
      aria-labelledby="booking-widget-title"
      style={{
        marginTop: "24px",
        padding: "20px",
        border: "1px solid #dfe6e3",
        borderRadius: "8px",
        background: "#fff",
      }}
    >
      <h2
        id="booking-widget-title"
        style={{ margin: "0 0 16px", color: "#173b34" }}
      >
        Choose your dates
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (validRange) bookingMutation.mutate();
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <label style={{ display: "grid", gap: "6px", color: "#34443f" }}>
            <span>Check-in</span>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(event) => {
                setCheckIn(event.target.value);
                resetBookingState();
              }}
              aria-invalid={Boolean(checkInError)}
              aria-describedby={checkInError ? "check-in-error" : undefined}
            />
            {checkInError && (
              <span
                id="check-in-error"
                role="alert"
                style={{ color: "#a43129" }}
              >
                {checkInError}
              </span>
            )}
          </label>

          <label style={{ display: "grid", gap: "6px", color: "#34443f" }}>
            <span>Check-out</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn && checkIn >= today ? getTomorrow(checkIn) : today}
              onChange={(event) => {
                setCheckOut(event.target.value);
                resetBookingState();
              }}
              aria-invalid={Boolean(checkOutError)}
              aria-describedby={checkOutError ? "check-out-error" : undefined}
            />
            {checkOutError && (
              <span
                id="check-out-error"
                role="alert"
                style={{ color: "#a43129" }}
              >
                {checkOutError}
              </span>
            )}
          </label>
        </div>

        {validRange && (
          <p style={{ margin: "16px 0", color: "#1f594c" }}>
            {nights} {nights === 1 ? "night" : "nights"} · Estimated total:{" "}
            {formattedTotal}
          </p>
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
