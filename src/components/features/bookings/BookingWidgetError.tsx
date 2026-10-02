import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";

interface BookingWidgetErrorProps {
  onRetry: () => void;
}

export function BookingWidgetError({ onRetry }: BookingWidgetErrorProps) {
  return (
    <section className="booking-widget-error" role="alert">
      <h2>Booking is unavailable</h2>
      <p>
        This booking section encountered a problem. The rest of the listing is
        still available.
      </p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        Retry
      </Button>{" "}
      <Link to="/bookings">View your bookings</Link>
    </section>
  );
}
