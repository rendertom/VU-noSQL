const { MongoClient } = require('mongodb');

const actorsData = require('./data/actors');
const moviesData = require('./data/movies');
const reviewsData = require('./data/reviews');

const DB_URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'laboras';
const MAX_RECENT_REVIEWS = 2;

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
    await calculateRatringWithAggregation();
    await calculateRatingWithMapReduce();
    await listReviewsForMovie('movie 1');
    await postReview();
    await calculateRatringWithAggregation();
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

///

async function calculateRatringWithAggregation() {
  console.log(`Calculate average rating using aggregation:`);

  const groupOptions = {
    _id: '$movie._id',
    title: { $first: '$movie.title' },
    averageRating: { $avg: '$rating' },
    ratingsCount: { $sum: 1 },
  };

  const sortOptions = { _id: 1, 'movie._id': 1 };

  const pipeline = [{ $group: groupOptions }, { $sort: sortOptions }];
  const result = await Review.aggregate(pipeline).toArray();
  if (result && result.length > 0) {
    result.forEach((item) => {
      console.log(`${item.title}:`);
      console.log('  Average rating:', item.averageRating);
      console.log('  Number of ratings:', item.ratingsCount);
    });
  } else {
    console.error(`Could not aggregate data`);
  }
}

async function calculateRatingWithMapReduce() {
  console.log(`Calculate average rating using mapReduce:`);

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
  const result = await Movie.findOne(
    { title: 'movie 1' },
    { projection: { _id: 1 } }
  );
  if (!result) return console.log(`Could not find movie by title ${title}`);

  const { _id } = result;
  const review = {
    movie: { _id, title },
    text,
    rating,
  };
  const { acknowledged: ac1, insertedId } = await Review.insertOne(review);
  if (!ac1) return console.error(`Could not insert document`);

  const recentReview = {
    _id: insertedId,
    rating: review.rating,
    text: review.text,
  };
  const { acknowledged: ac2 } = await Movie.updateOne(
    { _id },
    {
      $push: {
        recent_reviews: {
          $each: [recentReview],
          $position: 0,
          $slice: MAX_RECENT_REVIEWS,
        },
      },
    }
  );

  if (!ac2) return console.error(`Could not add recent review`);
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
