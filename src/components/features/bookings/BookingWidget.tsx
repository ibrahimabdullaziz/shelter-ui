import { useId } from "react";
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

      <form onSubmit={bookingForm.handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
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
          <p role="alert" style={{ color: "#a43129" }}>
            {bookingForm.priceError}
          </p>
        )}

        {bookingForm.validRange && (
          <BookingPriceSummary
            nights={bookingForm.nights}
            total={bookingForm.formattedTotal}
          />
        )}

        <button
          type="submit"
          disabled={!bookingForm.validRange || bookingForm.isPending}
          style={{
            minHeight: "42px",
            padding: "0 16px",
            border: 0,
            borderRadius: "4px",
            background: "#1f594c",
            color: "#fff",
            cursor:
              bookingForm.validRange && !bookingForm.isPending
                ? "pointer"
                : "not-allowed",
            opacity:
              bookingForm.validRange && !bookingForm.isPending ? 1 : 0.65,
          }}
        >
          {bookingForm.isPending ? "Submitting..." : "Request booking"}
        </button>

        {bookingForm.isError && (
          <p role="alert" style={{ color: "#a43129" }}>
            {bookingForm.errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}
