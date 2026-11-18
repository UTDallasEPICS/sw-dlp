DROP INDEX `prayerRequest_userId_unique`;--> statement-breakpoint
CREATE INDEX `prayerRequest_userId_idx` ON `prayerRequest` (`userId`);