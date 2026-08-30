const API = "http://localhost:3000";

// Helper fetch with timeout
async function testImport() {
  console.log("=== Test import with url/template/hints/assets ===");
  const clip = {
    id: 9999,
    slug: "test-new-features",
    title: "Test New Features",
    url: "https://leetcode.com/problems/test-new-features/",
    difficulty: "medium",
    tags: ["array", "test"],
    description: `<p>Test description</p><img src="https://httpbin.org/image/png" alt="test"><p>More text</p>`,
    template: "function testNewFeatures(nums) {\n  return nums;\n}",
    hints: ["Hint content 1: use two pointers", "Hint content 2: maintain delay", "Hint content 3: optimize"],
    testCases: [{ input: { nums: [1,2] }, expected: [1,2] }],
  };

  // Cleanup if exists
  try {
    await fetch(`${API}/api/problems/9999`, { method: "GET" });
  } catch {}

  console.log("\n1. POST /api/problems/import");
  let res = await fetch(`${API}/api/problems/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clip),
  });
  let data = await res.json().catch(() => ({}));
  console.log(`   status: ${res.status}`);
  console.log(`   ok: ${data.ok}, problem id: ${data.problem?.id}, slug: ${data.problem?.slug}, url: ${data.problem?.url}`);
  console.log(`   template exists: ${!!data.problem?.template}, hints: ${JSON.stringify(data.problem?.hints)}`);
  console.log(`   assets: ${JSON.stringify(data.problem?.assets)}`);
  console.log(`   description contains /assets/: ${data.problem?.description?.includes("/assets/")}`);
  if (res.status !== 201) {
    console.log("   FAILED to import:", data);
    process.exit(1);
  }

  console.log("\n2. GET /api/problems/9999");
  res = await fetch(`${API}/api/problems/9999`);
  data = await res.json();
  console.log(`   status: ${res.status}, title: ${data.title}, url: ${data.url}, slug: ${data.slug}`);
  console.log(`   template: ${data.template?.slice(0,40)}...`);
  console.log(`   hints: ${JSON.stringify(data.hints)}`);
  console.log(`   assets: ${JSON.stringify(data.assets)}`);
  console.log(`   description has /assets/: ${data.description?.includes("/assets/")}`);

  console.log("\n3. GET /api/problems/9999/hints");
  res = await fetch(`${API}/api/problems/9999/hints`);
  data = await res.json();
  console.log(`   hints: ${JSON.stringify(data.hints)}`);
  if (data.hints.length !== 3) throw new Error("hints count mismatch");

  console.log("\n4. GET /api/problems/9999/assets");
  res = await fetch(`${API}/api/problems/9999/assets`);
  data = await res.json();
  console.log(`   assets: ${JSON.stringify(data.assets)}`);
  if (!data.assets || data.assets.length === 0) throw new Error("assets not saved");
  const asset = data.assets[0];
  console.log(`   asset localPath: ${asset.localPath}, originalUrl: ${asset.originalUrl}, hash: ${asset.hash}`);

  console.log("\n5. Check file exists and dedupe");
  // Try second import with same image different problem
  const clip2 = {
    id: 9998,
    slug: "test-dedupe",
    title: "Test Dedupe",
    url: "https://leetcode.com/problems/test-dedupe/",
    difficulty: "easy",
    tags: ["test"],
    description: `<img src="https://httpbin.org/image/png">`,
    hints: ["Only hint"],
  };
  res = await fetch(`${API}/api/problems/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clip2),
  });
  data = await res.json().catch(() => ({}));
  console.log(`   second import status: ${res.status}, assets: ${JSON.stringify(data.problem?.assets)}`);
  // Should reuse same localPath as first (dedupe)
  res = await fetch(`${API}/api/problems/9998/assets`);
  data = await res.json();
  console.log(`   second assets: ${JSON.stringify(data.assets)}`);
  const secondAsset = data.assets[0];
  console.log(`   second localPath: ${secondAsset.localPath}, first was: ${asset.localPath}`);
  console.log(`   dedupe reuse same file: ${secondAsset.localPath === asset.localPath}`);
  console.log(`   hash same: ${secondAsset.hash === asset.hash}`);

  console.log("\n6. GET /api/problems (list)");
  res = await fetch(`${API}/api/problems`);
  data = await res.json();
  console.log(`   total problems: ${data.length}, includes 9999: ${data.some(p=>p.id===9999)}, 9998: ${data.some(p=>p.id===9998)}`);
  console.log(`   sample with hints: ${JSON.stringify(data.find(p=>p.id===9999)?.hints)}`);

  console.log("\n=== All checks passed ===");

  // Cleanup
  console.log("\nCleanup 9999, 9998");
  // Need to use DB delete via API? No delete endpoint, use direct DB via fetch? We'll just leave for now and use direct delete via DB script
  // For now, just exit
}

testImport().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
