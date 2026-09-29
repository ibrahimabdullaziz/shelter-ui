import type { BookingStatus } from "../../../types/api";
import { getBookingStatusLabel, getBookingStatusTone } from "./bookingStatus";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const tone = getBookingStatusTone(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: "26px",
        padding: "0 9px",
        borderRadius: "999px",
        background: tone.background,
        color: tone.color,
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {getBookingStatusLabel(status)}
    </span>
  );
}
