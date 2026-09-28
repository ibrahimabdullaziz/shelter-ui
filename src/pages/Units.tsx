import { UnitCard } from "../components/features/units/UnitCard";
import { UnitCardSkeleton } from "../components/features/units/UnitCardSkeleton";
import { useUnitsQuery } from "../hooks/useUnitsQuery";

export default function UnitsPage() {
  const { data: units = [], isLoading, error } = useUnitsQuery();

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
      )}
    </main>
  );
}
