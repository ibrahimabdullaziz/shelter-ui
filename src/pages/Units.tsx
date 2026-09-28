import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UnitCard } from "../components/features/units/UnitCard";
import { UnitCardSkeleton } from "../components/features/units/UnitCardSkeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useUnitsQuery } from "../hooks/useUnitsQuery";

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

  useEffect(() => {
    updateParam("minPrice", debouncedMinPrice);
  }, [debouncedMinPrice]);

  useEffect(() => {
    updateParam("maxPrice", debouncedMaxPrice);
  }, [debouncedMaxPrice]);

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
  } = useUnitsQuery(filters);

  const updateParam = (key: string, value: string) => {
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
  };

  useEffect(() => {
    setMinPriceInput(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setMaxPriceInput(maxPrice);
  }, [maxPrice]);

  const handlePageChange = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(Math.max(1, nextPage)));
      return next;
    });
  };

  if (error) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Units</h1>
        <p>Unable to load units right now.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1>Units</h1>

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
          <input
            value={cityId}
            onChange={(event) => updateParam("cityId", event.target.value)}
            placeholder="city id"
          />
        </label>

        <label style={{ display: "grid", gap: "6px" }}>
          <span>Category</span>
          <input
            value={categoryId}
            onChange={(event) => updateParam("categoryId", event.target.value)}
            placeholder="category id"
          />
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
        <p style={{ marginTop: "20px" }}>No units found.</p>
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
              <UnitCard key={unit.id} unit={unit} />
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
