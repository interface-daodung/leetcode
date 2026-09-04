/** Kiểu dữ liệu cho bộ nhắc code (autocomplete) LeetCode JavaScript */

export interface SuggestItem {
  /** id duy nhất, vd "array.push", "snippet.fori", "pattern.binary-search" */
  id: string;
  /** text dùng để match prefix */
  label: string;
  kind: "api" | "snippet" | "pattern" | "keyword";
  /** text chèn vào editor (plain, nhiều dòng cho snippet/pattern) */
  insertText: string;
  /** mô tả ngắn 1 dòng (signature / giải thích) */
  detail?: string;
  /** id entry trong docsIndex để mở Knowledge panel */
  docId?: string;
  /** type của receiver khi gợi ý sau dấu "." — vd ["Array"] */
  receiverTypes?: string[];
  /** điểm ưu tiên, cao hơn hiện trước */
  priority?: number;
}
