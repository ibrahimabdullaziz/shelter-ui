export function UnitCardSkeleton() {
  return (
    <article
      aria-busy="true"
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
          background:
            "linear-gradient(90deg, #edf3f1 25%, #e6efed 50%, #edf3f1 75%)",
          backgroundSize: "200% 100%",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />

      <div style={{ padding: "16px" }}>
        <div
          style={{
            height: "18px",
            width: "70%",
            marginBottom: "10px",
            borderRadius: "6px",
            background: "#edf3f1",
          }}
        />

        <div
          style={{
            height: "12px",
            width: "60%",
            marginBottom: "8px",
            borderRadius: "6px",
            background: "#edf3f1",
          }}
        />

        <div
          style={{
            height: "12px",
            width: "55%",
            marginBottom: "16px",
            borderRadius: "6px",
            background: "#edf3f1",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "16px",
              width: "30%",
              borderRadius: "6px",
              background: "#edf3f1",
            }}
          />
          <div
            style={{
              height: "12px",
              width: "18%",
              borderRadius: "6px",
              background: "#edf3f1",
            }}
          />
        </div>
      </div>
    </article>
  );
}
