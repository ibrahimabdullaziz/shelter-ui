import { useId } from "react";
import { Button } from "../../ui/Button";
import { formatCurrency } from "./bookingDateUtils";
import { BookingDateField } from "./BookingDateField";
import { BookingPriceSummary } from "./BookingPriceSummary";
import { useBookingForm } from "./useBookingForm";

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
  const bookingForm = useBookingForm({ unitId, pricePerNight, currencyCode });

  return (
    <section className="booking-panel ui-surface" aria-labelledby={titleId}>
      <h2 id={titleId}>Choose your dates</h2>
      <p className="booking-panel-rate">
        <strong>{formatCurrency(pricePerNight, currencyCode)}</strong>
        <span>per night</span>
      </p>

      <form onSubmit={bookingForm.handleSubmit}>
        <div className="booking-date-grid">
          <BookingDateField
            label="Check-in"
            value={bookingForm.checkIn}
            min={bookingForm.today}
            error={bookingForm.checkInError}
            errorId={checkInErrorId}
            disabled={bookingForm.isPending}
            onFocus={bookingForm.refreshToday}
            onChange={bookingForm.handleCheckInChange}
          />
          <BookingDateField
            label="Check-out"
            value={bookingForm.checkOut}
            min={bookingForm.getCheckOutMin()}
            error={bookingForm.checkOutError}
            errorId={checkOutErrorId}
            disabled={bookingForm.isPending}
            onFocus={bookingForm.refreshToday}
            onChange={bookingForm.handleCheckOutChange}
          />
        </div>

        {bookingForm.priceError && (
          <p
            className="ui-feedback ui-feedback--error booking-form-error"
            role="alert"
          >
            {bookingForm.priceError}
          </p>
        )}

        {bookingForm.validRange && (
          <BookingPriceSummary
            nights={bookingForm.nights}
            total={bookingForm.formattedTotal}
          />
        )}

        <Button
          className="booking-submit"
          type="submit"
          variant="primary"
          disabled={!bookingForm.validRange || bookingForm.isPending}
        >
          {bookingForm.isPending ? "Submitting..." : "Request booking"}
        </Button>

        {bookingForm.isError && (
          <p
            className="ui-feedback ui-feedback--error booking-form-error"
            role="alert"
          >
            {bookingForm.errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}
