import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { PLAYGROUND_ROOT } from "../config.js";

/**
 * Tìm dòng bắt đầu thân hàm giải (body) trong code.
 * Trả về số dòng (1-based). Ưu tiên dòng mở `{` của hàm chính,
 * fallback về dòng đầu có nội dung.
 */
export function findFunctionBodyLine(code: string): number {
  const lines = code.split("\n");
  let braceDepth = 0;
  let inLine = false;
  let inBlock = false;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let j = 0;
    while (j < line.length) {
      const c = line[j];
      const next = line[j + 1];

      if (inLine) {
        if (c === "\n") inLine = false;
        j++;
        continue;
      }
      if (inBlock) {
        if (c === "*" && next === "/") {
          inBlock = false;
          j += 2;
          continue;
        }
        j++;
        continue;
      }
      if (inSingle) {
        if (c === "\\") { j += 2; continue; }
        if (c === "'") inSingle = false;
        j++;
        continue;
      }
      if (inDouble) {
        if (c === "\\") { j += 2; continue; }
        if (c === '"') inDouble = false;
        j++;
        continue;
      }
      if (inTemplate) {
        if (c === "\\") { j += 2; continue; }
        if (c === "`") inTemplate = false;
        j++;
        continue;
      }

      if (c === "/" && next === "/") { inLine = true; j += 2; continue; }
      if (c === "/" && next === "*") { inBlock = true; j += 2; continue; }
      if (c === "'") { inSingle = true; j++; continue; }
      if (c === '"') { inDouble = true; j++; continue; }
      if (c === "`") { inTemplate = true; j++; continue; }

      if (c === "{") braceDepth++;
      if (c === "}") braceDepth--;

      // Dòng mở body: braceDepth >= 1 nghĩa là đã vào 1 cấp `{}`
      if (c === "{" && braceDepth >= 1) {
        return i + 1; // 1-based
      }
      j++;
    }
  }

  // Fallback: dòng đầu tiên không rỗng / không phải comment
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t && !t.startsWith("//") && !t.startsWith("/*") && !t.startsWith("*")) {
      return i + 1;
    }
  }
  return 1;
}

export interface PlaygroundSaveResult {
  ok: true;
  path: string;
  line: number;
  column: number;
  file: string;
}

/** Ghi code vào playground/<slug>.js, trả về vị trí dòng body để mở VS Code. */
export async function saveToPlayground(slug: string, code: string): Promise<PlaygroundSaveResult> {
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "problem";
  const file = `${safeSlug}.js`;
  const filePath = join(PLAYGROUND_ROOT, file);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, code, "utf8");
  return {
    ok: true,
    path: filePath,
    line: findFunctionBodyLine(code),
    column: 1,
    file,
  };
}