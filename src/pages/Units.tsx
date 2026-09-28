import { useState } from "react";
import { UnitCard } from "../components/features/units/UnitCard";
import { UnitCardSkeleton } from "../components/features/units/UnitCardSkeleton";
import { useUnitsQuery } from "../hooks/useUnitsQuery";

const PAGE_SIZE = 12;

export default function UnitsPage() {
  const [page, setPage] = useState(1);
  const {
    data: units = [],
    isLoading,
    isFetching,
    error,
  } = useUnitsQuery(page, PAGE_SIZE);

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

      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "20px",
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
              marginTop: "20px",
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
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isFetching}
            >
              Previous
            </button>

            <span>Page {page}</span>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
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
