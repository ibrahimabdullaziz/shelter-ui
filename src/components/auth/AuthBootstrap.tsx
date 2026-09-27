import { isAxiosError } from "axios";
import { useEffect, type ReactNode } from "react";
import { useCurrentUserQuery } from "../../hooks/useAuthQueries";
import { useAuthStore } from "../../store/authStore";

interface AuthBootstrapProps {
  children: ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const authStatus = useAuthStore((state) => state.authStatus);
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);
  const currentUserQuery = useCurrentUserQuery();

  useEffect(() => {
    if (!hasHydrated) {
      setAuthStatus("initializing");
      return;
    }

    if (!accessToken && !refreshToken) {
      setAuthStatus("unauthenticated");
      return;
    }

    if (currentUserQuery.isSuccess) {
      setAuthStatus("authenticated");
      return;
    }

    if (currentUserQuery.isRefetchError && currentUserQuery.data) {
      setAuthStatus("authenticated");
      return;
    }

    if (currentUserQuery.isError) {
      const status = isAxiosError(currentUserQuery.error)
        ? currentUserQuery.error.response?.status
        : undefined;
      setAuthStatus(
        status === 401 || status === 403 ? "unauthenticated" : "error",
      );
      return;
    }

    setAuthStatus("initializing");
  }, [
    accessToken,
    currentUserQuery.data,
    currentUserQuery.error,
    currentUserQuery.isError,
    currentUserQuery.isRefetchError,
    currentUserQuery.isSuccess,
    hasHydrated,
    refreshToken,
    setAuthStatus,
  ]);

  if (authStatus === "initializing") {
    return (
      <main aria-busy="true" aria-live="polite">
        Checking your session...
      </main>
    );
  }

  if (authStatus === "error") {
    return (
      <main role="alert">
        <p>We could not check your session.</p>
        <button
          type="button"
          onClick={() => {
            setAuthStatus("initializing");
            void currentUserQuery.refetch();
          }}
        >
          Retry
        </button>
      </main>
    );
  }

  return children;
}
