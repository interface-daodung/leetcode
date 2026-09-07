import { Injectable, signal } from "@angular/core";

const STORAGE_KEY = "admin:theme";

@Injectable({ providedIn: "root" })
export class ThemeService {
  readonly isDark = signal<boolean>(this.readInitial());

  constructor() {
    this.apply(this.isDark());
  }

  toggle(): void {
    this.isDark.update((v) => {
      const next = !v;
      this.apply(next);
      return next;
    });
  }

  setDark(value: boolean): void {
    this.isDark.set(value);
    this.apply(value);
  }

  private apply(isDark: boolean): void {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (isDark) html.classList.add("dark");
      else html.classList.remove("dark");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    }
  }

  private readInitial(): boolean {
    if (typeof localStorage === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }
}
