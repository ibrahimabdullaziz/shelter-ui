import type { ReactNode } from "react";

export type StatusBadgeTone =
  | "positive"
  | "warning"
  | "negative"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  children: ReactNode;
  tone: StatusBadgeTone;
}

export function StatusBadge({ children, tone }: StatusBadgeProps) {
  return (
    <span className={`ui-status-badge ui-status-badge--${tone}`}>
      {children}
    </span>
  );
}
