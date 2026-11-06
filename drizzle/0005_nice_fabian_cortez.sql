CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`title` text NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapter`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_chapter_id_unique` ON `activity` (`chapter_id`);--> statement-breakpoint
CREATE TABLE `activity_question` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`key` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`section` text,
	`description` text,
	`options` text,
	`correct_option_id` text,
	`position` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_question_key_unique` ON `activity_question` (`activity_id`,`key`);--> statement-breakpoint
CREATE TABLE `user_question_response` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`selected_option_id` text,
	`written_answers` text,
	`submitted_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `activity_question`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_question_unique` ON `user_question_response` (`user_id`,`question_id`);