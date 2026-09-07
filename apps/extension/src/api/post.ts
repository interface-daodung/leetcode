/**
 * API: gửi ProblemClip lên server — POST (tạo mới) → nếu 409 → PUT (ghi đè).
 */
import type { ProblemClip } from "../shared.js";
import { API_BASE } from "../shared.js";
import { showToast } from "../toast/index.js";
import { isValidClipForPost } from "./validate.js";

export interface PostResult {
  ok: boolean;
  data?: unknown;
  overwritten?: boolean;
  error?: string;
}

/**
 * Gửi clip lên server.
 * 1) POST /api/problems/import — nếu 201/200 → ok
 * 2) Nếu 409 → PUT /api/problems/:id — nếu 200 → ok (overwritten)
 * 3) Lỗi khác → return { ok: false, error }
 */
export async function postToServer(clip: ProblemClip): Promise<PostResult> {
  const err = isValidClipForPost(clip);
  if (err) {
    showToast(`JSON không hợp lệ: ${err}`, "error");
    return { ok: false, error: err };
  }

  try {
    // Thử POST trước (tạo mới)
    let res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/problems/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clip),
    });
    let data = await res.json().catch(() => ({}));

    if (res.ok && (res.status === 201 || res.status === 200)) {
      return { ok: true, data };
    }

    // Nếu 409 (đã tồn tại) → thử PUT để ghi đè
    if (res.status === 409) {
      res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/problems/${clip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clip),
      });
      data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { ok: true, data, overwritten: true };
      }
      return { ok: false, error: data.error || `HTTP ${res.status} (ghi đè thất bại)` };
    }

    return { ok: false, error: data.error || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}