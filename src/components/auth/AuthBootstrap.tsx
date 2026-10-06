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
        status === 401
          ? "unauthenticated"
          : status === 403
            ? "forbidden"
            : "error",
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

  const isChecking = authStatus === "initializing";
  const hasError = authStatus === "error";

  return (
    <>
      {(isChecking || hasError) && (
        <div
          className={`session-status-banner${hasError ? " is-error" : ""}`}
          role={hasError ? "alert" : "status"}
          aria-live={hasError ? "assertive" : "polite"}
          aria-busy={isChecking}
        >
          <span className="session-status-indicator" aria-hidden="true" />
          <span>
            {isChecking
              ? "Checking your session"
              : "We could not check your session."}
          </span>
          {hasError && (
            <button
              className="session-status-retry"
              type="button"
              onClick={() => {
                setAuthStatus("initializing");
                void currentUserQuery.refetch();
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
      {children}
    </>
  );
}
