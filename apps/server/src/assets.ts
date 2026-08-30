import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

// Thu mục lưu ảnh: packages/database/data/assets (resolve từ import.meta.url, không phụ thuộc CWD)
export const ASSETS_ROOT = fileURLToPath(new URL("../../../packages/database/data/assets", import.meta.url));
const HASH_INDEX_PATH = join(ASSETS_ROOT, ".hash-index.json");

type HashIndex = Record<string, string>; // hash -> relativePath (vd "two-sum/abc.png")

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function loadHashIndex(): Promise<HashIndex> {
  try {
    await access(HASH_INDEX_PATH);
    const raw = await readFile(HASH_INDEX_PATH, "utf-8");
    return JSON.parse(raw) as HashIndex;
  } catch {
    return {};
  }
}

async function saveHashIndex(index: HashIndex): Promise<void> {
  await ensureDir(ASSETS_ROOT);
  await writeFile(HASH_INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
}

function sanitizeSlug(slug: string): string {
  const s = slug.trim().toLowerCase();
  // giữ a-z0-9-_ , thay còn lại bằng -
  return s.replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function sanitizeFilename(src: string, contentType: string | null): string {
  let name = "";
  try {
    const u = new URL(src);
    const pathName = u.pathname;
    const last = pathName.split("/").filter(Boolean).pop() ?? "";
    name = decodeURIComponent(last);
    // loại bỏ query/hash đã được bỏ qua vì pathname không chứa chúng
  } catch {
    // src có thể là relative — lấy phần sau /
    const parts = src.split("/").filter(Boolean);
    name = parts.pop() ?? "";
    // loại bỏ query string
    name = name.split("?")[0].split("#")[0];
  }

  // Nếu không có tên hoặc không có extension, sinh từ content-type
  if (!name || !extname(name)) {
    const extFromType = contentType ? extensionFromContentType(contentType) : "";
    if (name && extFromType && !extname(name)) name += extFromType;
    if (!name) name = `image${extFromType || ".png"}`;
  }

  // Sanitize: chỉ giữ alphanum, dot, dash, underscore
  name = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Giới hạn 120 ký tự
  if (name.length > 120) {
    const ext = extname(name);
    name = name.slice(0, 120 - ext.length) + ext;
  }
  return name || "image.png";
}

function extensionFromContentType(ct: string): string {
  const t = ct.split(";")[0].trim().toLowerCase();
  if (t === "image/png") return ".png";
  if (t === "image/jpeg" || t === "image/jpg") return ".jpg";
  if (t === "image/gif") return ".gif";
  if (t === "image/webp") return ".webp";
  if (t === "image/svg+xml") return ".svg";
  if (t === "image/bmp") return ".bmp";
  if (t === "image/avif") return ".avif";
  return "";
}

function extractImgSrcs(html: string): string[] {
  const srcs: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = m[1]?.trim();
    if (src) srcs.push(src);
  }
  // dedupe giữ order
  return [...new Set(srcs)];
}

/**
 * Tải ảnh từ description, lưu vào packages/database/data/assets/<slug>/{name},
 * dedupe bằng SHA-256 hash của buffer.
 * Trả về description đã rewrite src thành `${apiBase}/assets/<slug>/<name>` (hoặc giữ nguyên nếu download fail).
 */
export async function downloadAndRewriteImages(
  description: string,
  slug: string,
  apiBase: string,
): Promise<string> {
  const srcs = extractImgSrcs(description);
  if (srcs.length === 0) return description;

  const safeSlug = sanitizeSlug(slug);
  const slugDir = join(ASSETS_ROOT, safeSlug);
  await ensureDir(slugDir);

  const hashIndex = await loadHashIndex();
  let newDescription = description;
  let indexDirty = false;

  for (const originalSrc of srcs) {
    // Bỏ qua data: URL hoặc đã là local assets
    if (originalSrc.startsWith("data:")) continue;
    if (originalSrc.includes("/assets/")) continue;

    let buffer: Buffer | null = null;
    let contentType: string | null = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(originalSrc, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      contentType = res.headers.get("content-type");
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
      if (buffer.length === 0) continue;
    } catch {
      continue; // giữ nguyên src nếu fetch fail
    }

    // Buffer -> SHA-256 -> kiểm tra đã tồn tại chưa
    const hash = createHash("sha256").update(buffer).digest("hex");

    let relativePath: string | undefined = hashIndex[hash];
    let filename: string;

    if (relativePath) {
      // Đã tồn tại — reuse path cũ (có thể thuộc slug khác, vẫn reuse)
      filename = basename(relativePath);
      // Nếu file thực tế không còn tồn tại (bị xóa tay), thì sẽ ghi lại vào slug hiện tại
      try {
        await access(join(ASSETS_ROOT, relativePath));
      } catch {
        // file mất — ghi lại
        filename = sanitizeFilename(originalSrc, contentType);
        const targetPath = join(slugDir, filename);
        // Nếu trùng tên nhưng khác hash, thêm hash suffix
        let finalPath = targetPath;
        let finalFilename = filename;
        try {
          await access(finalPath);
          // file tồn tại nhưng hash khác (vì hashIndex không có) -> thêm suffix
          const ext = extname(filename);
          const base = basename(filename, ext);
          finalFilename = `${base}-${hash.slice(0, 8)}${ext}`;
          finalPath = join(slugDir, finalFilename);
        } catch {
          // không tồn tại, dùng tên gốc
        }
        await writeFile(finalPath, buffer);
        relativePath = `${safeSlug}/${finalFilename}`;
        hashIndex[hash] = relativePath;
        indexDirty = true;
      }
    } else {
      // Chưa tồn tại — ghi file mới
      filename = sanitizeFilename(originalSrc, contentType);
      let targetPath = join(slugDir, filename);
      let finalFilename = filename;
      // Tránh ghi đè file cùng tên nhưng nội dung khác (hash khác)
      try {
        await access(targetPath);
        const existing = await readFile(targetPath);
        const existingHash = createHash("sha256").update(existing).digest("hex");
        if (existingHash !== hash) {
          const ext = extname(filename);
          const base = basename(filename, ext);
          finalFilename = `${base}-${hash.slice(0, 8)}${ext}`;
          targetPath = join(slugDir, finalFilename);
        } else {
          // cùng file đã tồn tại — dedupe, chỉ cập nhật index
          relativePath = `${safeSlug}/${finalFilename}`;
          hashIndex[hash] = relativePath;
          indexDirty = true;
          // rewrite src và tiếp tục
          const newSrc = `${apiBase.replace(/\/$/, "")}/assets/${relativePath}`;
          newDescription = newDescription.split(originalSrc).join(newSrc);
          continue;
        }
      } catch {
        // file chưa tồn tại — ok
      }
      await writeFile(targetPath, buffer);
      relativePath = `${safeSlug}/${finalFilename}`;
      hashIndex[hash] = relativePath;
      indexDirty = true;
    }

    const newSrc = `${apiBase.replace(/\/$/, "")}/assets/${relativePath}`;
    // Thay tất cả occurrence của originalSrc
    newDescription = newDescription.split(originalSrc).join(newSrc);
  }

  if (indexDirty) {
    await saveHashIndex(hashIndex);
  }

  return newDescription;
}
