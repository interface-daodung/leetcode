// Import ảnh icon từ packages/shared/asset/icon qua alias @icons (xem vite.config.ts + tsconfig paths).
// Vite bundle các file này thành URL asset tương ứng khi build/dev.
import iconPng from "@icons/leetcodeLab.png";
import iconWebp from "@icons/leetcodeLab.webp";
import iconIco from "@icons/leetcodeLab.ico";

/** URL logo chính cho UI (ưu tiên webp gọn hơn png). */
export const appIconUrl = iconWebp;

/** URL icon ico (favicon). */
export const appIconIcoUrl = iconIco;

/** URL icon png. */
export const appIconPngUrl = iconPng;

/** Thiết lập favicon cho tab trình duyệt dùng icon của app. */
export function applyFavicon(): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/x-icon";
  link.href = iconIco;
}
