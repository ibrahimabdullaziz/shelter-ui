export type Role = "GUEST" | "HOST" | "ADMIN";
export type UserRole = Role;

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginRequest = LoginPayload;

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export type RegisterRequest = RegisterPayload;

export interface RefreshPayload {
  token: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  status: number | string;
  message: string;
  data: T;
}

export type AuthResponse = ApiResponse<AuthTokens>;

export interface RefreshResponse {
  status: number;
  message: string;
  accessToken: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  cityId: string;
  categoryId: string;
  currencyId: string;
  isActive?: boolean;
  ownerId?: string;
}

export interface UnitFilters {
  cityId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateUnitPayload {
  title: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  cityId: string;
  categoryId: string;
  currencyId: string;
}

export type UpdateUnitPayload = Partial<CreateUnitPayload>;

export interface UnitPhoto {
  id: string;
  url: string;
  publicId: string;
  unitId: string;
}

export interface Booking {
  id: string;
  unitId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
}

export interface CreateBookingPayload {
  unitId: string;
  checkIn: string;
  checkOut: string;
}

export interface UpdateBookingPayload {
  checkIn: string;
  checkOut: string;
}

export interface CreateCountryPayload {
  name: string;
  code: string;
}

export interface CreateCityPayload {
  name: string;
  countryId: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface Review {
  id: string;
  unitId: string;
  guestId: string;
  rating: number;
  comment?: string;
}

export interface Favorite {
  userId: string;
  unitId: string;
}

export interface ApiError {
  success: boolean;
  message: string;
}
