# Authentication architecture

This implementation uses a layered, token-based auth architecture:

1. Zustand holds session mechanics: tokens, hydration state, and a small auth-status state machine (`initializing`, `authenticated`, `unauthenticated`, `forbidden`, `error`).
2. TanStack Query holds server truth: the current user from `/api/auth/me`, including loading, error, and cache behavior.
3. Axios enforces transport concerns: attaches access tokens, refreshes expired ones once, and retries the failed request.
4. Route guards enforce UI access: first authentication, then optional role checks.

The key design choice is that a token alone does not mean “authenticated.” The app treats the server-validated current-user query as the proof of an active session.

## User-facing authentication flows

- Sign in and registration remain available at `/login` and `/register`.
- Successful registration opens `/verify-email` with the submitted email prefilled. Users can also open the route directly and enter their email and six-digit code; verification is not enforced as a sign-in gate.
- Password recovery starts at `/forgot-password`, which requests a reset code. The user enters the email, code, and new password at `/reset-password`.
- Forms display field validation, pending, API error, and success feedback. A successful password reset returns the user to sign in; verification also links back to sign in.
- Verification and recovery use the API operations in the OpenAPI contract. Eligibility and delivery details remain server-owned; the UI does not infer them.

## Zustand vs. TanStack Query

Zustand is for client session state, not remote user data:

- Access token: persisted in local storage with the session state.
- Refresh token: persisted across reloads and used by the Axios refresh flow.
- Hydration and auth status: coordinates startup and routing.
- Imperative access via `useAuthStore.getState()` lets Axios interceptors read and update tokens outside React.

TanStack Query is for server state:

- Fetches and caches `/auth/me`.
- Represents the canonical signed-in user and their role.
- Re-fetches after login and registration.
- Removes stale user data on logout or session failure.

This separation prevents two sources of truth. Zustand knows whether the browser has usable session credentials; Query knows who the server says the user is.

## Auth bootstrap and hydration

Both tokens are included in the persisted Zustand state. On app reload:

1. Zustand hydrates the persisted refresh token.
2. The app remains in `initializing` until hydration completes.
3. `AuthBootstrap` checks whether any token exists:
   - none → `unauthenticated`
   - token(s) exist → fetch `/auth/me`
4. If the access token is missing or expired, the current-user request receives a `401`, which triggers refresh automatically.
5. A successful `/me` response establishes `authenticated`.

Rendering waits for hydration before mounting, and the bootstrap component also guards the transitional state. That avoids the classic “redirect to login for one frame, then restore the session” bug.

## Token refresh flow

The Axios client owns refresh behavior centrally:

```text
request:
  attach current access token, if present

response 401 from a protected endpoint:
  if request has already been retried: fail
  if no refresh token: clear session and redirect to login
  otherwise:
    await the shared refresh promise
    save fresh access token
    retry original request once with new token
```

Key safeguards:

- `_retry` prevents an infinite refresh/retry loop.
- Auth endpoints—including refresh itself—are excluded, so a failed refresh cannot recursively trigger another refresh.
- `refreshPromise` makes concurrent `401`s share one refresh request, preventing a refresh storm and token races.
- Failure clears both tokens and the cached current user, so no stale identity remains visible.

The current implementation persists both tokens in local storage. A stricter future security posture would keep the access token out of persistent browser storage and use an `HttpOnly`, `Secure`, `SameSite` cookie for refresh where the backend supports it. That would be a separate auth/security change; the UI redesign does not alter token storage or refresh behavior.

## Protected Route pattern

`ProtectedRoute` is a nested router boundary:

```text
ProtectedRoute
├─ session still resolving → show loading
├─ no valid session → redirect to login, preserving intended location
├─ session lacks required permission → redirect to /403
└─ valid session + allowed role → render nested route outlet
```

The router applies a general guard around all signed-in pages, then nests role-specific guards for host and admin areas. This keeps access rules declarative at the route tree instead of repeating checks inside every page.

## Authentication vs. authorization

- Authentication answers: “Who is this user, and is their session valid?” In this app: tokens + `/auth/me` + authenticated status.
- Authorization answers: “May this authenticated user access this resource?” In this app: `allowedRoles` compared against the server-provided user role.

The client-side role guard improves navigation and UX, but the API must enforce the same authorization rules. A user can alter browser state; they cannot be trusted to authorize themselves.

## How this prevents common auth bugs

- Reload flicker / premature redirects → explicit hydration and `initializing` gate.
- Stale logged-in UI after logout → one session-clear helper removes tokens and Query cache.
- Multiple competing refresh calls → shared refresh promise.
- Infinite `401` → refresh → `401` loops → one-retry marker and auth-endpoint exclusion.
- Reloaded session state → persisted tokens are hydrated, and the refresh flow obtains new tokens when the access token expires.
- Mistaking a token for verified identity → current user is fetched from the API.
- Showing protected content before a role check → route-level authentication and role boundaries.
- Transient refetch failure logging users out → preserved successful current-user data can keep the session authenticated during a later refetch failure.

## Reusable mental model

### 1. Client session store

```ts
const sessionStore = {
  accessToken: "persisted",
  refreshToken: "persisted",
  status: "initializing",
};
```

### 2. API client

```ts
function onRequest(req) {
  req.headers.Authorization = `Bearer ${sessionStore.accessToken}`;
}

async function on401(req) {
  if (req.wasRetried || req.isAuthEndpoint) throw error;

  const token = await refreshOnceForAllRequests();
  sessionStore.accessToken = token;
  return retry(req, token);
}
```

### 3. Bootstrap

```ts
await hydrateSessionStore();

if (!hasAnyCredential()) {
  sessionStore.status = "unauthenticated";
} else {
  const user = await query("/me");
  sessionStore.status = user ? "authenticated" : classifyFailure();
}
```

### 4. Routing

```ts
if (status === "initializing") showLoading();
if (status !== "authenticated") redirectToLogin();
if (!roleAllowed(currentUser.role, allowedRoles)) redirectTo403();
renderPage();
```

### 5. Logout and session failure

```ts
clearTokens();
removeCurrentUserCache();
redirectToLogin();
```

Use this pattern whenever your React app has a backend session, protected routes, and token renewal.
