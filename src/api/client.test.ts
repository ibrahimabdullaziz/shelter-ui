import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login } from "./auth";
import client from "./client";
import { useAuthStore } from "../store/authStore";

const clientMock = new AxiosMockAdapter(client);
const axiosMock = new AxiosMockAdapter(axios);

const user = {
  id: "user-1",
  email: "guest@example.com",
  firstName: "Jane",
  lastName: "Doe",
  role: "GUEST" as const,
  isVerified: true,
};

beforeEach(() => {
  clientMock.reset();
  axiosMock.reset();
  useAuthStore.setState({ accessToken: null, refreshToken: null });
  vi.stubGlobal("window", { location: { assign: vi.fn() } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API authentication flow", () => {
  it("stores login tokens, refreshes an expired token, then retries the request", async () => {
    clientMock.onPost("/api/auth/login").reply(200, {
      status: 200,
      message: "User logged successfully",
      data: {
        accessToken: "expired-access-token",
        refreshToken: "valid-refresh-token",
        user,
      },
    });

    let protectedRequestCount = 0;
    clientMock.onGet("/api/auth/me").reply((config) => {
      protectedRequestCount += 1;
      const authorization = config.headers?.Authorization;

      if (protectedRequestCount === 1) {
        expect(authorization).toBe("Bearer expired-access-token");
        return [401, { success: false, message: "Access token expired" }];
      }

      expect(authorization).toBe("Bearer fresh-access-token");
      return [200, { status: 200, message: "Success", data: user }];
    });

    axiosMock.onPost("/api/auth/refresh").reply((config) => {
      expect(JSON.parse(String(config.data))).toEqual({
        token: "valid-refresh-token",
      });

      return [
        200,
        {
          status: 200,
          message: "Token refreshed successfully",
          accessToken: "fresh-access-token",
        },
      ];
    });

    const auth = await login({
      email: "guest@example.com",
      password: "StrongPass123",
    });

    expect(auth.accessToken).toBe("expired-access-token");
    expect(useAuthStore.getState().refreshToken).toBe("valid-refresh-token");

    await expect(getCurrentUser()).resolves.toEqual(user);

    expect(protectedRequestCount).toBe(2);
    expect(useAuthStore.getState().accessToken).toBe("fresh-access-token");
  });

  it("clears auth and redirects to login when refresh fails", async () => {
    useAuthStore.getState().setAuth({
      accessToken: "expired-access-token",
      refreshToken: "invalid-refresh-token",
      user,
    });

    clientMock
      .onGet("/api/bookings/mine")
      .reply(401, { success: false, message: "Access token expired" });
    axiosMock
      .onPost("/api/auth/refresh")
      .reply(403, { success: false, message: "Refresh token invalid" });

    await expect(client.get("/api/bookings/mine")).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      refreshToken: null,
    });
    expect(window.location.assign).toHaveBeenCalledWith("/login");
  });
});
