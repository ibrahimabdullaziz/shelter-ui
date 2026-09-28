import { authQueryKeys } from "../queries/authKeys";
import { queryClient } from "./queryClient";
import { useAuthStore } from "../store/authStore";

interface ClearAuthSessionOptions {
  redirect?: boolean;
}

export function clearAuthSession({
  redirect = false,
}: ClearAuthSessionOptions = {}): void {
  const state = useAuthStore.getState();
  const shouldRedirect =
    redirect &&
    (state.authStatus !== "unauthenticated" ||
      Boolean(state.accessToken || state.refreshToken));

  state.logout();
  void queryClient.cancelQueries({ queryKey: authQueryKeys.currentUser });
  void queryClient.invalidateQueries({
    queryKey: authQueryKeys.currentUser,
    refetchType: "none",
  });
  queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });

  if (shouldRedirect && typeof window !== "undefined") {
    window.location.assign("/login");
  }
}
