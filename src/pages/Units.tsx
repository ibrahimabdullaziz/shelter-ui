import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listCities } from "../api/catalog";
import { UnitCard } from "../components/features/units/UnitCard";
import { UnitCardSkeleton } from "../components/features/units/UnitCardSkeleton";
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
  const cities = citiesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const catalogError = citiesQuery.error ?? categoriesQuery.error;
  const retryCatalogQueries = () => {
    void Promise.all([citiesQuery.refetch(), categoriesQuery.refetch()]);
  };

  const cityNameMap = useMemo(
    () => new Map(cities.map((city) => [city.id, city.name])),
    [cities],
  );

  const categoryNameMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
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
    updateParam("minPrice", debouncedMinPrice);
  }, [debouncedMinPrice, updateParam]);

  useEffect(() => {
    updateParam("maxPrice", debouncedMaxPrice);
  }, [debouncedMaxPrice, updateParam]);

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

  if (error) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Units</h1>
        <QueryErrorState error={error} onRetry={() => void refetch()} />
      </main>
    );
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1>Units</h1>
      {catalogError && (
        <QueryErrorState error={catalogError} onRetry={retryCatalogQueries} />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "20px",
          marginBottom: "24px",
        }}
      >
        <label style={{ display: "grid", gap: "6px" }}>
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

        <label style={{ display: "grid", gap: "6px" }}>
          <span>Category</span>
          <select
            value={categoryId}
            onChange={(event) => updateParam("categoryId", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "6px" }}>
          <span>Min price</span>
          <input
            type="number"
            value={minPriceInput}
            onChange={(event) => setMinPriceInput(event.target.value)}
            placeholder="0"
          />
        </label>

        <label style={{ display: "grid", gap: "6px" }}>
          <span>Max price</span>
          <input
            type="number"
            value={maxPriceInput}
            onChange={(event) => setMaxPriceInput(event.target.value)}
            placeholder="500"
          />
        </label>
      </div>

      {hasActiveFilters && (
        <div style={{ marginBottom: "20px" }}>
          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
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
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                cityName={cityNameMap.get(unit.cityId) ?? unit.cityId}
                categoryName={
                  categoryNameMap.get(unit.categoryId) ?? unit.categoryId
                }
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1 || isFetching}
            >
              Previous
            </button>

            <span>Page {safePage}</span>

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={isFetching || units.length < PAGE_SIZE}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
