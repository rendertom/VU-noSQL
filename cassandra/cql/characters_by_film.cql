USE laboras;
DROP TABLE if exists characters_by_film;
CREATE TABLE characters_by_film (
  actorID INT,
  character TEXT,
  filmID INT,
  lastName TEXT,
  title TEXT,
  PRIMARY KEY ((filmID), character, title)
) WITH CLUSTERING ORDER BY (character ASC, title ASC);

INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (1, 'lastName:1', 'character:1', 1, 'title:1') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (1, 'lastName:1', 'character:2', 2, 'title:2') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (1, 'lastName:1', 'character:3', 3, 'title:3') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (1, 'lastName:1', 'character:4', 4, 'title:4') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (1, 'lastName:1', 'character:5', 5, 'title:1') IF NOT EXISTS;

INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (2, 'lastName:2', 'character:6', 1, 'title:1') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (2, 'lastName:2', 'character:6', 3, 'title:3') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (2, 'lastName:2', 'character:7', 4, 'title:4') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (2, 'lastName:2', 'character:7', 5, 'title:1') IF NOT EXISTS;

INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (3, 'lastName:3', 'character:2', 1, 'title:1') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (3, 'lastName:3', 'character:3', 4, 'title:4') IF NOT EXISTS;

INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (4, 'lastName:1', 'character:7', 1, 'title:1') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (4, 'lastName:1', 'character:7', 3, 'title:3') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (4, 'lastName:1', 'character:1', 4, 'title:4') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (4, 'lastName:1', 'character:1', 5, 'title:1') IF NOT EXISTS;

INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (5, 'lastName:4', 'character:1', 2, 'title:2') IF NOT EXISTS;
INSERT INTO characters_by_film (actorID, lastName, character, filmID, title) VALUES (5, 'lastName:4', 'character:5', 4, 'title:4') IF NOT EXISTS;

select * from characters_by_film;
select * from characters_by_film where filmID = 1;