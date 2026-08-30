CREATE TABLE `problems` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`difficulty` text NOT NULL,
	`tags` text DEFAULT '[]',
	`description` text NOT NULL,
	`solution` text,
	`test_cases` text DEFAULT '[]',
	`created_at` text DEFAULT '(datetime(''now''))'
);
