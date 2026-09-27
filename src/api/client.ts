import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
});

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
      url.includes("/auth/login") || url.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    let newAccessToken: string;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        "/auth/refresh",
        undefined,
        {
          baseURL: client.defaults.baseURL,
          withCredentials: true,
        },
      );
      newAccessToken = data.accessToken;
      useAuthStore.getState().setAccessToken(newAccessToken);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }

    originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

    return client(originalRequest);
  },
);
