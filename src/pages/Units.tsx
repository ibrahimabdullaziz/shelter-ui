import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import { UnitCard } from "../components/features/units/UnitCard";
import { UnitCardSkeleton } from "../components/features/units/UnitCardSkeleton";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { useDebounce } from "../hooks/useDebounce";
import { useUnitsQuery } from "../hooks/useUnitsQuery";
import { catalogKeys } from "../queries/catalogKeys";

const PAGE_SIZE = 12;

export default function UnitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const cityId = searchParams.get("cityId") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const debouncedMinPrice = useDebounce(minPriceInput, 400);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 400);

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
  const cities = citiesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
  const catalogError =
    citiesQuery.error ?? categoriesQuery.error ?? currenciesQuery.error;
  const retryCatalogQueries = () => {
    void Promise.all([
      citiesQuery.refetch(),
      categoriesQuery.refetch(),
      currenciesQuery.refetch(),
    ]);
  };

  const cityNameMap = new Map(cities.map((city) => [city.id, city.name]));
  const categoryNameMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const currencyCodeMap = new Map(
    currencies.map((currency) => [currency.id, currency.code]),
  );

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const filters = {
    page: safePage,
    limit: PAGE_SIZE,
    cityId: cityId || undefined,
    categoryId: categoryId || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  const {
    data: units = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUnitsQuery(filters);

  const hasActiveFilters = Boolean(
    cityId || categoryId || minPrice || maxPrice,
  );

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);

        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }

        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (minPrice !== debouncedMinPrice) {
      updateParam("minPrice", debouncedMinPrice);
    }
  }, [debouncedMinPrice, minPrice, updateParam]);

  useEffect(() => {
    if (maxPrice !== debouncedMaxPrice) {
      updateParam("maxPrice", debouncedMaxPrice);
    }
  }, [debouncedMaxPrice, maxPrice, updateParam]);

  useEffect(() => {
    const syncDraftsFromHistory = () => {
      const params = new URLSearchParams(window.location.search);
      setMinPriceInput(params.get("minPrice") ?? "");
      setMaxPriceInput(params.get("maxPrice") ?? "");
    };

    window.addEventListener("popstate", syncDraftsFromHistory);
    return () => window.removeEventListener("popstate", syncDraftsFromHistory);
  }, []);

  const handlePageChange = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(Math.max(1, nextPage)));
      return next;
    });
  };

  const clearFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("cityId");
      next.delete("categoryId");
      next.delete("minPrice");
      next.delete("maxPrice");
      next.set("page", "1");
      return next;
    });
  };

  return (
    <main className="discovery-page">
      <header className="discovery-heading">
        <div>
          <p className="discovery-eyebrow">SHELTER / STAYS</p>
          <h1>Find your next place</h1>
          <p>Thoughtful stays for the time you want to spend away.</p>
        </div>
        <p className="discovery-result-count" aria-live="polite">
          {isLoading
            ? "Loading stays..."
            : isFetching
              ? "Updating stays..."
              : `${units.length} ${units.length === 1 ? "stay" : "stays"} on this page`}
        </p>
      </header>

      {catalogError && (
        <QueryErrorState error={catalogError} onRetry={retryCatalogQueries} />
      )}

      <section className="discovery-filter-panel" aria-label="Filter stays">
        <div className="discovery-filter-grid">
          <label className="discovery-field">
            <span>City</span>
            <select
              value={cityId}
              onChange={(event) => updateParam("cityId", event.target.value)}
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <label className="discovery-field">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(event) =>
                updateParam("categoryId", event.target.value)
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="discovery-field">
            <span>Minimum price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
              placeholder="0"
            />
          </label>

          <label className="discovery-field">
            <span>Maximum price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              placeholder="500"
            />
          </label>
        </div>

        {hasActiveFilters && (
          <div className="discovery-active-filters" aria-label="Active filters">
            {cityId && (
              <button
                className="filter-chip"
                type="button"
                onClick={() => updateParam("cityId", "")}
              >
                {cityNameMap.get(cityId) ?? "City"}{" "}
                <span aria-hidden="true">×</span>
              </button>
            )}
            {categoryId && (
              <button
                className="filter-chip"
                type="button"
                onClick={() => updateParam("categoryId", "")}
              >
                {categoryNameMap.get(categoryId) ?? "Category"}{" "}
                <span aria-hidden="true">×</span>
              </button>
            )}
            {minPrice && (
              <button
                className="filter-chip"
                type="button"
                onClick={() => {
                  setMinPriceInput("");
                  updateParam("minPrice", "");
                }}
              >
                From {minPrice} <span aria-hidden="true">×</span>
              </button>
            )}
            {maxPrice && (
              <button
                className="filter-chip"
                type="button"
                onClick={() => {
                  setMaxPriceInput("");
                  updateParam("maxPrice", "");
                }}
              >
                Up to {maxPrice} <span aria-hidden="true">×</span>
              </button>
            )}
            <Button
              type="button"
              variant="quiet"
              size="small"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </section>

      {error ? (
        <QueryErrorState error={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="discovery-grid" aria-label="Loading stay results">
          {Array.from({ length: 6 }).map((_, index) => (
            <UnitCardSkeleton key={index} />
          ))}
        </div>
      ) : !units.length ? (
        <EmptyState
          icon="⌕"
          title="No units found"
          description="No stays match your current filters. Try changing them."
          action={
            hasActiveFilters ? (
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="discovery-grid" aria-label="Stay results">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                cityName={cityNameMap.get(unit.cityId) ?? unit.cityId}
                categoryName={
                  categoryNameMap.get(unit.categoryId) ?? unit.categoryId
                }
                currencyCode={currencyCodeMap.get(unit.currencyId)}
              />
            ))}
          </div>

          <nav className="discovery-pagination" aria-label="Unit result pages">
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1 || isFetching}
            >
              Previous
            </Button>

            <span aria-current="page">Page {safePage}</span>

            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={isFetching || units.length < PAGE_SIZE}
            >
              Next
            </Button>
          </nav>
        </>
      )}
    </main>
  );
}
