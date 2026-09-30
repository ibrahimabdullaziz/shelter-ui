import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { Booking } from "../../../types/api";
import type { BookingActor, BookingAction } from "./bookingStatus";
import { useBookingActions } from "./useBookingActions";

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
  const { availableActions, isPending, error, runAction } = useBookingActions(
    booking.id,
    booking.status,
    actor,
  );
  if (!availableActions.length && !isPending && !error) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "16px",
      }}
    >
      {isPending && <p role="status">Updating booking...</p>}
      {availableActions.map((action) => {
        const label = actionLabels[action];

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
      {error != null && (
        <p role="alert" style={{ flexBasis: "100%", color: "#a43129" }}>
          {getApiErrorMessage(error)}
        </p>
      )}
    </div>
  );
}
