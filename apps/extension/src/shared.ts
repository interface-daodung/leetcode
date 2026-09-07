/**
 * Shared types, asset URLs, API config — dùng chung toàn extension.
 */

// ----- Types -----

export type Difficulty = "easy" | "medium" | "hard";

export interface TestCase {
  input: unknown;
  expected: unknown;
}

export interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  template?: string;
  testCases?: TestCase[];
  hints?: string[];
  clippedAt: string;
}

// ----- DOM IDs & constants -----

export const WIDGET_ID = "lc-clipper-widget";
export const TOAST_ID = "lc-clipper-toast";
export const DRAG_THRESHOLD = 5;

// ----- Asset URLs -----

/**
 * Lấy URL asset extension qua chrome.runtime.getURL.
 * Fallback path tương đối khi không có chrome.runtime (test environment).
 */
export function getAssetUrl(path: string): string {
  try {
    return chrome.runtime.getURL(path);
  } catch {
    return path;
  }
}

export const IDLE_IMG = getAssetUrl("assets/Idle.png");
export const LOADING_IMG = getAssetUrl("assets/Loading.png");
export const SUCCESS_IMG = getAssetUrl("assets/Success.png");
export const ERROR_IMG = getAssetUrl("assets/Error.png");
export const TOAST_SVG = getAssetUrl("assets/toast-text.svg");

// ----- API config -----

// api-config.js được inject trước content.js, định nghĩa var LC_API_BASE
declare const LC_API_BASE: string | undefined;

export const API_BASE =
  typeof LC_API_BASE !== "undefined" && LC_API_BASE ? LC_API_BASE : "http://localhost:3000";

// ----- Clipboard -----

/**
 * Copy text vào clipboard (navigator.clipboard, fallback execCommand).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
