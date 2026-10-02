interface BookingPriceSummaryProps {
  nights: number;
  total: string;
}

export function BookingPriceSummary({
  nights,
  total,
}: BookingPriceSummaryProps) {
  return (
    <div className="booking-price-summary">
      <span>
        {nights} {nights === 1 ? "night" : "nights"}
      </span>
      <strong>Estimated total: {total}</strong>
    </div>
  );
}
