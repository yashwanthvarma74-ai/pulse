import { MongoClient, type Collection, type Db, type ObjectId } from 'mongodb';
import type { Visibility } from '@pulse/shared';

export interface UserDoc {
  _id: ObjectId;
  name: string;
  handle: string;
  guest: boolean;
  createdAt: Date;
}

export interface PostDoc {
  _id: ObjectId;
  authorId: ObjectId;
  visibility: Visibility;
  text: string;
  createdAt: Date;
}

export interface Database {
  client: MongoClient;
  db: Db;
  users: Collection<UserDoc>;
  posts: Collection<PostDoc>;
}

export async function connect(uri: string): Promise<Database> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  return {
    client,
    db,
    users: db.collection<UserDoc>('users'),
    posts: db.collection<PostDoc>('posts'),
  };
}

// Every field the API filters or sorts on is indexed. The feed index is the one that matters:
// equality on visibility, then the same two fields the cursor sorts by, in the same direction.
// See docs/explain/feed.md for the query plans.
export async function ensureIndexes({ users, posts }: Database): Promise<void> {
  await users.createIndex({ handle: 1 }, { unique: true });
  await posts.createIndex({ visibility: 1, createdAt: -1, _id: -1 }, { name: 'feed_cursor' });
}
