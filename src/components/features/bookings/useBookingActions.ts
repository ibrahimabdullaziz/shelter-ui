import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  cancelBooking,
  confirmBooking,
  rejectBooking,
} from "../../../api/bookings";
import type { Booking, BookingStatus } from "../../../types/api";
import { bookingKeys } from "../../../queries/bookingKeys";
import {
  getAvailableBookingActions,
  type BookingAction,
  type BookingActor,
} from "./bookingStatus";

interface BookingActionVariables {
  bookingId: string;
  action: BookingAction;
}

interface BookingActionContext {
  snapshots: Array<[QueryKey, Booking[] | undefined]>;
}

const optimisticStatus: Record<BookingAction, BookingStatus> = {
  cancel: "CANCELLED",
  confirm: "CONFIRMED",
  reject: "REJECTED",
};

export function useBookingActions(
  bookingId: string,
  status: BookingStatus,
  actor: BookingActor,
) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    Booking,
    unknown,
    BookingActionVariables,
    BookingActionContext
  >({
    mutationKey: bookingKeys.actions(),
    mutationFn: ({ bookingId: id, action }) => {
      if (action === "cancel") return cancelBooking(id);
      if (action === "confirm") return confirmBooking(id);
      return rejectBooking(id);
    },
    onMutate: async ({ bookingId: id, action }) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.all });
      const snapshots = queryClient.getQueriesData<Booking[]>({
        queryKey: bookingKeys.lists(),
      });

      snapshots.forEach(([queryKey]) => {
        queryClient.setQueryData<Booking[]>(queryKey, (bookings) =>
          bookings?.map((booking) =>
            booking.id === id
              ? { ...booking, status: optimisticStatus[action] }
              : booking,
          ),
        );
      });

      return { snapshots };
    },
    onSuccess: (updatedBooking) => {
      queryClient.setQueriesData<Booking[]>(
        { queryKey: bookingKeys.lists() },
        (bookings) =>
          bookings?.map((booking) =>
            booking.id === updatedBooking.id
              ? { ...booking, ...updatedBooking }
              : booking,
          ),
      );
    },
    onError: (_error, { bookingId }, context) => {
      context?.snapshots.forEach(([queryKey, bookings]) => {
        const previousBooking = bookings?.find(
          (booking) => booking.id === bookingId,
        );
        if (!previousBooking) return;
        queryClient.setQueryData<Booking[]>(queryKey, (currentBookings) =>
          currentBookings?.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: previousBooking.status }
              : booking,
          ),
        );
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });

  const availableActions = getAvailableBookingActions(status, actor);
  const successMessageByAction: Record<BookingAction, string> = {
    cancel: "Booking cancelled.",
    confirm: "Booking confirmed.",
    reject: "Booking rejected.",
  };
  const successMessage =
    mutation.isSuccess && mutation.variables
      ? successMessageByAction[mutation.variables.action]
      : undefined;
  const runAction = (action: BookingAction) => {
    if (mutation.isPending || !availableActions.includes(action)) return;
    mutation.mutate({ bookingId, action });
  };

  return {
    availableActions,
    isPending: mutation.isPending,
    error: mutation.error,
    successMessage,
    runAction,
  };
}
