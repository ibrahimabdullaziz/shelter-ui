import { getApiErrorMessage } from "../../lib/getApiErrorMessage";

interface QueryErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export function QueryErrorState({ error, onRetry }: QueryErrorStateProps) {
  return (
    <div role="alert">
      <p>{getApiErrorMessage(error)}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
