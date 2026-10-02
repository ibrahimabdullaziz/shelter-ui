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
    <div className="ui-empty-state" role="status">
      <span className="ui-empty-state-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="ui-empty-state-title">{title}</p>
        <p className="ui-empty-state-description">{description}</p>
      </div>
      {action}
    </div>
  );
}
