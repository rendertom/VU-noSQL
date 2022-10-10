USE laboras;
DROP TABLE if exists actors_by_lastName;
CREATE TABLE actors_by_lastName (
  actorID INT,
  lastName TEXT,
  PRIMARY KEY((lastName), actorID)
) WITH CLUSTERING ORDER BY (actorID DESC);

INSERT INTO actors_by_lastName (actorID, lastName) VALUES (1, 'lastName:1') IF NOT EXISTS;
INSERT INTO actors_by_lastName (actorID, lastName) VALUES (2, 'lastName:2') IF NOT EXISTS;
INSERT INTO actors_by_lastName (actorID, lastName) VALUES (3, 'lastName:3') IF NOT EXISTS;
INSERT INTO actors_by_lastName (actorID, lastName) VALUES (4, 'lastName:1') IF NOT EXISTS;
INSERT INTO actors_by_lastName (actorID, lastName) VALUES (5, 'lastName:4') IF NOT EXISTS;

select * from actors_by_lastName;
select * from actors_by_lastName where lastName='lastName:1'