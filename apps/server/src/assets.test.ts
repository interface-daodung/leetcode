import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mkdir, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ASSETS_ROOT = fileURLToPath(new URL("../../../packages/database/data/assets", import.meta.url));

async function cleanAssets() {
  try {
    await rm(ASSETS_ROOT, { recursive: true, force: true });
  } catch {}
  await mkdir(ASSETS_ROOT, { recursive: true });
}

describe("assets — downloadAndRewriteImages", () => {
  beforeEach(async () => {
    await cleanAssets();
    vi.restoreAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it("giữ nguyên description nếu không có <img>", async () => {
    const { downloadAndRewriteImages } = await import("./assets.js");
    const html = "<p>Hello</p><pre>code</pre>";
    const out = await downloadAndRewriteImages(html, "test-slug", "http://localhost:3000");
    expect(out).toBe(html);
  });

  it("tải ảnh, tính SHA-256 Buffer và lưu vào assets/<slug>/, rewrite src", async () => {
    const fakeBuffer = Buffer.from("fake-image-data");
    const fakeHash = createHash("sha256").update(fakeBuffer).digest("hex");

    // mock fetch toàn cục
    const fetchMock = vi.fn(async (url: string) => {
      return {
        ok: true,
        headers: { get: () => "image/png" },
        arrayBuffer: async () => fakeBuffer.buffer.slice(fakeBuffer.byteOffset, fakeBuffer.byteOffset + fakeBuffer.byteLength),
      } as unknown as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { downloadAndRewriteImages } = await import("./assets.js");
    const html = `<p>desc</p><img src="http://example.com/foo.png" alt="x"><img src="http://example.com/foo.png" alt="x">`;
    const out = await downloadAndRewriteImages(html, "my-problem", "http://localhost:3000");

    // fetch chỉ gọi 1 lần vì dedupe src trong cùng lần
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // description rewrite thành /assets/my-problem/foo.png với apiBase
    expect(out).toContain("http://localhost:3000/assets/my-problem/foo.png");
    expect(out).not.toContain("http://example.com/foo.png");

    // file tồn tại
    const saved = await readFile(join(ASSETS_ROOT, "my-problem", "foo.png"));
    expect(saved.equals(fakeBuffer)).toBe(true);

    // hash index tồn tại và chứa hash
    const indexRaw = await readFile(join(ASSETS_ROOT, ".hash-index.json"), "utf-8");
    const index = JSON.parse(indexRaw);
    expect(index[fakeHash]).toBe("my-problem/foo.png");
  });

  it("tránh lưu trùng: cùng buffer khác URL thì reuse hash-index, không ghi file mới", async () => {
    const fakeBuffer = Buffer.from("same-data-for-both");
    const fakeHash = createHash("sha256").update(fakeBuffer).digest("hex");

    const fetchMock = vi.fn(async () => ({
      ok: true,
      headers: { get: () => "image/jpeg" },
      arrayBuffer: async () => fakeBuffer.buffer.slice(fakeBuffer.byteOffset, fakeBuffer.byteOffset + fakeBuffer.byteLength),
    } as unknown as Response));
    vi.stubGlobal("fetch", fetchMock);

    const { downloadAndRewriteImages: fn1 } = await import("./assets.js");
    const html1 = `<img src="http://example.com/a.jpg">`;
    await fn1(html1, "slug-1", "http://localhost:3000");

    // clear module cache để lần 2 vẫn dùng cùng hash index file (không reset bằng clean)
    // Nhưng fetch mock vẫn giữ
    const { downloadAndRewriteImages: fn2 } = await import("./assets.js");
    const html2 = `<img src="http://example.com/b.jpg">`;
    const out2 = await fn2(html2, "slug-2", "http://localhost:3000");

    // Lần 2 nên reuse hash, rewrite src về slug-1/a.jpg (path đã lưu)
    expect(out2).toContain("http://localhost:3000/assets/slug-1/a.jpg");
    // Không tạo file mới ở slug-2
    let slug2Exists = true;
    try {
      await readFile(join(ASSETS_ROOT, "slug-2", "b.jpg"));
    } catch {
      slug2Exists = false;
    }
    expect(slug2Exists).toBe(false);

    const indexRaw = await readFile(join(ASSETS_ROOT, ".hash-index.json"), "utf-8");
    const index = JSON.parse(indexRaw);
    expect(index[fakeHash]).toBe("slug-1/a.jpg");
    expect(Object.keys(index)).toHaveLength(1);
  });

  it("giữ nguyên src nếu fetch fail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false } as Response)));
    const { downloadAndRewriteImages } = await import("./assets.js");
    const html = `<img src="http://example.com/notfound.png">`;
    const out = await downloadAndRewriteImages(html, "slug-x", "http://localhost:3000");
    expect(out).toBe(html);
  });

  it("bỏ qua data: URL", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const { downloadAndRewriteImages } = await import("./assets.js");
    const html = `<img src="data:image/png;base64,abc">`;
    const out = await downloadAndRewriteImages(html, "slug", "http://localhost:3000");
    expect(out).toBe(html);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
