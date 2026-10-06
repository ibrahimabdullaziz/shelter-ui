import {
  isRouteErrorResponse,
  Link,
  useRouteError,
} from "react-router-dom";

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText || "The requested page could not be opened."
    : "An unexpected error prevented this page from loading.";

  return (
    <main className="route-state route-error-page" role="alert">
      <p className="discovery-eyebrow">SHELTER / SOMETHING WENT WRONG</p>
      <h1>We couldn’t open this page</h1>
      <p>{message}</p>
      <div className="route-error-actions">
        <Link className="site-nav-join" to="/">
          Back to stays
        </Link>
        <button
          className="site-nav-button"
          type="button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
