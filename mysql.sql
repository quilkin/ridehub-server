-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema trurocc_ridehub
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema trurocc_ridehub
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `trurocc_ridehub` DEFAULT CHARACTER SET utf8 ;
USE `trurocc_ridehub` ;

-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`Participants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`Participants` (
  `rideID` INT(11) NOT NULL,
  `rider` VARCHAR(45) NOT NULL DEFAULT 'nobody',
  `state` INT(11) NULL DEFAULT 1 COMMENT '0=left, 1=joined, 2-waiting list')
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`cafes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`cafes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL DEFAULT 'cafe',
  `placename` VARCHAR(45) NOT NULL DEFAULT 'location',
  `lat` DOUBLE NOT NULL,
  `lng` DOUBLE NOT NULL,
  `daysopen` VARCHAR(255) NOT NULL DEFAULT 'every day',
  `timesopen` VARCHAR(45) NOT NULL DEFAULT '""',
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `user` VARCHAR(45) NOT NULL DEFAULT 'unknown',
  `updated` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 28
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`library`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`library` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `author` VARCHAR(45) NULL DEFAULT NULL,
  `title` VARCHAR(100) NULL DEFAULT NULL,
  `owner` VARCHAR(45) NULL DEFAULT NULL,
  `comment` VARCHAR(255) NOT NULL DEFAULT '',
  `who` VARCHAR(45) NOT NULL DEFAULT '',
  `time` DATETIME NULL DEFAULT NULL,
  `state` INT(11) NULL DEFAULT 0,
  PRIMARY KEY (`id`, `comment`))
ENGINE = InnoDB
AUTO_INCREMENT = 119
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`log` (
  `time` TEXT NULL DEFAULT NULL,
  `ip` TEXT NULL DEFAULT NULL,
  `args` TEXT NULL DEFAULT NULL,
  `result` TEXT NULL DEFAULT NULL,
  `func` TEXT NULL DEFAULT NULL,
  `error` TEXT NULL DEFAULT NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`logins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`logins` (
  `name` VARCHAR(31) NOT NULL,
  `pw` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `code` INT(11) NULL DEFAULT NULL,
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `role` INT(11) NULL DEFAULT 1,
  `messagetime` DATETIME NULL DEFAULT NULL,
  `units` CHAR(1) NOT NULL DEFAULT 'k',
  `climbs` INT(11) NULL DEFAULT 0,
  `notifications` INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 247
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`members`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`members` (
  `number` INT(11) NOT NULL AUTO_INCREMENT,
  `committee` TEXT NULL DEFAULT '',
  `fname` TEXT NULL DEFAULT '',
  `surname` TEXT NULL DEFAULT '',
  `subs` INT(1) NULL DEFAULT 20,
  `paidDate` DATETIME NULL DEFAULT NULL,
  `gender` TEXT NULL DEFAULT '',
  `joinedDate` DATETIME NULL DEFAULT NULL,
  `address1` TEXT NULL DEFAULT '',
  `address2` TEXT NULL DEFAULT '',
  `address3` TEXT NULL DEFAULT '',
  `postcode` TEXT NULL DEFAULT '',
  `phone` TEXT NULL DEFAULT '',
  `email` TEXT NULL DEFAULT '',
  `waChat` INT(1) NULL DEFAULT 0,
  `waInfo` INT(1) NULL DEFAULT 0,
  `waLeisure` INT(1) NULL DEFAULT 0,
  `payMethod` VARCHAR(45) NULL DEFAULT 'BACS',
  `nextOfKin` VARCHAR(45) NULL DEFAULT '',
  `nokPhone` VARCHAR(45) NULL DEFAULT '',
  PRIMARY KEY (`number`))
ENGINE = InnoDB
AUTO_INCREMENT = 58
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`personRides`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`personRides` (
  `riderID` INT(11) NULL DEFAULT NULL,
  `routeID` INT(11) NULL DEFAULT NULL,
  `started` TINYINT(1) NOT NULL DEFAULT 1,
  `finished` TINYINT(1) NOT NULL DEFAULT 1)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`rides`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`rides` (
  `rideID` INT(11) NOT NULL AUTO_INCREMENT,
  `dest` VARCHAR(45) NULL DEFAULT 'see routeID',
  `date` INT(11) NOT NULL,
  `time` INT(11) NOT NULL DEFAULT 0,
  `meetingAt` VARCHAR(40) NULL DEFAULT 'Lemon Quay',
  `leaderName` VARCHAR(45) NOT NULL,
  `routeID` INT(11) NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `groupSize` INT(11) NOT NULL DEFAULT 10,
  `minSpeed` INT(11) NULL DEFAULT 0,
  `maxSpeed` INT(11) NULL DEFAULT 0,
  PRIMARY KEY (`rideID`))
ENGINE = InnoDB
AUTO_INCREMENT = 827
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`routes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`routes` (
  `route` MEDIUMTEXT NOT NULL,
  `dest` TEXT NOT NULL,
  `distance` INT(11) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `climbing` INT(11) NULL DEFAULT NULL,
  `owner` INT(11) NOT NULL DEFAULT 0,
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ownername` VARCHAR(45) NULL DEFAULT NULL,
  `hasGPX` TINYINT(4) NOT NULL,
  `miniroute` MEDIUMTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 636
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`settings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`settings` (
  `maxriders` INT(11) NOT NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `trurocc_ridehub`.`transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `trurocc_ridehub`.`transactions` (
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `who` VARCHAR(45) NOT NULL DEFAULT '',
  `date` INT(11) NOT NULL DEFAULT 0,
  `action` INT(11) NOT NULL DEFAULT 0,
  `idTrans` INT(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idTrans`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
