const cassandra = require('cassandra-driver');
const clc = require('cli-color');
const notice = (obj) => console.log(clc.blue('\n' + obj));

const tables = require('./data/tables');

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'laboras',
});

main();

async function main() {
  try {
    await client.connect();
    notice('> Start building tables');
    await tables.build(client);
    notice('> End building tables');

    await execute({
      title: 'Q1: Show all films in the database:',
      query: 'SELECT * FROM films;',
    });

    await execute({
      title: 'Q2: Show film details (filmID = 1):',
      query: 'SELECT * FROM films WHERE filmID = 1;',
    });

    await execute({
      title: 'Q3: Find films by title (title = "title:1"):',
      query: "SELECT * FROM films_by_title WHERE title = 'title:1'",
    });

    await execute({
      title:
        'Q4: Find films by title (title = "title:1") released after 2004-01-01:',
      query:
        "SELECT * FROM films_by_title WHERE title = 'title:1' AND releaseDate > toTimestamp('2004-01-01');",
    });

    await execute({
      title: 'Q5: Find films featuring an actor (actorID = 1):',
      query: 'SELECT * FROM films_by_actor WHERE actorID = 1;',
    });

    await execute({
      title:
        'Q6: Find films featuring an actor (actorID = 1) who played character by the name "character:6":',
      query:
        "SELECT * FROM films_by_actor WHERE actorID = 2 and character = 'character:6';",
    });

    await execute({
      title: 'Q7: Find films that has character by name "character:6":',
      query:
        "SELECT * FROM films_by_character WHERE character = 'character:6';",
    });

    await execute({
      title: 'Q8: Show all actors in the database:',
      query: 'SELECT * FROM actors;',
    });

    await execute({
      title: 'Q9: Show actor details (actorID = 1)',
      query: 'SELECT * FROM actors WHERE actorID = 1;',
    });

    await execute({
      title: 'Q10: Find actors by the lastname "lastName:1"',
      query: "SELECT * FROM actors_by_lastName WHERE lastName = 'lastName:1';",
    });

    await execute({
      title: 'Q11: Find actors who played character by the name "character:7"',
      query:
        "SELECT * FROM actors_by_character WHERE character = 'character:7';",
    });

    await execute({
      title: 'Q12: Find actors who played in move (movieID = 3):',
      query: 'SELECT * FROM actors_by_film WHERE filmID = 3;',
    });

    await execute({
      title: 'Q13: Find all characters in the movie (movieID = 1)',
      query: 'SELECT * FROM characters_by_film WHERE filmID = 1;',
    });

    await execute({
      title: 'Q14: Find all characters played by actor (actorID = 1)',
      query: 'SELECT * FROM characters_by_actor WHERE actorID = 1;',
    });
  } catch (error) {
    console.error(error);
  } finally {
    client.shutdown();
  }
}

async function execute({title, query}) {
  notice(title);
  const result = await client.execute(query);
  result.rows.forEach((row) => console.log({ ...row }));
}
