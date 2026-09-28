import { useUnitsQuery } from "../hooks/useUnitsQuery";

export default function UnitsPage() {
  const { data: units = [], isLoading, error } = useUnitsQuery();

  if (isLoading) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Units</h1>
        <p>Loading units...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Units</h1>
        <p>Unable to load units right now.</p>
      </main>
    );
  }

  if (!units.length) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Units</h1>
        <p>No units found.</p>
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
        }}
      >
        {units.map((unit) => (
          <article
            key={unit.id}
            style={{
              border: "1px solid #dfe6e3",
              borderRadius: "12px",
              padding: "16px",
              background: "#fff",
            }}
          >
            <h2 style={{ margin: "0 0 8px" }}>{unit.title}</h2>
            <p style={{ margin: "0 0 8px" }}>City: {unit.cityId}</p>
            <p style={{ margin: "0 0 8px" }}>Category: {unit.categoryId}</p>
            <p style={{ margin: 0 }}>$ {unit.pricePerNight} / night</p>
          </article>
        ))}
      </div>
    </main>
  );
}
