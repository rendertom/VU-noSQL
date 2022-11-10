const { MongoClient } = require('mongodb');
const clc = require('cli-color');
const notice = (obj) => console.log(clc.blue(obj));

const postsData = require('./data/posts');
const usersData = require('./data/users');

const DB_URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'soc_tinklas';

let db;
let Post, User;

main();

async function main() {
  const client = new MongoClient(DB_URL);

  try {
    await client.connect();
    db = await initDatabase(client, DB_NAME);

    [Post, User] = await Promise.all([
      initCollection(db, 'posts', postsData),
      initCollection(db, 'users', usersData),
    ]);

    notice('> Naujo vartotojo sukūrimas:');
    var user = await createNewUser();
    console.log(user);

    notice('\n> Naujo įrašo sukūrimas:');
    var post = await createNewPost(user);
    console.log(post);

    notice('\n> Įrašo įkėlimas į vartotojo portfolio:');
    user = await addShortPostToUser(user, post);
    console.log(user);

    notice('\n> Naujo komentaro sukūrimas:');
    post = await leaveComment(user, post);
    console.log(post);

    notice("\n> Like'o inkrementavimas:");
    post = await addLike(post);
    console.log(post);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

///

async function createNewUser() {
  const user = {
    address: {
      city: 'Klaipėda',
      country: 'Lithuania',
      street: 'Žuvėdrų 100',
      zipCode: 1234,
    },
    email: 'dede_vania@gmail.com',
    firstName: 'Dėdė',
    lastName: 'Vania',
    profilePicture: 'https://randomuser.me/api/portraits/man/10.jpg',
    shortPosts: [],
  };

  user._id = (await User.insertOne(user)).insertedId;
  return user;
}

async function createNewPost(user) {
  const post = {
    authorInfo: {
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      userID: user._id,
    },
    comments: [],
    date: Date.now(),
    description: 'Description of the post',
    image: 'image url',
    numComments: 0,
    numLikes: 0,
    text: 'Long post text.',
    title: 'Post title',
    userID: user._id,
  };

  post._id = (await Post.insertOne(post)).insertedId;
  return post;
}

async function addShortPostToUser(user, post) {
  return (
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          shortPosts: {
            date: post.date,
            description: post.description,
            postID: post._id,
            title: post.title,
          },
        },
      },
      { returnDocument: 'after' }
    )
  ).value;
}

async function leaveComment(user, post) {
  return (
    await Post.findOneAndUpdate(
      { _id: post._id },
      {
        $inc: { numComments: 1 },
        $push: {
          comments: {
            date: Date.now(),
            text: 'this is some awesome post. I love it!',
            userInfo: {
              firstName: user.firstName,
              lastName: user.lastName,
              profilePicture: user.profilePicture,
              userID: user._id,
            },
          },
        },
      },
      {
        returnDocument: 'after',
      }
    )
  ).value;
}

async function addLike(post) {
  return (
    await Post.findOneAndUpdate(
      { _id: post._id },
      { $inc: { numLikes: 1 } },
      { returnDocument: 'after' }
    )
  ).value;
}

async function initCollection(db, collectionName, data) {
  const collection = db.collection(collectionName);
  try {
    await collection.drop();
  } catch (e) {}
  if (data && data.length > 0) {
    await collection.insertMany(data);
  }
  return collection;
}

async function initDatabase(client, databaseName) {
  const db = client.db(databaseName);
  await db.dropDatabase();
  return db;
}
