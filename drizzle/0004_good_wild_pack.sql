CREATE TABLE IF NOT EXISTS `courseTitles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
ALTER TABLE `courseTitles` ADD `chapters` text NOT NULL DEFAULT '[]';
