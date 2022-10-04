import { createClient } from 'redis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const prompt = require('prompt-sync')();

const redisCLI = await initRedis();
const SEPARATOR = ':';

main();

async function main() {
  while (confirm('> Create a new user? Y/N: ', 'Y')) {
    const user = userPrompt();
    (await user_create(user))
      ? console.log(`Created new user ${user.firstName} ${user.lastName}`)
      : console.error('Could not create a user.');
  }

  while (confirm('> Make a transfer? Y/N: ', 'Y')) {
    const hash1 = await promptAndGetUserKey('From user: ');
    if (!(await keyExists(hash1))) {
      console.log('User does not exist.');
      continue;
    }

    redisCLI.WATCH(hash1);
    const user1 = await user_get(hash1);

    const hash2 = await promptAndGetUserKey('To user: ');
    if (!(await keyExists(hash2))) {
      console.log('User does not exist.');
      continue;
    }

    const user2 = await user_get(hash2);

    const amount = parseFloat(prompt('Amount to transfer: '));
    if (isNaN(amount)) {
      console.error('Amount is not a number');
      continue;
    }

    if (user1.balance < amount) {
      console.log('Insufficient funds');
      continue;
    }

    const [error1, error2, balance1, balance2] = await redisCLI
      .multi()
      .hSet(hash1, 'balance', parseFloat(user1.balance) - amount)
      .hSet(hash2, 'balance', parseFloat(user2.balance) + amount)
      .hGet(hash1, 'balance')
      .hGet(hash2, 'balance')
      .exec();

    if (error1 || error2) {
      console.log('Transaction failed: ', replyFrom, replyTo);
    } else {
      console.log('Transaction succeeded');
      console.log('From user balance: ', balance1);
      console.log('To user balance: ', balance2);
    }
  }

  redisCLI.disconnect();
}

/// Helper functions

function confirm(string, accept) {
  return prompt(string).toLowerCase() === accept.toLowerCase();
}

function keyExists(key) {
  return redisCLI.exists(key);
}

async function promptAndGetUserKey(string) {
  const result = prompt(string);
  const [firstName, lastName] = result.split(' ');
  return firstName + SEPARATOR + lastName;
}

function user_create(user) {
  return redisCLI.HSET(
    user_getKey(user),
    [
      'firstName',
      user.firstName,
      'lastName',
      user.lastName,
      'balance',
      user.balance,
    ],
    {
      NX: true,
    }
  );
}

function user_get(key) {
  return redisCLI.hGetAll(key);
}

function user_getKey(user) {
  const { firstName, lastName } = user;
  return firstName + SEPARATOR + lastName;
}

async function initRedis() {
  const redisCLI = createClient();
  redisCLI.on('error', (err) => console.log('Redis Client Error', err));
  await redisCLI.connect();
  return redisCLI;
}

function userPrompt() {
  const firstName = prompt('Enter first name: ');
  const lastName = prompt('Enter last name: ');
  const balance = prompt('Enter user balance: ');
  return {
    firstName,
    lastName,
    balance,
  };
}
