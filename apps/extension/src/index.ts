/**
 * Entry point: khởi tạo widget, xử lý click (handleClip), SPA hook.
 * Bundle esbuild từ file này → content.js.
 */
import { WIDGET_ID, API_BASE, copyToClipboard } from "./shared.js";
import { buildProblemClip } from "./clip.js";
import { createWidget, makeDraggable, setWidgetState, playSquashStretch } from "./widget/index.js";
import { showToast } from "./toast/index.js";
import { postToServer, isValidClipForPost } from "./api/index.js";

/**
 * Xử lý click widget: clip DOM → clipboard + POST/PUT server → toast + state.
 */
function handleClip(): void {
  const widget = document.getElementById(WIDGET_ID);
  const clip = buildProblemClip(document, location.href);
  if (!clip) {
    showToast("Không tìm thấy đề bài. Hãy đợi trang tải xong.", "error");
    if (widget) {
      setWidgetState(widget, "error");
      setTimeout(() => setWidgetState(widget, "idle"), 1500);
    }
    return;
  }
  if (!clip.id || clip.id === 0) {
    showToast("Không parse được ID đề bài. Kiểm tra DOM.", "error");
    if (widget) {
      setWidgetState(widget, "error");
      setTimeout(() => setWidgetState(widget, "idle"), 1500);
    }
    return;
  }

  // Hiệu ứng Squash & Stretch khi click
  if (widget) playSquashStretch(widget);

  const json = JSON.stringify(clip, null, 2);
  // 1) Copy vào clipboard (giữ để paste thủ công nếu cần)
  void copyToClipboard(json);
  // 2) Gọi trực tiếp server (host từ root .env) để lưu DB
  const validationErr = isValidClipForPost(clip);
  if (validationErr) {
    showToast(`Không gửi được: ${validationErr}`, "error");
    console.warn("[LeetCode Widget] validation fail:", validationErr, clip);
    if (widget) {
      setWidgetState(widget, "error");
      setTimeout(() => setWidgetState(widget, "idle"), 1500);
    }
    return;
  }
  // Trạng thái đang gửi
  showToast(`Đang gửi ${clip.id}. ${clip.title} tới ${API_BASE}...`, "");
  if (widget) setWidgetState(widget, "loading");
  postToServer(clip).then((result) => {
    const w = document.getElementById(WIDGET_ID);
    if (result.ok) {
      const msg = result.overwritten
        ? `Đã ghi đè: ${clip.id}. ${clip.title} vào DB`
        : `Đã lưu: ${clip.id}. ${clip.title} vào DB`;
      showToast(msg, "success");
      if (w) {
        setWidgetState(w, "success");
        setTimeout(() => setWidgetState(w, "idle"), 1800);
      }
      console.log("[LeetCode Widget] POST ok:", result.data);
    } else {
      showToast(`Lỗi gửi server: ${result.error} (đã copy JSON)`, "error");
      if (w) {
        setWidgetState(w, "error");
        setTimeout(() => setWidgetState(w, "idle"), 1500);
      }
      console.log("[LeetCode Widget] POST fail, JSON:", json, result);
    }
  });
}

/**
 * Khởi tạo: tạo widget + toast, gắn draggable (click → handleClip).
 */
function init(): void {
  const widget = createWidget();
  if (widget) {
    makeDraggable(widget, handleClip);
  }
}

// ----- Bootstrap — đợi body sẵn sàng -----
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ----- SPA: nếu URL đổi mà widget mất thì tạo lại -----
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (!document.getElementById(WIDGET_ID) && location.pathname.startsWith("/problems/")) {
      init();
    }
  }
}, 1000);