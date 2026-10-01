import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { listHostBookings } from "../api/bookings";
import { listMyUnits } from "../api/units";
import { bookingKeys } from "../queries/bookingKeys";
import { unitKeys } from "../queries/unitKeys";

export default function HostOverviewPage() {
  const [unitsQuery, bookingsQuery] = useQueries({
    queries: [
      {
        queryKey: unitKeys.mine(),
        queryFn: listMyUnits,
        staleTime: 30_000,
      },
      {
        queryKey: bookingKeys.host(),
        queryFn: listHostBookings,
        staleTime: 30_000,
      },
    ],
  });

  return (
    <section
      className="host-page-section"
      aria-labelledby="host-overview-title"
    >
      <div className="host-page-heading">
        <p className="host-kicker">Your workspace</p>
        <h2 id="host-overview-title">Overview</h2>
        <p>Keep track of your listings and incoming booking requests.</p>
      </div>
      <div className="host-stat-grid">
        <Link className="host-stat" to="/host/units">
          <span className="host-stat-label">My units</span>
          <strong>
            {getQueryCount(
              unitsQuery.isLoading,
              unitsQuery.isError,
              unitsQuery.data?.length,
            )}
          </strong>
          <span className="host-stat-link">View listings</span>
        </Link>
        <Link className="host-stat" to="/host/bookings">
          <span className="host-stat-label">Pending requests</span>
          <strong>
            {getQueryCount(
              bookingsQuery.isLoading,
              bookingsQuery.isError,
              bookingsQuery.data?.filter(
                (booking) => booking.status === "PENDING",
              ).length,
            )}
          </strong>
          <span className="host-stat-link">Review bookings</span>
        </Link>
      </div>
      {unitsQuery.isError && (
        <QueryErrorState
          error={unitsQuery.error}
          onRetry={() => void unitsQuery.refetch()}
        />
      )}
      {bookingsQuery.isError && (
        <QueryErrorState
          error={bookingsQuery.error}
          onRetry={() => void bookingsQuery.refetch()}
        />
      )}
    </section>
  );
}

function getQueryCount(
  isLoading: boolean,
  isError: boolean,
  count: number | undefined,
) {
  if (isLoading) return "...";
  if (isError) return "—";
  return count ?? 0;
}
