import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const sqlite = createClient({
  url: "file:leetcode.db",
});

export const db = drizzle(sqlite, { schema });
export { schema };