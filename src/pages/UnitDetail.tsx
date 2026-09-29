import { Link, useParams } from "react-router-dom";
import { useUnitQuery } from "../hooks/useUnitsQuery";

export default function UnitDetailPage() {
  const { id } = useParams();
  const { data: unit, isLoading, error } = useUnitQuery(id ?? "");

  if (isLoading) {
    return (
      <main style={{ padding: "24px" }}>
        <p>Loading unit...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Unit detail</h1>
        <p>Unable to load this unit.</p>
        <Link to="/units">Back to listings</Link>
      </main>
    );
  }

  if (!unit) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Unit not found</h1>
        <p>This listing does not exist or may have been removed.</p>
        <Link to="/units">Back to listings</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Link
        to="/units"
        style={{ display: "inline-block", marginBottom: "16px" }}
      >
        ← Back to listings
      </Link>

      <article
        style={{
          background: "#fff",
          border: "1px solid #dfe6e3",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(17, 24, 39, 0.06)",
        }}
      >
        <div
          style={{
            height: "220px",
            background: "linear-gradient(135deg, #dfeae6, #c9d9d3)",
            display: "grid",
            placeItems: "center",
            color: "#173b34",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Unit Listing
        </div>

        <div style={{ padding: "24px" }}>
          <h1 style={{ margin: "0 0 12px", color: "#173b34" }}>{unit.title}</h1>

          <p style={{ margin: "0 0 16px", color: "#536760", lineHeight: 1.6 }}>
            {unit.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <strong>City ID:</strong>
              <div>{unit.cityId}</div>
            </div>
            <div>
              <strong>Category ID:</strong>
              <div>{unit.categoryId}</div>
            </div>
            <div>
              <strong>Max guests:</strong>
              <div>{unit.maxGuests}</div>
            </div>
            <div>
              <strong>Price:</strong>
              <div>${unit.pricePerNight} / night</div>
            </div>
          </div>

          <div
            style={{ color: "#1f594c", fontWeight: 700, fontSize: "1.4rem" }}
          >
            ${unit.pricePerNight}
          </div>
        </div>
      </article>
    </main>
  );
}
