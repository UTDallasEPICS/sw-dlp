CREATE TABLE `prayerRequest` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`request` text NOT NULL,
	`submittedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prayerRequest_userId_unique` ON `prayerRequest` (`userId`);--> statement-breakpoint
ALTER TABLE `user` ADD `blocked` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `image`;