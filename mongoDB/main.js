const { MongoClient } = require('mongodb');

const actorsData = require('./data/actors');
const moviesData = require('./data/movies');
const reviewsData = require('./data/reviews');

const DB_URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'laboras';

let db;
let Actor, Movie, Review;

main();

async function main() {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();
    db = await initDatabase(client, DB_NAME);

    [Actor, Movie, Review] = await Promise.all([
      initCollection(db, 'actors', actorsData),
      initCollection(db, 'movies', moviesData),
      initCollection(db, 'reviews', reviewsData),
    ]);

    console.log(
      `Collections in the "${DB_NAME}" database:`,
      await getCollectionNames(db)
    );

    console.log('---------');

    await listEmbededProperties('movie 1');
    await calculateAverageRatingForMovie('movie 1');
    await calculateAverageRatingWithMapReduce();
    await listReviewsForMovie('movie 1');
    await postReview();
    await calculateAverageRatingForMovie('movie 1');
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

///

async function calculateAverageRatingForMovie(title) {
  console.log(`Calculate average rating for "${title}":`);

  const pipeline = [
    { $match: { 'movie.title': title } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        ratingsCount: { $sum: 1 },
      },
    },
  ];
  const result = await Review.aggregate(pipeline).toArray();
  if (result && result.length > 0) {
    console.log('Average rating:', result[0].averageRating);
    console.log('Number of ratings:', result[0].ratingsCount);
  } else {
    console.error(`Could not aggregate data for movie "${title}"`);
  }
}

async function calculateAverageRatingWithMapReduce() {
  const map = function () {
    emit(this.movie._id, this.rating);
  };
  const reduce = function (_id, values) {
    return {
      averageRating: values.reduce((a, b) => a + b) / values.length,
      ratingsCount: values.length,
    };
  };
  const options = {
    out: 'output',
  };

  await Review.mapReduce(map, reduce, options);
  const result = await db.collection(options.out).find().toArray();
  console.log(result);
}

async function createReview({ title, text, rating }) {
  const movie = await Movie.findOne({ title });
  if (!movie) return console.log(`Could not find movie by title ${title}`);

  const doc = {
    movie: { _id: movie._id, title },
    text,
    rating,
  };
  const { acknowledged: ac1, insertedId } = await Review.insertOne(doc);
  if (!ac1) return console.error(`Could not insert document`);

  if (movie.recent_reviews.length >= 2) {
    const { acknowledged: ac2 } = await Movie.updateOne(
      { title },
      { $pop: { recent_reviews: -1 } }
    );
    if (!ac2) return console.error(`Could not pop first element in array`);
  }

  const { acknowledged: ac3 } = await Movie.updateOne(
    { title },
    {
      $push: {
        recent_reviews: {
          _id: insertedId,
          rating: doc.rating,
          text: doc.text,
        },
      },
    }
  );
  if (!ac3) return console.error(`Could not push element into array`);

  return true;
}

async function getCollectionNames(db) {
  const collections = await db.listCollections().toArray();
  return collections.map((item) => item.name);
}

async function initCollection(db, collectionName, data) {
  const collection = db.collection(collectionName);
  try {
    await collection.drop();
  } catch (e) {}
  await collection.insertMany(data);
  return collection;
}

async function initDatabase(client, databaseName) {
  const db = client.db(databaseName);
  await db.dropDatabase();
  return db;
}

async function listEmbededProperties(title) {
  console.log(
    `Listing embeded "top_actors" and "recent_reviews" properties for a movie "${title}":`
  );

  const query = { title };
  const options = {
    projection: { _id: 0, top_actors: 1, recent_reviews: 1 },
  };
  const result = await Movie.findOne(query, options);

  if (result) {
    const { top_actors, recent_reviews } = result;
    console.log(`Top actors (${top_actors.length}): `, top_actors);
    console.log(`Recent reviews (${recent_reviews.length}):`, recent_reviews);
  } else {
    console.log(`Movie "${query.title}" does not exist`);
  }
}

async function listReviewsForMovie(title) {
  console.log(`Listing all reviews for a movie "${title}":`);

  const query = { 'movie.title': title };
  const options = { projection: { _id: 0, movie: 0 } };
  const result = await Review.find(query, options).toArray();

  if (result && result.length > 0) {
    console.log(result);
  } else {
    console.log(`Could not find any movies by title "${title}"`);
  }
}

async function postReview() {
  const title = 'movie 1';
  console.log('Before submiting a review:', await Movie.findOne({ title }));
  await createReview({
    title,
    text: 'Best of the best!',
    rating: 11,
  });
  console.log('After submitting a review:', await Movie.findOne({ title }));
}
