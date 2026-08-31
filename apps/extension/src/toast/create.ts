/**
 * Toast: tạo element toast (append vào body).
 */
import { TOAST_ID } from "../shared.js";

let toastEl: HTMLElement | null = null;

/**
 * Đảm bảo element toast tồn tại (chỉ tạo 1 lần).
 */
export function ensureToast(): HTMLElement {
  if (toastEl) return toastEl;
  toastEl = document.createElement("div");
  toastEl.id = TOAST_ID;
  document.body.appendChild(toastEl);
  return toastEl;
}

/**
 * Reset element toast (dùng khi cần render lại từ đầu).
 */
export function resetToast(): void {
  toastEl = null;
}
