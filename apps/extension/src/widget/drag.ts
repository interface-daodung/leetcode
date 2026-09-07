/**
 * Widget: draggable + giữ trong viewport.
 */
import { DRAG_THRESHOLD } from "../shared.js";
import type { WidgetHandleClip } from "./types.js";

/**
 * Kéo thả widget (mousedown/mousemove/mouseup).
 * Khi không di chuyển (click) → gọi handleClip().
 */
export function makeDraggable(el: HTMLElement, onClick: WidgetHandleClip): void {
  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  el.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    hasMoved = false;
    el.classList.add("dragging");
    const rect = el.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    el.style.bottom = "auto";
    el.style.right = "auto";
    el.style.left = `${initialLeft}px`;
    el.style.top = `${initialTop}px`;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      hasMoved = true;
    }
    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;
    const w = el.offsetWidth || 52;
    const h = el.offsetHeight || 52;
    const maxLeft = window.innerWidth - w;
    const maxTop = window.innerHeight - h;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));
    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    el.classList.remove("dragging");
    if (!hasMoved) {
      onClick();
    }
  });

  el.addEventListener("dragstart", (e) => e.preventDefault());
  window.addEventListener("resize", () => keepInBounds(el));
}

/**
 * Giữ widget nằm trong viewport khi resize.
 */
export function keepInBounds(el: HTMLElement): void {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const w = rect.width || el.offsetWidth || 80;
  const h = rect.height || el.offsetHeight || 80;
  if (el.style.left || el.style.top) {
    const maxLeft = Math.max(0, window.innerWidth - w);
    const maxTop = Math.max(0, window.innerHeight - h);
    let left = Math.max(0, Math.min(rect.left, maxLeft));
    let top = Math.max(0, Math.min(rect.top, maxTop));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";
  }
}
