const { MongoClient } = require('mongodb');
const clc = require('cli-color');
const notice = (obj) => console.log(clc.blue(obj));

const moviesData = require('./data/movies');
const reviewsData = require('./data/reviews');

const DB_URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'laboras';
const MAX_RECENT_REVIEWS = 2;

let db;
let Movie, Review;

main();

async function main() {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();
    db = await initDatabase(client, DB_NAME);

    [Movie, Review] = await Promise.all([
      initCollection(db, 'movies', moviesData),
      initCollection(db, 'reviews', reviewsData),
    ]);

    notice(`> Collections in the "${DB_NAME}" database:`);
    console.log(await getCollectionNames(db));

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
  notice(`\n> Calculate average rating using aggregation:`);

  const groupOptions = {
    _id: '$shortMovieInfo.movieID',
    title: { $first: '$shortMovieInfo.title' },
    averageRating: { $avg: '$rating' },
    ratingsCount: { $sum: 1 },
  };

  const sortOptions = { _id: 1, 'shortMovieInfo.movieID': 1 };

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
  notice(`\n> Calculate average rating using mapReduce:`);

  const map = function () {
    emit(this.shortMovieInfo.movieID, this.rating);
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
    date: Date.now(),
    rating,
    shortMovieInfo: { movieID: _id, title },
    text,
    userName: 'computer',
  };
  const { acknowledged: ac1, insertedId } = await Review.insertOne(review);
  if (!ac1) return console.error(`Could not insert document`);

  const recentReview = {
    rating: review.rating,
    reviewID: insertedId,
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
  notice(
    `\n> Listing embeded "recent_reviews" and "studio" properties for a movie "${title}":`
  );

  const query = { title };
  const options = {
    projection: { _id: 0, recent_reviews: 1, studio: 1 },
  };
  const result = await Movie.findOne(query, options);

  if (result) {
    const { recent_reviews, studio } = result;
    console.log(`Recent reviews (${recent_reviews.length}):`, recent_reviews);
    console.log(`Studio:`, studio);
  } else {
    console.log(`Movie "${query.title}" does not exist`);
  }
}

async function listReviewsForMovie(title) {
  notice(`\n> Listing all reviews for a movie "${title}":`);

  const query = { 'shortMovieInfo.title': title };
  const options = {
    projection: { _id: 0, date: 0, shortMovieInfo: 0, userName: 0 },
  };
  const result = await Review.find(query, options).toArray();

  if (result && result.length > 0) {
    console.log(result);
  } else {
    console.log(`Could not find any movies by title "${title}"`);
  }
}

async function postReview() {
  const title = 'movie 1';
  notice(`\n> Movie "${title}" BEFORE submiting a review:`);
  console.log(await Movie.findOne({ title }));
  await createReview({
    title,
    text: 'Best of the best!',
    rating: 11,
  });
  notice(`\n> Movie "${title}" AFTER submiting a review:`);
  console.log(await Movie.findOne({ title }));
}
