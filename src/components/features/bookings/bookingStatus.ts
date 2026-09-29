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
  if (actor === "guest" && ["PENDING", "CONFIRMED"].includes(status)) {
    return ["cancel"];
  }

  if (actor === "host" && status === "PENDING") {
    return ["confirm", "reject"];
  }

  return [];
}

export function getBookingStatusTone(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return { background: "#fff2d8", color: "#79510a" };
    case "CONFIRMED":
      return { background: "#e0f2e9", color: "#1c6245" };
    case "REJECTED":
    case "CANCELLED":
      return { background: "#fbe8e5", color: "#8e3028" };
    case "COMPLETED":
      return { background: "#e7eef5", color: "#34566f" };
  }
}
