import { Link } from "react-router-dom";

interface BookingWidgetErrorProps {
  onRetry: () => void;
}

export function BookingWidgetError({ onRetry }: BookingWidgetErrorProps) {
  return (
    <section
      role="alert"
      style={{
        marginTop: "24px",
        padding: "20px",
        border: "1px solid #f1d6d1",
        borderRadius: "8px",
        background: "#fff5f4",
        color: "#7a2b25",
      }}
    >
      <h2 style={{ margin: "0 0 8px" }}>Booking is unavailable</h2>
      <p style={{ margin: "0 0 12px" }}>
        This booking section encountered a problem. The rest of the listing is
        still available.
      </p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>{" "}
      <Link to="/bookings">View your bookings</Link>
    </section>
  );
}
