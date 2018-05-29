-------------------------------------------------------
--Copyright (c) 2018, Gerald Selvino 
--<gerald.selvino@protonmail.com> All rights reserved.
--
--Precreates the database and transactions table.
--Our choice of DB is the open source MariaDb
-------------------------------------------------------



CREATE DATABASE IF NOT EXISTS `btxvalidator-db`;
USE `btxvalidator-db`;

CREATE TABLE IF NOT EXISTS `btxvalidator-db`.`transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(100) CHARACTER SET 'utf8' NULL,
  `amount` DECIMAL(16,8) NULL,
  `txid` VARCHAR(150) CHARACTER SET 'utf8' NULL,
  `vout` INT NOT NULL,
  PRIMARY KEY (`id`)
);
