USE laboras;
DROP TABLE if exists films;
CREATE TABLE films (
  filmID INT,
  releaseDate TIMESTAMP,
  title TEXT,
  PRIMARY KEY (filmID)
);

INSERT INTO films (filmID, releaseDate, title) VALUES (1, toTimestamp('2001-01-01'), 'title:1') IF NOT EXISTS;
INSERT INTO films (filmID, releaseDate, title) VALUES (2, toTimestamp('2002-01-01'), 'title:2') IF NOT EXISTS;
INSERT INTO films (filmID, releaseDate, title) VALUES (3, toTimestamp('2003-01-01'), 'title:3') IF NOT EXISTS;
INSERT INTO films (filmID, releaseDate, title) VALUES (4, toTimestamp('2004-01-01'), 'title:4') IF NOT EXISTS;
INSERT INTO films (filmID, releaseDate, title) VALUES (5, toTimestamp('2005-01-01'), 'title:1') IF NOT EXISTS;

select * from films;