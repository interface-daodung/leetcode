ALTER TABLE "problems" ADD COLUMN "slug" text;
--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "url" text;
--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "template" text;
--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "solution";
--> statement-breakpoint
CREATE TABLE "problem_assets" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"problem_id" integer NOT NULL,
	"original_url" text NOT NULL,
	"local_path" text NOT NULL,
	"hash" text NOT NULL,
	"created_at" text DEFAULT (datetime('now')),
	FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "problem_assets_hash_idx" ON "problem_assets" ("hash");
--> statement-breakpoint
CREATE INDEX "problem_assets_problem_idx" ON "problem_assets" ("problem_id");
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"problem_id" integer NOT NULL,
	"ord" integer NOT NULL,
	"content" text NOT NULL,
	FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "hints_problem_ord_idx" ON "hints" ("problem_id","ord");
