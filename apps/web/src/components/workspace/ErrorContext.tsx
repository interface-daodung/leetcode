import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/** Nguồn sinh lỗi — dùng để gắn nhãn icon/badge. */
export type ErrorSource = "ws" | "ai" | "code" | "render" | "fetch" | "other";

export interface AppError {
  id: number;
  ts: number;
  source: ErrorSource;
  message: string;
  detail?: string;
}

export interface ErrorState {
  errors: AppError[];
  pushError: (input: { source: ErrorSource; message: string; detail?: string }) => void;
  removeError: (id: number) => void;
  clearErrors: () => void;
}

const ErrorCtx = createContext<ErrorState | null>(null);

const MAX_ERRORS = 100;

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const pushError = useCallback((input: { source: ErrorSource; message: string; detail?: string }) => {
    setErrors((prev) => {
      const next: AppError = {
        id: Date.now() + Math.random(),
        ts: Date.now(),
        source: input.source,
        message: input.message,
        ...(input.detail ? { detail: input.detail } : {}),
      };
      const arr = [next, ...prev];
      return arr.length > MAX_ERRORS ? arr.slice(0, MAX_ERRORS) : arr;
    });
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);

  const value = useMemo<ErrorState>(
    () => ({ errors, pushError, removeError, clearErrors }),
    [errors, pushError, removeError, clearErrors],
  );

  return <ErrorCtx.Provider value={value}>{children}</ErrorCtx.Provider>;
}

export function useErrorStore(): ErrorState {
  const ctx = useContext(ErrorCtx);
  if (!ctx) {
    throw new Error("useErrorStore phải nằm dưới ErrorProvider");
  }
  return ctx;
}
