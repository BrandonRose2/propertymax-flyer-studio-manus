CREATE TABLE `propertyPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` varchar(80) NOT NULL,
	`label` varchar(180) NOT NULL,
	`originalFileName` varchar(220) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`source` enum('individual','zip') NOT NULL,
	`uploadedByOpenId` varchar(64) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyPhotos_id` PRIMARY KEY(`id`),
	CONSTRAINT `propertyPhotos_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `property_photos_property_uploaded_idx` ON `propertyPhotos` (`propertyId`,`uploadedAt`);--> statement-breakpoint
CREATE INDEX `property_photos_uploaded_by_idx` ON `propertyPhotos` (`uploadedByOpenId`);