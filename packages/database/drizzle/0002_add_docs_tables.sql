CREATE TABLE `doc_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lang` text NOT NULL,
	`source_file` text NOT NULL,
	`source_url` text,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`tags` text DEFAULT '[]',
	`total_sections` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `doc_files_lang_source_idx` ON `doc_files` (`lang`,`source_file`);--> statement-breakpoint
CREATE TABLE `doc_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lang` text NOT NULL,
	`section_id` text NOT NULL,
	`doc_file_id` integer NOT NULL,
	`ord` integer NOT NULL,
	`title` text NOT NULL,
	`heading_level` integer DEFAULT 2 NOT NULL,
	`anchor` text,
	`summary` text,
	`keywords` text DEFAULT '[]',
	`syntax` text,
	`returns` text,
	`mutates` integer,
	`mdn_url` text,
	`examples` text DEFAULT '[]',
	`tables` text DEFAULT '[]',
	`related` text DEFAULT '[]',
	`content` text NOT NULL,
	`content_html` text,
	`search_text` text,
	`category` text NOT NULL,
	FOREIGN KEY (`doc_file_id`) REFERENCES `doc_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `doc_sections_lang_section_idx` ON `doc_sections` (`lang`,`section_id`);--> statement-breakpoint
CREATE INDEX `doc_sections_lang_category_idx` ON `doc_sections` (`lang`,`category`);--> statement-breakpoint
CREATE INDEX `doc_sections_file_ord_idx` ON `doc_sections` (`doc_file_id`,`ord`);