import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mkdir, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ASSETS_ROOT = fileURLToPath(new URL("../../../packages/database/data/assets", import.meta.url));

// Mock DB: lưu hash -> localPath và per-problem assets
const hashToPath = new Map<string, string>();
const perProblem = new Map<number, { hash: string; localPath: string; originalUrl: string }[]>();

vi.mock("@leetcode/database", () => ({
  problemDb: {
    findAssetByHash: vi.fn(async (hash: string) => {
      const localPath = hashToPath.get(hash);
      if (!localPath) return undefined;
      return { localPath, originalUrl: `http://example.com/${hash}.png` };
    }),
    addAsset: vi.fn(async (asset: { problemId: number; originalUrl: string; localPath: string; hash: string }) => {
      hashToPath.set(asset.hash, asset.localPath);
      const arr = perProblem.get(asset.problemId) ?? [];
      arr.push({ hash: asset.hash, localPath: asset.localPath, originalUrl: asset.originalUrl });
      perProblem.set(asset.problemId, arr);
    }),
    findAssetsByProblem: vi.fn(async (problemId: number) => {
      return perProblem.get(problemId) ?? [];
    }),
  },
}));

async function cleanAssets() {
  try {
    await rm(ASSETS_ROOT, { recursive: true, force: true });
  } catch {}
  await mkdir(ASSETS_ROOT, { recursive: true });
  hashToPath.clear();
  perProblem.clear();
}

describe("assets — downloadAndRewriteImages (DB dedupe)", () => {
  beforeEach(async () => {
    await cleanAssets();
    vi.restoreAllMocks();
    // re-setup mock vì restoreAllMocks xoá mock impl
    const { problemDb } = await import("@leetcode/database");
    vi.mocked(problemDb.findAssetByHash).mockImplementation(async (hash: string) => {
      const localPath = hashToPath.get(hash);
      if (!localPath) return undefined;
      return { localPath, originalUrl: `http://example.com/${hash}.png` };
    });
    vi.mocked(problemDb.addAsset).mockImplementation(async (asset: { problemId: number; originalUrl: string; localPath: string; hash: string }) => {
      hashToPath.set(asset.hash, asset.localPath);
      const arr = perProblem.get(asset.problemId) ?? [];
      arr.push({ hash: asset.hash, localPath: asset.localPath, originalUrl: asset.originalUrl });
      perProblem.set(asset.problemId, arr);
    });
    vi.mocked(problemDb.findAssetsByProblem).mockImplementation((async (problemId: number) => {
      return (perProblem.get(problemId) ?? []) as unknown as Awaited<ReturnType<typeof problemDb.findAssetsByProblem>>;
    }) as unknown as typeof problemDb.findAssetsByProblem);
  });
  afterEach(() => vi.restoreAllMocks());

  it("giữ nguyên description nếu không có <img>", async () => {
    const { downloadAndRewriteImages } = await import("./services/asset.service.js");
    const html = "<p>Hello</p><pre>code</pre>";
    const out = await downloadAndRewriteImages(html, "test-slug", "http://localhost:3000", 1);
    expect(out).toBe(html);
  });

  it("tải ảnh, tính SHA-256 Buffer và lưu vào assets/<slug>/, rewrite src, lưu DB", async () => {
    const fakeBuffer = Buffer.from("fake-image-data");
    const fakeHash = createHash("sha256").update(fakeBuffer).digest("hex");

    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        headers: { get: () => "image/png" },
        arrayBuffer: async () => fakeBuffer.buffer.slice(fakeBuffer.byteOffset, fakeBuffer.byteOffset + fakeBuffer.byteLength),
      } as unknown as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { downloadAndRewriteImages } = await import("./services/asset.service.js");
    const { problemDb } = await import("@leetcode/database");
    const html = `<p>desc</p><img src="http://example.com/foo.png" alt="x"><img src="http://example.com/foo.png" alt="x">`;
    const out = await downloadAndRewriteImages(html, "my-problem", "http://localhost:3000", 42);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(out).toContain("http://localhost:3000/assets/my-problem/foo.png");
    expect(out).not.toContain("http://example.com/foo.png");

    const saved = await readFile(join(ASSETS_ROOT, "my-problem", "foo.png"));
    expect(saved.equals(fakeBuffer)).toBe(true);

    // DB đã lưu hash -> localPath
    expect(hashToPath.get(fakeHash)).toBe("my-problem/foo.png");
    expect(vi.mocked(problemDb.addAsset)).toHaveBeenCalledWith(
      expect.objectContaining({ problemId: 42, hash: fakeHash, localPath: "my-problem/foo.png" }),
    );
  });

  it("tránh lưu trùng: cùng buffer khác URL thì reuse DB, không ghi file mới", async () => {
    const fakeBuffer = Buffer.from("same-data-for-both");

    const fetchMock = vi.fn(async () => ({
      ok: true,
      headers: { get: () => "image/jpeg" },
      arrayBuffer: async () => fakeBuffer.buffer.slice(fakeBuffer.byteOffset, fakeBuffer.byteOffset + fakeBuffer.byteLength),
    } as unknown as Response));
    vi.stubGlobal("fetch", fetchMock);

    const { downloadAndRewriteImages: fn1 } = await import("./services/asset.service.js");
    const html1 = `<img src="http://example.com/a.jpg">`;
    await fn1(html1, "slug-1", "http://localhost:3000", 1);

    const { downloadAndRewriteImages: fn2 } = await import("./services/asset.service.js");
    const html2 = `<img src="http://example.com/b.jpg">`;
    const out2 = await fn2(html2, "slug-2", "http://localhost:3000", 2);

    // Lần 2 nên reuse hash, rewrite src về slug-1/a.jpg
    expect(out2).toContain("http://localhost:3000/assets/slug-1/a.jpg");
    // Không tạo file mới ở slug-2
    let slug2Exists = true;
    try {
      await readFile(join(ASSETS_ROOT, "slug-2", "b.jpg"));
    } catch {
      slug2Exists = false;
    }
    expect(slug2Exists).toBe(false);

    // DB chỉ có 1 hash mapping tới slug-1/a.jpg, nhưng per-problem có 2 rows (mỗi problem 1 row)
    const fakeHash = createHash("sha256").update(fakeBuffer).digest("hex");
    expect(hashToPath.get(fakeHash)).toBe("slug-1/a.jpg");
    // perProblem có 2 entries
    expect(perProblem.get(1)?.length).toBe(1);
    expect(perProblem.get(2)?.length).toBe(1);
  });

  it("giữ nguyên src nếu fetch fail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false } as Response)));
    const { downloadAndRewriteImages } = await import("./services/asset.service.js");
    const html = `<img src="http://example.com/notfound.png">`;
    const out = await downloadAndRewriteImages(html, "slug-x", "http://localhost:3000", 99);
    expect(out).toBe(html);
  });

  it("bỏ qua data: URL", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const { downloadAndRewriteImages } = await import("./services/asset.service.js");
    const html = `<img src="data:image/png;base64,abc">`;
    const out = await downloadAndRewriteImages(html, "slug", "http://localhost:3000", 5);
    expect(out).toBe(html);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
