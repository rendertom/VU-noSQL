module.exports = [
  `INSERT INTO {{TABLE_NAME}} (actorID, lastName) VALUES (1, 'lastName:1') IF NOT EXISTS;`,
  `INSERT INTO {{TABLE_NAME}} (actorID, lastName) VALUES (2, 'lastName:2') IF NOT EXISTS;`,
  `INSERT INTO {{TABLE_NAME}} (actorID, lastName) VALUES (3, 'lastName:3') IF NOT EXISTS;`,
  `INSERT INTO {{TABLE_NAME}} (actorID, lastName) VALUES (4, 'lastName:1') IF NOT EXISTS;`,
  `INSERT INTO {{TABLE_NAME}} (actorID, lastName) VALUES (5, 'lastName:4') IF NOT EXISTS;`,
];
