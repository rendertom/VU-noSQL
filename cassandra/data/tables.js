const actorsData = require('./actors');
const filmsData = require('./films');
const generalData = require('./general');

const tables = {
  actors: {
    name: 'actors',
    queries: buildQueries(actorsData, 'actors'),
    table: `(
      actorID INT,
      lastName TEXT,
      PRIMARY KEY(actorID)
    );`,
  },
  actors_by_character: {
    name: 'actors_by_character',
    queries: buildQueries(generalData, 'actors_by_character'),
    table: `(
      actorID INT,
      character TEXT,
      filmID INT,
      lastName TEXT,
      title TEXT,
      PRIMARY KEY((character), actorID, filmID)
    ) WITH CLUSTERING ORDER BY (actorID ASC);`,
  },
  actors_by_film: {
    name: 'actors_by_film',
    queries: buildQueries(generalData, 'actors_by_film'),
    table: `(
      actorID INT,
      character TEXT,
      filmID INT,
      lastName TEXT,
      title TEXT,
      PRIMARY KEY((filmID), lastName, actorID)
    ) WITH CLUSTERING ORDER BY (lastName ASC);`,
  },
  actors_by_lastName: {
    name: 'actors_by_lastName',
    queries: buildQueries(actorsData, 'actors_by_lastName'),
    table: `(
      actorID INT,
      lastName TEXT,
      PRIMARY KEY((lastName), actorID)
    ) WITH CLUSTERING ORDER BY (actorID DESC);`,
  },
  characters_by_actor: {
    name: 'characters_by_actor',
    queries: buildQueries(generalData, 'characters_by_actor'),
    table: `(
      actorID INT,
      character TEXT,
      filmID INT,
      lastName TEXT,
      title TEXT,
      PRIMARY KEY ((actorID), character, title)
    ) WITH CLUSTERING ORDER BY (character ASC, title ASC);`,
  },
  characters_by_film: {
    name: 'characters_by_film',
    queries: buildQueries(generalData, 'characters_by_film'),
    table: `(
      actorID INT,
      character TEXT,
      filmID INT,
      lastName TEXT,
      title TEXT,
      PRIMARY KEY ((filmID), character, title)
    ) WITH CLUSTERING ORDER BY (character ASC, title ASC);`,
  },
  films: {
    name: 'films',
    queries: buildQueries(filmsData, 'films'),
    table: `(
      filmID INT,
      releaseDate TIMESTAMP,
      title TEXT,
      PRIMARY KEY (filmID)
    );`,
  },
  films_by_actor: {
    name: 'films_by_actor',
    queries: buildQueries(generalData, 'films_by_actor'),
    table: `(
      actorID INT,
      character TEXT,
      filmID INT,
      lastName TEXT,
      title TEXT,
      PRIMARY KEY ((actorID), character, title, filmID)
    ) WITH CLUSTERING ORDER BY (character ASC, title ASC, filmID DESC);`,
  },
  films_by_character: {
    name: 'films_by_character',
    queries: buildQueries(generalData, 'films_by_character'),
    table: `(
      actorID INT,
      character TEXT,
      filmID INT,
      lastName TEXT,
      title TEXT,
      PRIMARY KEY ((character), title, filmID)
    ) WITH CLUSTERING ORDER BY (title ASC);`,
  },
  films_by_title: {
    name: 'films_by_title',
    queries: buildQueries(filmsData, 'films_by_title'),
    table: `(
      filmID INT,
      releaseDate TIMESTAMP,
      title TEXT,
      PRIMARY KEY ((title), releaseDate, filmID)
    ) WITH CLUSTERING ORDER BY (releaseDate DESC);`,
  },
};

module.exports = {
  build: async function (client) {
    await Promise.all([
      createGenericTable(client, tables['actors']),
      createGenericTable(client, tables['actors_by_character']),
      createGenericTable(client, tables['actors_by_film']),
      createGenericTable(client, tables['actors_by_lastName']),
      createGenericTable(client, tables['characters_by_actor']),
      createGenericTable(client, tables['characters_by_film']),
      createGenericTable(client, tables['films']),
      createGenericTable(client, tables['films_by_actor']),
      createGenericTable(client, tables['films_by_character']),
      createGenericTable(client, tables['films_by_title']),
    ]);
  },
};

async function createGenericTable(client, data) {
  await client.execute(`DROP TABLE if exists ${data.name};`);
  await client.execute(`CREATE TABLE ${data.name} ${data.table}`);

  for (const query of data.queries) {
    await client.execute(query);
  }

  console.log(`Created ${data.name} table`);
}

function buildQueries(array, tableName) {
  return array.map((item) => item.replace('{{TABLE_NAME}}', tableName));
}
