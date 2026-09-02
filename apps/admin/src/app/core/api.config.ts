import { InjectionToken } from "@angular/core";

declare global {
  interface Window {
    __ADMIN_API_URL__?: string;
  }
}

export const API_URL_TOKEN = new InjectionToken<string>("API_URL", {
  providedIn: "root",
  factory: () => {
    if (typeof window !== "undefined" && window.__ADMIN_API_URL__) {
      return window.__ADMIN_API_URL__;
    }
    return "http://localhost:3000";
  },
});
