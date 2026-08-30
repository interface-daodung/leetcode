import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

const DB_PATH = fileURLToPath(new URL("../data/leetcode.db", import.meta.url));

export const sqlite = createClient({
  url: `file:${DB_PATH}`,
});

export const db = drizzle(sqlite, { schema });

await migrate(db, {
  migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
});

export { schema };
