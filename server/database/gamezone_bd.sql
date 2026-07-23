-- =====================================================================
--  GameZone BD — MySQL database (schema + seed data)
--
--  Import with:
--    mysql -u root -p < server/database/gamezone_bd.sql
--
--  This creates the `gamezone_bd` database, all tables, and the data the
--  app needs to run: an admin account, sample stations, packages,
--  tournaments, and default site settings.
--
--  Default admin login:  admin@gamezone.bd  /  admin1234
--
--  Column definitions mirror the Sequelize models exactly, so the running
--  app (which calls sequelize.sync()) is fully compatible with these tables.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `gamezone_bd`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gamezone_bd`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `tournament_participants`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `tournaments`;
DROP TABLE IF EXISTS `packages`;
DROP TABLE IF EXISTS `stations`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(255) NOT NULL,
  `email`        VARCHAR(255) NOT NULL,
  `phone`        VARCHAR(255) DEFAULT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role`         ENUM('customer','staff','admin') NOT NULL DEFAULT 'customer',
  `permissions`  JSON DEFAULT NULL,
  `isBlocked`    TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt`    DATETIME NOT NULL,
  `updatedAt`    DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- stations
-- ---------------------------------------------------------------------
CREATE TABLE `stations` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(255) NOT NULL,
  `type`         ENUM('PS5','PC','VR','Pool','Snooker','Other') NOT NULL,
  `image`        VARCHAR(255) DEFAULT '',
  `pricePerHour` INT NOT NULL,
  `status`       ENUM('active','maintenance') NOT NULL DEFAULT 'active',
  `description`  TEXT,
  `createdAt`    DATETIME NOT NULL,
  `updatedAt`    DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- packages
-- ---------------------------------------------------------------------
CREATE TABLE `packages` (
  `id`              INT NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(255) NOT NULL,
  `price`           INT NOT NULL,
  `durationHours`   INT NOT NULL,
  `description`     TEXT,
  `discountPercent` INT NOT NULL DEFAULT 0,
  `active`          TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt`       DATETIME NOT NULL,
  `updatedAt`       DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- tournaments
-- ---------------------------------------------------------------------
CREATE TABLE `tournaments` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255) NOT NULL,
  `description` TEXT,
  `date`        DATETIME NOT NULL,
  `entryFee`    INT NOT NULL DEFAULT 0,
  `bannerImage` VARCHAR(255) DEFAULT '',
  `status`      ENUM('upcoming','ongoing','finished') NOT NULL DEFAULT 'upcoming',
  `createdAt`   DATETIME NOT NULL,
  `updatedAt`   DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------
CREATE TABLE `bookings` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `userId`        INT NOT NULL,
  `stationId`     INT NOT NULL,
  `date`          DATE NOT NULL,
  `startTime`     VARCHAR(255) NOT NULL,
  `endTime`       VARCHAR(255) NOT NULL,
  `status`        ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `paymentStatus` ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  `totalPrice`    INT NOT NULL,
  `isWalkIn`      TINYINT(1) NOT NULL DEFAULT 0,
  `notes`         VARCHAR(255) DEFAULT '',
  `createdAt`     DATETIME NOT NULL,
  `updatedAt`     DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_station_date` (`stationId`, `date`),
  CONSTRAINT `bookings_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_station_fk`
    FOREIGN KEY (`stationId`) REFERENCES `stations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- settings (single row, id = 1)
