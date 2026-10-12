import { ObjectId } from 'mongodb';
import type { Database, UserDoc } from '../db';

const ADJECTIVES = ['Quiet', 'Bright', 'Swift', 'Calm', 'Bold', 'Curious', 'Gentle', 'Steady'];
const NOUNS = ['Heron', 'Maple', 'Comet', 'Otter', 'Harbor', 'Falcon', 'Willow', 'Meadow'];

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!;

// Guests are real accounts with generated names, so every post has an author like any other.
export async function createGuest(database: Database): Promise<UserDoc> {
  const name = `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
  const user: UserDoc = {
    _id: new ObjectId(),
    name,
    handle: `${name.toLowerCase().replace(' ', '')}${Math.floor(1000 + Math.random() * 9000)}`,
    guest: true,
    createdAt: new Date(),
  };

  try {
    await database.users.insertOne(user);
  } catch (error) {
    // Two guests can draw the same name and number. Trying again with a fresh draw is enough.
    if (isDuplicateKey(error)) return createGuest(database);
    throw error;
  }
  return user;
}

function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
