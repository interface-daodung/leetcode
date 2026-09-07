/**
 * Widget: state machine (idle/loading/success/error) + squash-stretch animation.
 */
import { IDLE_IMG, LOADING_IMG, SUCCESS_IMG, ERROR_IMG } from "../shared.js";

export type WidgetState = "idle" | "loading" | "success" | "error";

/**
 * Đổi ảnh widget + class tương ứng với trạng thái.
 */
export function setWidgetState(widget: HTMLElement, state: WidgetState): void {
  const img = widget.querySelector("img");
  if (!img) return;

  switch (state) {
    case "idle":
      (img as HTMLImageElement).src = IDLE_IMG;
      widget.classList.remove("loading", "success", "error");
      break;
    case "loading":
      (img as HTMLImageElement).src = LOADING_IMG;
      widget.classList.add("loading");
      widget.classList.remove("success", "error");
      break;
    case "success":
      (img as HTMLImageElement).src = SUCCESS_IMG;
      widget.classList.add("success");
      widget.classList.remove("loading", "error");
      break;
    case "error":
      (img as HTMLImageElement).src = ERROR_IMG;
      widget.classList.add("error");
      widget.classList.remove("loading", "success");
      break;
  }
}

/**
 * Phát hiệu ứng Squash & Stretch (1.2s).
 */
export function playSquashStretch(widget: HTMLElement): void {
  widget.classList.add("squash-stretch");
  setTimeout(() => {
    widget.classList.remove("squash-stretch");
  }, 1200);
}