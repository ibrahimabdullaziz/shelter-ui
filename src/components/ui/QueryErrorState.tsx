import { getApiErrorMessage } from "../../lib/getApiErrorMessage";
import { Button } from "./Button";

interface QueryErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export function QueryErrorState({ error, onRetry }: QueryErrorStateProps) {
  return (
    <div className="ui-feedback ui-feedback--error" role="alert">
      <p>{getApiErrorMessage(error)}</p>
      <Button type="button" variant="secondary" size="small" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
