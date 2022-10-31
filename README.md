# WebP-project
Election Management App using node js and mysql

run the following commands after creating database :
```
npm install
npm run devStart
```

create a MySQL database with a schema test

```
database : 'test',
user : 'root',
password : '1234'
```

```
use test;

CREATE TABLE `Voter` (
	`Rollno` VARCHAR(255) NOT NULL,
	`Name` VARCHAR(255) NOT NULL,
	`Email` VARCHAR(255) NOT NULL UNIQUE,
	`Password` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`Rollno`)
);

CREATE TABLE `POST` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` VARCHAR(255) NOT NULL UNIQUE,
	`Desc` TEXT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `CANDIDATE` (
	`Rollno` VARCHAR(255) NOT NULL ,
	`Post_id` INT NOT NULL,
	`Manifesto` TEXT NOT NULL,
	PRIMARY KEY (`Rollno`)
);

CREATE TABLE `VOTE` (
	`Vote_id` INT NOT NULL AUTO_INCREMENT,
	`Post_id` INT NOT NULL,
	`Candidate_id` VARCHAR(255) NOT NULL,
	`Cast_time` DATETIME NOT NULL,
	PRIMARY KEY (`Vote_id`)
);

CREATE TABLE `ELECTION` (
	`Election_id` INT NOT NULL AUTO_INCREMENT,
	`Start_time` DATETIME NOT NULL,
	`End_time` DATETIME NOT NULL,
	`Votes_counted` boolean NOT NULL DEFAULT 1,
	PRIMARY KEY (`Election_id`)
);
insert into election values (1, '2022-10-29 00:00:00', '2022-11-01 00:00:00', 0);

CREATE TABLE `ELECTION_COORDINATOR` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Username` VARCHAR(255) NOT NULL UNIQUE,
	`Password` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`Id`)
);
insert into ELECTION_COORDINATOR values (1, 'ec', '1234');

ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_fk0` FOREIGN KEY (`Rollno`) REFERENCES `Voter`(`Rollno`);

ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_fk1` FOREIGN KEY (`Post_id`) REFERENCES `POST`(`Id`);

ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_fk0` FOREIGN KEY (`Post_id`) REFERENCES `POST`(`Id`);

ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_fk1` FOREIGN KEY (`Candidate_id`) REFERENCES `CANDIDATE`(`Rollno`);
```