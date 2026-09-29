import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import type { RefreshPayload, RefreshResponse } from "../types/api";
import { clearAuthSession } from "../lib/clearAuthSession";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.LOCAL_API_URL,
});

let refreshPromise: Promise<string> | null = null;

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig | undefined;
    const url = originalRequest?.url ?? "";
    const isAuthEndpoint =
      /\/api\/auth\/(?:login|register|refresh|verify-email|forgot-password|reset-password)(?:\?|$)/.test(
        url,
      );

    if (error.response?.status !== 401 || !originalRequest || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthSession({ redirect: true });
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      clearAuthSession({ redirect: true });
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      const payload: RefreshPayload = { token: refreshToken };
      refreshPromise = axios
        .post<RefreshResponse>("/api/auth/refresh", payload, {
          baseURL: client.defaults.baseURL,
        })
        .then(({ data }) => {
          useAuthStore.getState().setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          return data.accessToken;
        })
        .catch((refreshError: unknown) => {
          clearAuthSession({ redirect: true });
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    let newAccessToken: string;

    try {
      newAccessToken = await refreshPromise;
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }

    originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

    return client(originalRequest);
  },
);

export default client;
