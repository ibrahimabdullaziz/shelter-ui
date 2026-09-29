interface BookingPriceSummaryProps {
  nights: number;
  total: string;
}

export function BookingPriceSummary({
  nights,
  total,
}: BookingPriceSummaryProps) {
  return (
    <p style={{ margin: "16px 0", color: "#1f594c" }}>
      {nights} {nights === 1 ? "night" : "nights"} · Estimated total: {total}
    </p>
  );
}
