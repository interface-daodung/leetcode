// CLI seed docs — chạy: pnpm --filter=@leetcode/database db:seed-docs
import { seedDocs } from "../src/seed-docs.js";

seedDocs()
  .then((r) => {
    for (const x of r) console.log(`seed ${x.lang}: ${x.files} files, ${x.sections} sections`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
