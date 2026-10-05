import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageTransition } from "../components/ui/PageTransition";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import { UnitCard } from "../components/features/units/UnitCard";
import { EmptyState } from "../components/ui/EmptyState";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { useFavoriteUnitIds } from "../hooks/useFavorites";
import { unitQueryOptions } from "../hooks/useUnitsQuery";
import { catalogKeys } from "../queries/catalogKeys";

export default function FavoritesPage() {
  const favoritesQuery = useFavoriteUnitIds(true);
  const citiesQuery = useQuery({
    queryKey: catalogKeys.cities(),
    queryFn: listCities,
    staleTime: 5 * 60_000,
  });
  const categoriesQuery = useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });
  const currenciesQuery = useQuery({
    queryKey: catalogKeys.currencies(),
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });
  const favoriteIds = favoritesQuery.data ?? [];
  const unitQueries = useQueries({
    queries: favoriteIds.map((id) => unitQueryOptions(id)),
  });
  const units = unitQueries.flatMap((query) =>
    query.data ? [query.data] : [],
  );
  const isLoadingUnits = unitQueries.some((query) => query.isLoading);
  const unitErrorQuery = unitQueries.find((query) => query.isError);
  const cityNameMap = new Map(
    (citiesQuery.data ?? []).map((city) => [city.id, city.name]),
  );
  const categoryNameMap = new Map(
    (categoriesQuery.data ?? []).map((category) => [
      category.id,
      category.name,
    ]),
  );
  const currencyCodeMap = new Map(
    (currenciesQuery.data ?? []).map((currency) => [
      currency.id,
      currency.code,
    ]),
  );
  const catalogError =
    citiesQuery.error ?? categoriesQuery.error ?? currenciesQuery.error;
  const retryCatalogQueries = () => {
    void Promise.all([
      citiesQuery.refetch(),
      categoriesQuery.refetch(),
      currenciesQuery.refetch(),
    ]);
  };

  return (
    <PageTransition>
      <main className="favorites-page">
      <header className="favorites-heading">
        <div>
          <p className="booking-list-eyebrow">YOUR SHORTLIST</p>
          <h1>Saved stays</h1>
          <p>Places you’ve kept close while deciding where to go.</p>
        </div>
        {!favoritesQuery.isLoading && !favoritesQuery.isError && (
          <span className="favorites-count">
            {favoriteIds.length} {favoriteIds.length === 1 ? "stay" : "stays"}
          </span>
        )}
      </header>

      {catalogError && (
        <QueryErrorState error={catalogError} onRetry={retryCatalogQueries} />
      )}

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
        <div className="discovery-grid favorites-grid">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              cityName={cityNameMap.get(unit.cityId)}
              categoryName={categoryNameMap.get(unit.categoryId)}
              currencyCode={currencyCodeMap.get(unit.currencyId)}
            />
          ))}
        </div>
      )}
    </main>
    </PageTransition>
  );
}
