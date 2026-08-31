/**
 * Toast: hiển thị toast với text động (SVG) hoặc fallback text.
 */
import { WIDGET_ID } from "../shared.js";
import { ensureToast } from "./create.js";
import { generateToastSvg } from "./svg.js";

export type ToastVariant = "" | "success" | "error";

let toastTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Vị trí toast: góc trên-phải của widget. Fallback nếu widget không tồn tại.
 */
function positionToast(el: HTMLElement): void {
  const widget = document.getElementById(WIDGET_ID);
  if (widget) {
    const widgetRect = widget.getBoundingClientRect();
    el.style.position = "fixed";
    el.style.bottom = `${window.innerHeight - widgetRect.top + 8}px`;
    el.style.right = `${window.innerWidth - widgetRect.right}px`;
    el.style.left = "auto";
    el.style.top = "auto";
  } else {
    el.style.position = "fixed";
    el.style.bottom = "110px";
    el.style.right = "20px";
    el.style.left = "auto";
    el.style.top = "auto";
  }
}

/**
 * Hiển thị toast (SVG text động hoặc fallback text) trong 3 giây.
 */
export function showToast(message: string, variant: ToastVariant = ""): void {
  const el = ensureToast();

  generateToastSvg(message).then((svg) => {
    if (svg) {
      el.innerHTML = svg;
      el.style.width = "auto";
      el.style.maxWidth = "500px";
      el.style.padding = "0";
    } else {
      el.textContent = message;
      el.style.width = "";
      el.style.maxWidth = "320px";
      el.style.padding = "10px 14px";
    }

    positionToast(el);

    el.className = variant || "";
    void el.offsetWidth;
    el.classList.add("show");
    if (variant) el.classList.add(variant);

    clearTimeout(toastTimer ?? undefined);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3000);
  });
}
