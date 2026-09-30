import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback:
    | ReactNode
    | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKeys?: readonly unknown[];
}

interface ErrorBoundaryState {
  error: Error | null;
  resetKeys: readonly unknown[];
}

function haveResetKeysChanged(
  previous: readonly unknown[],
  next: readonly unknown[],
) {
  return (
    previous.length !== next.length ||
    previous.some((key, index) => !Object.is(key, next[index]))
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, resetKeys: [] };

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    const resetKeys = props.resetKeys ?? [];
    if (haveResetKeysChanged(state.resetKeys, resetKeys)) {
      return { error: null, resetKeys };
    }
    return null;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "Booking section failed to render",
      error,
      info.componentStack,
    );
    try {
      this.props.onError?.(error, info);
    } catch (reportingError) {
      console.error("Error reporter failed", reportingError);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return typeof this.props.fallback === "function"
        ? this.props.fallback({
            error,
            resetErrorBoundary: this.resetErrorBoundary,
          })
        : this.props.fallback;
    }

    return this.props.children;
  }
}
