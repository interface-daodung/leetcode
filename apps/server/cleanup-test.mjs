import { DatabaseSync } from "node:sqlite";
const dbPath = "C:/Users/inter/OneDrive/Documents/GitHub/leetcode/packages/database/data/leetcode.db";
const db = new DatabaseSync(dbPath);
for (const id of [9999, 9998]) {
  try { db.prepare("DELETE FROM hints WHERE problem_id = ?").run(id); console.log(`deleted hints ${id}`);} catch(e){console.log(e.message)}
  try { db.prepare("DELETE FROM problem_assets WHERE problem_id = ?").run(id); console.log(`deleted assets ${id}`);} catch(e){console.log(e.message)}
  try { db.prepare("DELETE FROM problems WHERE id = ?").run(id); console.log(`deleted problem ${id}`);} catch(e){console.log(e.message)}
}
// also check assets folder
import { rm } from "node:fs/promises";
try { await rm("C:/Users/inter/OneDrive/Documents/GitHub/leetcode/packages/database/data/assets/test-new-features", { recursive: true, force: true }); console.log("rm test-new-features"); } catch {}
try { await rm("C:/Users/inter/OneDrive/Documents/GitHub/leetcode/packages/database/data/assets/test-dedupe", { recursive: true, force: true }); console.log("rm test-dedupe"); } catch {}
db.close();
console.log("cleanup done");
