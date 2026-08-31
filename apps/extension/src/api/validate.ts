/**
 * API: validate ProblemClip trước khi gửi server.
 */
import type { ProblemClip } from "../shared.js";

/**
 * Kiểm tra clip có đủ trường bắt buộc để POST lên server không.
 * Trả về string lỗi hoặc null nếu hợp lệ.
 */
export function isValidClipForPost(clip: ProblemClip): string | null {
  if (!clip) return "clip rỗng";
  if (typeof clip.id !== "number" || !Number.isInteger(clip.id) || clip.id <= 0) return "id không hợp lệ";
  if (typeof clip.title !== "string" || !clip.title.trim()) return "title rỗng";
  if (clip.difficulty !== "easy" && clip.difficulty !== "medium" && clip.difficulty !== "hard")
    return "difficulty không hợp lệ";
  if (typeof clip.description !== "string" || !clip.description.trim()) return "description rỗng";
  if (!Array.isArray(clip.tags)) return "tags không hợp lệ";
  return null;
}