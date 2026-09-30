import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../../api/bookings";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { CreateBookingPayload } from "../../../types/api";
import { bookingKeys } from "../../../queries/bookingKeys";
import {
  calculateBookingPrice,
  formatCurrency,
  getBookingDateErrors,
  getLocalDateToday,
  getTomorrow,
  isDateRangeValid,
  parseDateOnlyUtc,
  toApiDateOnly,
} from "./bookingDateUtils";
import { useLocalToday } from "./useLocalToday";

interface UseBookingFormOptions {
  unitId: string;
  pricePerNight: number;
  currencyCode?: string;
}

export function useBookingForm({
  unitId,
  pricePerNight,
  currencyCode,
}: UseBookingFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { today, refreshToday } = useLocalToday();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const bookingMutation = useMutation({
    mutationKey: bookingKeys.create(),
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: async (booking) => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      navigate(`/bookings/${booking.id}/confirmation`, {
        state: { booking, currencyCode },
      });
    },
  });

  const checkOutTime = parseDateOnlyUtc(checkOut);
  const { checkInError, checkOutError } = getBookingDateErrors(
    checkIn,
    checkOut,
    today,
  );
  const priceError =
    !Number.isFinite(pricePerNight) || pricePerNight < 0
      ? "Price is unavailable. Booking cannot be submitted."
      : "";
  const validRange = Boolean(
    unitId &&
      isDateRangeValid(checkIn, checkOut, today) &&
      !checkInError &&
      !checkOutError &&
      !priceError,
  );
  const { nights, totalPrice } = calculateBookingPrice(
    checkIn,
    checkOut,
    pricePerNight,
  );

  const handleCheckInChange = (nextCheckIn: string) => {
    const nextCheckInTime = parseDateOnlyUtc(nextCheckIn);
    if (
      nextCheckInTime !== null &&
      checkOutTime !== null &&
      nextCheckInTime >= checkOutTime
    ) {
      setCheckOut("");
    }
    setCheckIn(nextCheckIn);
    refreshToday();
    bookingMutation.reset();
  };

  const handleCheckOutChange = (nextCheckOut: string) => {
    setCheckOut(nextCheckOut);
    refreshToday();
    bookingMutation.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentToday = getLocalDateToday();
    refreshToday();

    const apiCheckIn = toApiDateOnly(checkIn);
    const apiCheckOut = toApiDateOnly(checkOut);
    if (
      !unitId ||
      priceError ||
      !isDateRangeValid(checkIn, checkOut, currentToday) ||
      !apiCheckIn ||
      !apiCheckOut
    ) {
      return;
    }

    bookingMutation.mutate({
      unitId,
      checkIn: apiCheckIn,
      checkOut: apiCheckOut,
    });
  };

  return {
    checkIn,
    checkOut,
    today,
    checkInError,
    checkOutError,
    priceError,
    validRange,
    nights,
    formattedTotal: formatCurrency(totalPrice, currencyCode),
    isPending: bookingMutation.isPending,
    isError: bookingMutation.isError,
    errorMessage: bookingMutation.isError
      ? getApiErrorMessage(bookingMutation.error)
      : "",
    refreshToday,
    handleCheckInChange,
    handleCheckOutChange,
    handleSubmit,
    getCheckOutMin: () =>
      checkIn && checkIn >= today ? getTomorrow(checkIn) : today,
  };
}