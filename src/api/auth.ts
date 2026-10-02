import type {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  User,
  VerifyEmailPayload,
} from "../types/api";
import { useAuthStore } from "../store/authStore";
import client from "./client";

function storeAuth(response: AuthResponse): AuthTokens {
  const auth = response.data;
  useAuthStore.getState().setAuth(auth);
  return auth;
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const response = await client.post<AuthResponse>("/api/auth/login", payload);
  return storeAuth(response.data);
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await client.post<RegisterResponse>(
    "/api/auth/register",
    payload,
  );
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await client.get<ApiResponse<User>>("/api/auth/me");
  return response.data.data;
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<User> {
  const response = await client.post<ApiResponse<User>>(
    "/api/auth/verify-email",
    payload,
  );
  return response.data.data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<null> {
  const response = await client.post<ApiResponse<null>>(
    "/api/auth/forgot-password",
    payload,
  );
  return response.data.data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<User> {
  const response = await client.post<ApiResponse<User>>(
    "/api/auth/reset-password",
    payload,
  );
  return response.data.data;
}
