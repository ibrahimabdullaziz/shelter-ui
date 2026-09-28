import type { Unit } from "../../../types/api";

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  return (
    <article
      style={{
        border: "1px solid #dfe6e3",
        borderRadius: "12px",
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(17, 24, 39, 0.04)",
      }}
    >
      <div
        style={{
          height: "180px",
          background: "linear-gradient(135deg, #dfeae6, #c9d9d3)",
          display: "grid",
          placeItems: "center",
          color: "#173b34",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Image
      </div>

      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: "0 0 8px", color: "#173b34" }}>{unit.title}</h3>

        <p style={{ margin: "0 0 6px", color: "#536760" }}>
          City: {unit.cityId}
        </p>

        <p style={{ margin: "0 0 12px", color: "#536760" }}>
          Category: {unit.categoryId}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span style={{ color: "#1f594c", fontWeight: 700 }}>
            ${unit.pricePerNight}
          </span>
          <span style={{ color: "#6b7a75", fontSize: "12px" }}>/ night</span>
        </div>
      </div>
    </article>
  );
}
