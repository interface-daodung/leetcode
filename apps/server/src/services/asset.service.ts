import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { problemDb } from "@leetcode/database";
import { ASSETS_ROOT } from "../config.js";

/**
 * Kiểm tra từng asset đã có file trên đĩa chưa; nếu thiếu thì tải lại từ original_url.
 * Gọi lúc hydrate / getById để đảm bảo ảnh luôn hiển thị dù file bị xoá.
 */
export async function ensureAssetFiles(assets: { originalUrl: string; localPath: string }[]): Promise<void> {
  for (const asset of assets) {
    const target = join(ASSETS_ROOT, asset.localPath);
    try {
      await access(target);
      continue;
    } catch {
      // file thiếu — tải lại
    }
    try {
      const res = await fetch(asset.originalUrl);
      if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length === 0) continue;
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, buffer);
    } catch {
      // bỏ qua nếu tải lại thất bại
    }
  }
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

function sanitizeSlug(slug: string): string {
  const s = slug.trim().toLowerCase();
  return s.replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function sanitizeFilename(src: string, contentType: string | null): string {
  let name = "";
  try {
    const u = new URL(src);
    const pathName = u.pathname;
    const last = pathName.split("/").filter(Boolean).pop() ?? "";
    name = decodeURIComponent(last);
  } catch {
    const parts = src.split("/").filter(Boolean);
    name = parts.pop() ?? "";
    name = name.split("?")[0].split("#")[0];
  }

  if (!name || !extname(name)) {
    const extFromType = contentType ? extensionFromContentType(contentType) : "";
    if (name && extFromType && !extname(name)) name += extFromType;
    if (!name) name = `image${extFromType || ".png"}`;
  }

  name = name.replace(/[^a-zA-Z0-9._-]/g, "_");
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
  return [...new Set(srcs)];
}

/**
 * Tải ảnh từ description, lưu vào packages/database/data/assets/<slug>/{name},
 * dedupe bằng SHA-256 hash lưu trong DB (bảng problem_assets).
 * Trả về description đã rewrite src thành `${apiBase}/assets/<localPath>`.
 */
export async function downloadAndRewriteImages(
  description: string,
  slug: string,
  apiBase: string,
  problemId: number,
): Promise<string> {
  const srcs = extractImgSrcs(description);
  if (srcs.length === 0) return description;

  const safeSlug = sanitizeSlug(slug);
  const slugDir = join(ASSETS_ROOT, safeSlug);
  await ensureDir(slugDir);

  let newDescription = description;

  for (const originalSrc of srcs) {
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
      continue;
    }

    const hash = createHash("sha256").update(buffer).digest("hex");

    // Kiểm tra dedupe toàn cục qua DB
    let localPath: string | undefined;
    let existingGlobal: { localPath: string } | undefined;
    try {
      existingGlobal = await problemDb.findAssetByHash(hash);
    } catch {
      existingGlobal = undefined;
    }

    if (existingGlobal) {
      // Kiểm tra file thực tế còn tồn tại không
      try {
        await access(join(ASSETS_ROOT, existingGlobal.localPath));
        localPath = existingGlobal.localPath;
      } catch {
        // file mất — sẽ ghi lại bên dưới
        localPath = undefined;
      }
    }

    if (localPath) {
      // Reuse file cũ — đảm bảo có row cho problem hiện tại
      try {
        // Nếu chưa có row cho problem này với hash này, tạo thêm để tracking per-problem
        const assetsForProblem = await problemDb.findAssetsByProblem(problemId);
        const already = assetsForProblem.find((a) => a.hash === hash);
        if (!already) {
          await problemDb.addAsset({
            problemId,
            originalUrl: originalSrc,
            localPath,
            hash,
          });
        }
      } catch {
        // ignore DB error, vẫn rewrite
      }
      const newSrc = `${apiBase.replace(/\/$/, "")}/assets/${localPath}`;
      newDescription = newDescription.split(originalSrc).join(newSrc);
      continue;
    }

    // Chưa tồn tại — ghi file mới
    let filename = sanitizeFilename(originalSrc, contentType);
    let targetPath = join(slugDir, filename);
    let finalFilename = filename;

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
        // cùng file đã tồn tại — dedupe, chỉ lưu DB
        localPath = `${safeSlug}/${finalFilename}`;
        try {
          await problemDb.addAsset({ problemId, originalUrl: originalSrc, localPath, hash });
        } catch {}
        const newSrc = `${apiBase.replace(/\/$/, "")}/assets/${localPath}`;
        newDescription = newDescription.split(originalSrc).join(newSrc);
        continue;
      }
    } catch {
      // file chưa tồn tại — ok
    }

    await writeFile(targetPath, buffer);
    localPath = `${safeSlug}/${finalFilename}`;
    try {
      await problemDb.addAsset({
        problemId,
        originalUrl: originalSrc,
        localPath,
        hash,
      });
    } catch {
      // ignore nếu trùng (race)
    }

    const newSrc = `${apiBase.replace(/\/$/, "")}/assets/${localPath}`;
    newDescription = newDescription.split(originalSrc).join(newSrc);
  }

  return newDescription;
}
