import { useState } from "react";

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

export function BookingWidget() {
  const today = formatLocalDate(new Date());
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

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
            onChange={(event) => setCheckIn(event.target.value)}
            aria-invalid={Boolean(checkInError)}
            aria-describedby={checkInError ? "check-in-error" : undefined}
          />
          {checkInError && (
            <span id="check-in-error" role="alert" style={{ color: "#a43129" }}>
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
            onChange={(event) => setCheckOut(event.target.value)}
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
        <p style={{ margin: "16px 0 0", color: "#1f594c" }}>
          Dates selected: {checkIn} to {checkOut}
        </p>
      )}
    </section>
  );
}
