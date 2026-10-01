import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUnit } from "../api/units";
import { UnitCard } from "../components/features/units/UnitCard";
import { EmptyState } from "../components/ui/EmptyState";
import { useFavoriteUnitIds } from "../hooks/useFavorites";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

export default function FavoritesPage() {
  const favoritesQuery = useFavoriteUnitIds(true);
  const favoriteIds = favoritesQuery.data ?? [];
  const unitsQuery = useQuery({
    queryKey: ["favorite-units", favoriteIds],
    queryFn: () => Promise.all(favoriteIds.map((id) => getUnit(id))),
    enabled: favoritesQuery.isSuccess && favoriteIds.length > 0,
    staleTime: 30_000,
  });

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ margin: "0 0 20px", color: "#173b34" }}>Saved stays</h1>

      {favoritesQuery.isLoading ? (
        <p role="status">Loading saved stays...</p>
      ) : favoritesQuery.isError ? (
        <div role="alert">
          <p>{getApiErrorMessage(favoritesQuery.error)}</p>
          <button type="button" onClick={() => void favoritesQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : favoriteIds.length === 0 ? (
        <EmptyState
          icon="♡"
          title="No favorites yet"
          description="Save stays you like and they’ll be collected here."
          action={<Link to="/units">Explore stays</Link>}
        />
      ) : unitsQuery.isLoading ? (
        <p role="status">Loading saved stays...</p>
      ) : unitsQuery.isError ? (
        <div role="alert">
          <p>{getApiErrorMessage(unitsQuery.error)}</p>
          <button type="button" onClick={() => void unitsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {(unitsQuery.data ?? []).map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </main>
  );
}
