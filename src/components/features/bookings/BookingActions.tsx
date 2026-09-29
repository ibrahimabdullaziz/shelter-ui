import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  confirmBooking,
  rejectBooking,
} from "../../../api/bookings";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { Booking } from "../../../types/api";
import {
  getAvailableBookingActions,
  type BookingActor,
  type BookingAction,
} from "./bookingStatus";

interface BookingActionsProps {
  booking: Booking;
  actor: BookingActor;
}

const actionLabels: Record<BookingAction, string> = {
  cancel: "Cancel booking",
  confirm: "Confirm",
  reject: "Reject",
};

export function BookingActions({ booking, actor }: BookingActionsProps) {
  const queryClient = useQueryClient();
  const availableActions = getAvailableBookingActions(booking.status, actor);
  const refreshBookings = () =>
    queryClient.invalidateQueries({ queryKey: ["bookings"] });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking.id),
    onSuccess: refreshBookings,
  });
  const confirmMutation = useMutation({
    mutationFn: () => confirmBooking(booking.id),
    onSuccess: refreshBookings,
  });
  const rejectMutation = useMutation({
    mutationFn: () => rejectBooking(booking.id),
    onSuccess: refreshBookings,
  });

  const mutations = {
    cancel: cancelMutation,
    confirm: confirmMutation,
    reject: rejectMutation,
  };
  const isPending = Object.values(mutations).some(
    (mutation) => mutation.isPending,
  );
  const actionErrors = availableActions.flatMap((action) => {
    const mutation = mutations[action];
    return mutation.isError ? [getApiErrorMessage(mutation.error)] : [];
  });

  if (!availableActions.length) return null;

  const runAction = (action: BookingAction) => {
    if (!availableActions.includes(action) || isPending) return;
    mutations[action].mutate();
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "16px",
      }}
    >
      {availableActions.map((action) => {
        const mutation = mutations[action];
        const label =
          action === "cancel" && mutation.isPending
            ? "Cancelling..."
            : action === "confirm" && mutation.isPending
              ? "Confirming..."
              : action === "reject" && mutation.isPending
                ? "Rejecting..."
                : actionLabels[action];

        return (
          <button
            key={action}
            type="button"
            disabled={isPending || !availableActions.includes(action)}
            onClick={() => runAction(action)}
            style={{
              minHeight: "38px",
              padding: "0 12px",
              border: "1px solid #b9c9c2",
              borderRadius: "4px",
              background: "#fff",
              color: "#173b34",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            {label}
          </button>
        );
      })}
      {actionErrors.map((message, index) => (
        <p
          key={`${message}-${index}`}
          role="alert"
          style={{ flexBasis: "100%", color: "#a43129" }}
        >
          {message}
        </p>
      ))}
    </div>
  );
}
