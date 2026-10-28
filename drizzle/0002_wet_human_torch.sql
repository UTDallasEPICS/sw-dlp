CREATE TABLE `chapterVideo` (
	`id` text PRIMARY KEY NOT NULL,
	`chapterId` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `chapter` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `chapter` ADD `content` text;--> statement-breakpoint
CREATE UNIQUE INDEX `chapter_slug_unique` ON `chapter` (`slug`);