-- ---------------------------------------------------------------------
CREATE TABLE `settings` (
  `id`            INT NOT NULL DEFAULT 1,
  `siteName`      VARCHAR(255) DEFAULT 'GameZone BD',
  `logoUrl`       VARCHAR(255) DEFAULT '',
  `contactPhone`  VARCHAR(255) DEFAULT '',
  `contactEmail`  VARCHAR(255) DEFAULT '',
  `address`       TEXT,
  `openingHours`  VARCHAR(255) DEFAULT '10:00 AM – 11:00 PM',
  `mapEmbedUrl`   TEXT,
  `socialLinks`   JSON DEFAULT NULL,
  `hero`          JSON DEFAULT NULL,
  `offers`        JSON DEFAULT NULL,
  `testimonials`  JSON DEFAULT NULL,
  `galleryImages` JSON DEFAULT NULL,
  `createdAt`     DATETIME NOT NULL,
  `updatedAt`     DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- tournament_participants (many-to-many join: tournaments <-> users)
-- ---------------------------------------------------------------------
CREATE TABLE `tournament_participants` (
  `tournamentId` INT NOT NULL,
  `userId`       INT NOT NULL,
  `createdAt`    DATETIME NOT NULL,
  `updatedAt`    DATETIME NOT NULL,
  PRIMARY KEY (`tournamentId`, `userId`),
  KEY `tp_user_fk` (`userId`),
  CONSTRAINT `tp_tournament_fk`
    FOREIGN KEY (`tournamentId`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tp_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  SEED DATA
-- =====================================================================

-- Admin account — password is "admin1234" (bcrypt hashed).
INSERT INTO `users`
  (`name`, `email`, `phone`, `passwordHash`, `role`, `permissions`, `isBlocked`, `createdAt`, `updatedAt`)
VALUES
  ('Super Admin', 'admin@gamezone.bd', '017000000000',
   '$2a$10$8X5fuRciIN0aFMCrg3MZuOe4db9ZwU5OqboZWJWKKrC6G9FQxy9/u',
   'admin', '[]', 0, NOW(), NOW());

-- Stations
INSERT INTO `stations`
  (`name`, `type`, `image`, `pricePerHour`, `status`, `description`, `createdAt`, `updatedAt`)
VALUES
  ('PS5 Station 1', 'PS5',     '', 200, 'active',      'PlayStation 5 with 4K TV and DualSense controllers.', NOW(), NOW()),
  ('PS5 Station 2', 'PS5',     '', 200, 'active',      'PlayStation 5 with FIFA, Call of Duty and more.',     NOW(), NOW()),
  ('Gaming PC 1',   'PC',      '', 150, 'active',      'RTX 4070, 240Hz monitor, mechanical keyboard.',       NOW(), NOW()),
  ('VR Arena',      'VR',      '', 300, 'active',      'Meta Quest 3 immersive VR experiences.',              NOW(), NOW()),
  ('Pool Table 1',  'Pool',    '', 250, 'active',      'Professional 8-ball pool table.',                     NOW(), NOW()),
  ('Snooker Table', 'Snooker', '', 350, 'maintenance', 'Full-size snooker table.',                            NOW(), NOW());

-- Packages
INSERT INTO `packages`
  (`name`, `price`, `durationHours`, `description`, `discountPercent`, `active`, `createdAt`, `updatedAt`)
VALUES
  ('Happy Hour',      500, 3, '3 hours of gaming at a discounted rate. Weekdays only.', 15, 1, NOW(), NOW()),
  ('Squad Combo',    1200, 4, '4 PS5 controllers, 4 hours. Perfect for friends.',      20, 1, NOW(), NOW()),
  ('Weekend Warrior', 800, 5, '5 hours of PC gaming on the weekend.',                  10, 1, NOW(), NOW());

-- Tournaments
INSERT INTO `tournaments`
  (`title`, `description`, `date`, `entryFee`, `bannerImage`, `status`, `createdAt`, `updatedAt`)
VALUES
  ('FIFA 25 Champions Cup', 'Single-elimination FIFA 25 tournament. Prize pool 10,000 BDT.',
   DATE_ADD(NOW(), INTERVAL 14 DAY), 300, '', 'upcoming', NOW(), NOW()),
  ('Valorant 5v5 Showdown', 'Team-based Valorant competition. Bring your squad!',
   DATE_ADD(NOW(), INTERVAL 14 DAY), 500, '', 'upcoming', NOW(), NOW());

-- Site settings (single row)
INSERT INTO `settings`
  (`id`, `siteName`, `logoUrl`, `contactPhone`, `contactEmail`, `address`,
   `openingHours`, `mapEmbedUrl`, `socialLinks`, `hero`, `offers`, `testimonials`,
   `galleryImages`, `createdAt`, `updatedAt`)
VALUES
  (1, 'GameZone BD', '', '+880 1700-000000', 'hello@gamezone.bd',
   'House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh',
   '10:00 AM – 11:00 PM (Everyday)', '',
   JSON_OBJECT(
     'facebook',  'https://facebook.com/gamezonebd',
     'instagram', 'https://instagram.com/gamezonebd',
     'whatsapp',  'https://wa.me/8801700000000'
   ),
   JSON_OBJECT(
     'title',    'Level Up Your Game at GameZone BD',
     'subtitle', 'Book PS5, PC, VR & Pool tables by the hour. Play. Compete. Win.',
     'image',    '',
     'ctaText',  'Book Now'
   ),
   JSON_ARRAY(
     JSON_OBJECT('title', 'Student Discount',
                 'description', '20% off on weekdays with a valid student ID.',
                 'image', '')
   ),
   JSON_ARRAY(
     JSON_OBJECT('name', 'Rakib H.',  'message', 'Best gaming lounge in Dhaka! The PS5 setup is amazing.', 'avatar', ''),
     JSON_OBJECT('name', 'Nabila K.', 'message', 'Loved the VR experience. Staff were super friendly.',    'avatar', '')
   ),
   JSON_ARRAY(),
   NOW(), NOW());

-- Done. Log in as admin@gamezone.bd / admin1234
