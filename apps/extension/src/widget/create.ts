/**
 * Widget: tạo element widget + ảnh idle.
 */
import { WIDGET_ID, IDLE_IMG } from "../shared.js";

/**
 * Tạo widget (id = WIDGET_ID) chứa ảnh idle, append vào body.
 * Nếu đã tồn tại thì không tạo lại.
 */
export function createWidget(): HTMLElement | null {
  if (document.getElementById(WIDGET_ID)) return null;
  const widget = document.createElement("div");
  widget.id = WIDGET_ID;
  widget.title = "Click để copy đề bài thành JSON";

  const img = document.createElement("img");
  img.src = IDLE_IMG;
  img.alt = "LeetCode Widget";
  img.draggable = false;
  widget.appendChild(img);

  document.body.appendChild(widget);
  return widget;
}
