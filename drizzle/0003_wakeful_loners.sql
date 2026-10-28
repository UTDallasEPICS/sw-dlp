PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chapter` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`content` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_chapter`("id", "name", "slug", "description", "content") SELECT "id", "name", "slug", "description", "content" FROM `chapter`;--> statement-breakpoint
DROP TABLE `chapter`;--> statement-breakpoint
ALTER TABLE `__new_chapter` RENAME TO `chapter`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `chapter_slug_unique` ON `chapter` (`slug`);