/**
 * Toast: tạo SVG với text động từ template assets/toast-text.svg.
 * Dựa trên logic sua_svg.js — auto font-size (24-72px) + wrap nếu text dài.
 */
import { TOAST_SVG } from "../shared.js";

/**
 * Tạo SVG toast với text tùy chỉnh.
 * Trả về string SVG hoặc null nếu lỗi.
 */
export async function generateToastSvg(text: string): Promise<string | null> {
  try {
    const response = await fetch(TOAST_SVG);
    if (!response.ok) throw new Error("Không tải được toast SVG");
    let svg = await response.text();

    // Parse group transform → (tx, ty)
    const groupMatch = svg.match(/<g[^>]*transform="matrix\(([^)]+)\)"/);
    let tx = 0, ty = 0;
    if (groupMatch) {
      const vals = groupMatch[1].split(",").map((v) => parseFloat(v.trim()));
      if (vals.length === 6) { tx = vals[4]; ty = vals[5]; }
    }

    // Find path bbox (khung bong bóng thoại)
    const pathMatch = svg.match(/<path[^>]*\sd="([^"]+)"/);
    if (!pathMatch) throw new Error("Không tìm thấy path trong SVG");
    const nums = (pathMatch[1].match(/-?\d+\.?\d*/g) || []).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);

    // Robust extreme — bỏ điểm mỏ neo (xuất hiện 1 lần), ưu tiên cạnh lặp ≥ 2
    function robustExtreme(values: number[], wantMax: boolean, tol = 0.5): number {
      const rounded = values.map((v) => Math.round(v / tol) * tol);
      const counts = new Map<number, number>();
      for (const v of rounded) counts.set(v, (counts.get(v) || 0) + 1);
      const distinct = [...new Set(rounded)].sort((a, b) => (wantMax ? b - a : a - b));
      for (const v of distinct) {
        if ((counts.get(v) ?? 0) >= 2) return v;
      }
      return distinct[0];
    }

    const bbox = {
      x0: robustExtreme(xs, false),
      y0: robustExtreme(ys, false),
      x1: robustExtreme(xs, true),
      y1: robustExtreme(ys, true),
    };

    const padding = 24;
    const minFont = 24;
    const maxFont = 72;
    const safeX0 = bbox.x0 + padding;
    const safeX1 = bbox.x1 - padding;
    const safeY0 = bbox.y0 + padding;
    const safeY1 = bbox.y1 - padding;
    const maxWidth = safeX1 - safeX0;
    const maxHeight = safeY1 - safeY0;

    // Find text element ban đầu
    const textMatch = svg.match(/<text([^>]*)>([\s\S]*?)<\/text>/);
    if (!textMatch) throw new Error("Không tìm thấy thẻ <text> trong SVG");
    const attrs = textMatch[1];
    const origFontMatch = attrs.match(/font-size:\s*([\d.]+)px/);
    const origFont = origFontMatch ? parseFloat(origFontMatch[1]) : 60.5;

    // Tính font-size tối ưu — bắt đầu từ maxFont
    let fontSize = Math.min(maxFont, origFont);
    const ratio = 0.56;
    function estimateWidth(t: string, fs: number): number { return t.length * ratio * fs; }

    while (fontSize > minFont && estimateWidth(text, fontSize) > maxWidth) {
      fontSize -= 1;
    }

    // Wrap text nếu vượt width
    function wrapText(txt: string, fs: number, mw: number): string[] {
      const words = txt.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        const trial = (cur + " " + w).trim();
        if (estimateWidth(trial, fs) <= mw || !cur) {
          cur = trial;
        } else {
          lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    }

    let lines: string[];
    if (estimateWidth(text, fontSize) <= maxWidth) {
      lines = [text];
    } else {
      fontSize = Math.max(fontSize, minFont);
      lines = wrapText(text, fontSize, maxWidth);
      let lineHeight = fontSize * 1.15;
      while (lines.length * lineHeight > maxHeight && fontSize > minFont) {
        fontSize -= 1;
        lineHeight = fontSize * 1.15;
        lines = wrapText(text, fontSize, maxWidth);
      }
    }

    const lineHeight = fontSize * 1.15;
    const totalH = (lines.length - 1) * lineHeight;
    const centerY = (safeY0 + safeY1) / 2 - ty;
    // Lệch lên + trái một chút
    const yStart = centerY - totalH / 2 + fontSize * 0.25;
    const xCenter = (safeX0 + safeX1) / 2 - tx - fontSize * 0.15;

    // Cập nhật attrs text
    let newAttrs = attrs.replace(/font-size:\s*[\d.]+px/, `font-size: ${fontSize.toFixed(2)}px`);
    newAttrs = newAttrs.replace(/\sx="[^"]*"/, "").replace(/\sy="[^"]*"/, "");
    newAttrs += ' text-anchor="middle"';

    function escapeXml(s: string): string {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    const tspans = lines
      .map((line, i) => {
        const y = yStart + i * lineHeight;
        return `<tspan x="${xCenter.toFixed(2)}" y="${y.toFixed(2)}">${escapeXml(line)}</tspan>`;
      })
      .join("");

    const newTextEl = `<text${newAttrs}>${tspans}</text>`;
    const idx = textMatch.index ?? 0;
    svg = svg.slice(0, idx) + newTextEl + svg.slice(idx + textMatch[0].length);

    return svg;
  } catch (e) {
    console.warn("[LeetCode Widget] Toast SVG generation failed:", e);
    return null;
  }
}
