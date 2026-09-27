import type {
  ApiResponse,
  Booking,
  CreateBookingPayload,
  UpdateBookingPayload,
} from "../types/api";
import client from "./client";

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const response = await client.post<ApiResponse<Booking>>(
    "/api/bookings",
    payload,
  );
  return response.data.data;
}

export async function updateBooking(
  id: string,
  payload: UpdateBookingPayload,
): Promise<Booking> {
  const response = await client.patch<ApiResponse<Booking>>(
    `/api/bookings/${id}`,
    payload,
  );
  return response.data.data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const response = await client.delete<ApiResponse<Booking>>(
    `/api/bookings/${id}`,
  );
  return response.data.data;
}

export async function confirmBooking(id: string): Promise<Booking> {
  const response = await client.patch<ApiResponse<Booking>>(
    `/api/bookings/${id}/confirm`,
  );
  return response.data.data;
}

export async function rejectBooking(id: string): Promise<Booking> {
  const response = await client.patch<ApiResponse<Booking>>(
    `/api/bookings/${id}/reject`,
  );
  return response.data.data;
}

export async function listMyBookings(): Promise<Booking[]> {
  const response =
    await client.get<ApiResponse<Booking[]>>("/api/bookings/mine");
  return response.data.data;
}

export async function listHostBookings(): Promise<Booking[]> {
  const response =
    await client.get<ApiResponse<Booking[]>>("/api/bookings/host");
  return response.data.data;
}
