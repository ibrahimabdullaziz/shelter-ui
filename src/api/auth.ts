import type { AuthResponse, LoginPayload } from "../types/api";
import client from "./client";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/auth/login", payload);
  return response.data;
}
