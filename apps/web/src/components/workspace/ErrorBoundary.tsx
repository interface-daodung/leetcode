import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useErrorStore } from "./ErrorContext.js";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundaryImpl extends Component<Props & { onError: (e: Error) => void }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError(error);
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-medium text-red-600">Lỗi giao diện: {error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs text-text-primary hover:bg-bg-hover"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Bọc children với ErrorBoundary; khi có lỗi render, đẩy lỗi lên ErrorContext toàn cục. */
export function ErrorBoundary({ children, fallback }: Props) {
  const { pushError } = useErrorStore();
  const onError = (e: Error) => pushError({ source: "render", message: e.message, detail: e.stack });
  return (
    <ErrorBoundaryImpl onError={onError} {...(fallback ? { fallback } : {})}>
      {children}
    </ErrorBoundaryImpl>
  );
}
