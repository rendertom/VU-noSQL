USE laboras;
DROP TABLE if exists films_by_title;
CREATE TABLE films_by_title (
  filmID INT,
  releaseDate TIMESTAMP,
  title TEXT,
  PRIMARY KEY ((title), releaseDate, filmID)
) WITH CLUSTERING ORDER BY (releaseDate DESC);

INSERT INTO films_by_title (filmID, releaseDate, title) VALUES (1, toTimestamp('2001-01-01'), 'title:1') IF NOT EXISTS;
INSERT INTO films_by_title (filmID, releaseDate, title) VALUES (2, toTimestamp('2002-01-01'), 'title:2') IF NOT EXISTS;
INSERT INTO films_by_title (filmID, releaseDate, title) VALUES (3, toTimestamp('2003-01-01'), 'title:3') IF NOT EXISTS;
INSERT INTO films_by_title (filmID, releaseDate, title) VALUES (4, toTimestamp('2004-01-01'), 'title:4') IF NOT EXISTS;
INSERT INTO films_by_title (filmID, releaseDate, title) VALUES (5, toTimestamp('2005-01-01'), 'title:1') IF NOT EXISTS;

select * from films_by_title;
select * from films_by_title where title='title:1';
select * from films_by_title where title='title:1' and releaseDate > toTimestamp('2004-01-01');