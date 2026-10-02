import type { BookingStatus } from "../../../types/api";

export type BookingActor = "guest" | "host";
export type BookingAction = "cancel" | "confirm" | "reject";

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export function getBookingStatusLabel(status: BookingStatus): string {
  return bookingStatusLabels[status];
}

export function getAvailableBookingActions(
  status: BookingStatus,
  actor: BookingActor,
): BookingAction[] {
  if (actor === "guest" && status === "PENDING") {
    return ["cancel"];
  }

  if (actor === "host" && status === "PENDING") {
    return ["confirm", "reject"];
  }

  return [];
}
