import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { Booking } from "../../../types/api";
import { Button } from "../../ui/Button";
import type { BookingActor, BookingAction } from "./bookingStatus";
import { useBookingActions } from "./useBookingActions";

interface BookingActionsProps {
  booking: Booking;
  actor: BookingActor;
}

const actionConfig: Record<
  BookingAction,
  { label: string; variant: "primary" | "danger" }
> = {
  cancel: { label: "Cancel booking", variant: "danger" },
  confirm: { label: "Confirm", variant: "primary" },
  reject: { label: "Reject", variant: "danger" },
};

export function BookingActions({ booking, actor }: BookingActionsProps) {
  const { availableActions, isPending, error, runAction } = useBookingActions(
    booking.id,
    booking.status,
    actor,
  );
  if (!availableActions.length && !isPending && !error) return null;

  return (
    <div className="booking-actions">
      {isPending && <p role="status">Updating booking...</p>}
      {availableActions.map((action) => {
        const { label, variant } = actionConfig[action];

        return (
          <Button
            key={action}
            type="button"
            variant={variant}
            size="small"
            disabled={isPending || !availableActions.includes(action)}
            onClick={() => runAction(action)}
          >
            {label}
          </Button>
        );
      })}
      {error != null && (
        <p className="ui-feedback ui-feedback--error" role="alert">
          {getApiErrorMessage(error)}
        </p>
      )}
    </div>
  );
}
