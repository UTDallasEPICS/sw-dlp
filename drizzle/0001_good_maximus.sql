CREATE TABLE `badge` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text
);
--> statement-breakpoint
CREATE TABLE `chapter` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `lesson` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`chapterId` text NOT NULL,
	FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userBadge` (
	`userId` text NOT NULL,
	`id` text NOT NULL,
	`earnedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`id`) REFERENCES `badge`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userLesson` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`lessonId` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `userLesson_userId_lessonId_unique` ON `userLesson` (`userId`,`lessonId`);--> statement-breakpoint
ALTER TABLE `user` ADD `phoneNumber` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `user` SET `phoneNumber` = 'migration-' || `id` WHERE `phoneNumber` = '';--> statement-breakpoint
ALTER TABLE `user` ADD `admin` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_phoneNumber_unique` ON `user` (`phoneNumber`);