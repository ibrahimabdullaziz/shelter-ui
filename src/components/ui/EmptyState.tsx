import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      style={{
        display: "grid",
        justifyItems: "start",
        gap: "10px",
        padding: "22px 0",
        color: "#536760",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          width: "42px",
          height: "42px",
          placeItems: "center",
          borderRadius: "50%",
          background: "#e6eee9",
          color: "#1f594c",
          fontSize: "22px",
        }}
      >
        {icon}
      </span>
      <div>
        <p style={{ margin: "0 0 4px", color: "#173b34", fontWeight: 700 }}>
          {title}
        </p>
        <p style={{ margin: 0, lineHeight: 1.5 }}>{description}</p>
      </div>
      {action}
    </div>
  );
}
