import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { UnitCard } from "../components/features/units/UnitCard";
import { EmptyState } from "../components/ui/EmptyState";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { useFavoriteUnitIds } from "../hooks/useFavorites";
import { unitQueryOptions } from "../hooks/useUnitsQuery";

export default function FavoritesPage() {
  const favoritesQuery = useFavoriteUnitIds(true);
  const favoriteIds = favoritesQuery.data ?? [];
  const unitQueries = useQueries({
    queries: favoriteIds.map((id) => unitQueryOptions(id)),
  });
  const units = unitQueries.flatMap((query) =>
    query.data ? [query.data] : [],
  );
  const isLoadingUnits = unitQueries.some((query) => query.isLoading);
  const unitErrorQuery = unitQueries.find((query) => query.isError);

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ margin: "0 0 20px", color: "#173b34" }}>Saved stays</h1>

      {favoritesQuery.isLoading ? (
        <p role="status">Loading saved stays...</p>
      ) : favoritesQuery.isError ? (
        <QueryErrorState
          error={favoritesQuery.error}
          onRetry={() => void favoritesQuery.refetch()}
        />
      ) : favoriteIds.length === 0 ? (
        <EmptyState
          icon="♡"
          title="No favorites yet"
          description="Save stays you like and they’ll be collected here."
          action={<Link to="/units">Explore stays</Link>}
        />
      ) : isLoadingUnits ? (
        <p role="status">Loading saved stays...</p>
      ) : unitErrorQuery ? (
        <QueryErrorState
          error={unitErrorQuery.error}
          onRetry={() => void unitErrorQuery.refetch()}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </main>
  );
}
