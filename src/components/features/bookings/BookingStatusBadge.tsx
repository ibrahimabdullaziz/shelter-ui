import type { BookingStatus } from "../../../types/api";
import { StatusBadge, type StatusBadgeTone } from "../../ui/StatusBadge";
import { getBookingStatusLabel } from "./bookingStatus";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const toneByStatus: Record<BookingStatus, StatusBadgeTone> = {
    PENDING: "warning",
    CONFIRMED: "positive",
    REJECTED: "negative",
    CANCELLED: "negative",
    COMPLETED: "info",
  };

  return (
    <StatusBadge tone={toneByStatus[status]}>
      {getBookingStatusLabel(status)}
    </StatusBadge>
  );
}
