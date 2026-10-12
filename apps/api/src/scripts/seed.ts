// Fills the database with a documented synthetic dataset for demos and measurements.
//
//   npm run seed -- --users 40 --posts 10000
//
// It replaces the users and posts collections. Roughly one post in six shares its timestamp with
// another, so the cursor's tie-break is exercised by real data and not only by the tests.
import { parseArgs } from 'node:util';
import { ObjectId } from 'mongodb';
import { loadConfig } from '../config';
import { connect, ensureIndexes, type PostDoc, type UserDoc } from '../db';

const NAMES = [
  'Maya Chen',
  'Daniel Okafor',
  'Priya Raman',
  'Lucas Ferreira',
  'Hannah Weiss',
  'Tomás Alvarez',
  'Aiko Tanaka',
  'Samuel Ortiz',
  'Nadia Haddad',
  'Oliver Grant',
  'Leila Rahimi',
  'Marcus Bell',
  'Sofia Rossi',
  'Ethan Park',
  'Amara Nwosu',
  'Jonas Lindqvist',
  'Ines Duarte',
  'Caleb Brooks',
  'Yara Hassan',
  'Felix Moreau',
  'Zoe Bennett',
  'Rohan Mehta',
  'Clara Novak',
  'Isaac Cohen',
  'Mei Lin',
  'Gabriel Santos',
  'Freya Olsen',
  'Dev Patel',
  'Alba Ruiz',
  'Theo Marshall',
];

const POSTS = [
  'Finally got the morning routine to stick. Twenty minutes of walking before opening the laptop changes the whole day.',
  'Hot take: a good README is worth more than a clever architecture.',
  'Shipped the first version tonight. It is rough, but it works, and that is enough for a first version.',
  'Reading about how large feeds handle accounts with millions of followers. Pushing every post to every follower stops being a good idea very quickly.',
  'The best code review comment I got this week: "what happens when this runs twice?"',
  'Coffee, a quiet office and a failing test that finally makes sense. Good Tuesday.',
  'Anyone else keep a list of bugs that only happen on the last day of the month?',
  'Started learning to bake sourdough. The starter smells like a pear that gave up. Apparently that is good.',
  'Trains were late again, so I read half a book on the platform. Silver lining.',
  'If your dashboard needs a legend to be understood, try a different chart.',
  'Ten thousand rows rendered at once is a bad idea. Ten thousand rows rendered ten at a time is just scrolling.',
  'Moved the whole team to a weekly written update instead of a meeting. Three weeks in, nobody misses the meeting.',
  'Sunday hike, 14 km, one wrong turn, zero regrets. The view from the ridge was worth the blisters.',
  'Pagination by offset looks fine until somebody posts while you are scrolling. Then everything shifts by one.',
  'Just learned that you can reuse the same index for a filter and a sort if you order the fields right. Embarrassing that it took me this long.',
  'New keyboard arrived. My typing speed dropped by half and my happiness doubled.',
  'The simplest way to understand a system you inherited: draw it on paper and see where your hand hesitates.',
  'Rain all day. Perfect excuse to finally sort the photo library from 2019.',
  'We measured it before and after. The change we were sure would help did nothing. The boring one cut load time by a third.',
  'Reminder that "it works on my machine" is a statement about your machine.',
  'Tried a new ramen place downtown. The broth had been going for two days and you could tell.',
  'Learning a new language at 35 is humbling. Today I ordered a coffee and got a sandwich.',
  'A quiet reminder to take your vacation days. Nobody in the history of work has regretted a week off.',
  'Our on-call week was uneventful, which means the runbook did its job.',
  'Why does every project have a folder called "misc" and why is it always the biggest one?',
  'The garden finally has tomatoes. Four of them. I have named them all.',
  'Wrote a small script to rename two hundred files and it took longer than renaming them by hand. Zero regrets, the script will live forever.',
  'Good design is mostly deciding what to leave out.',
  'First marathon done. 4:12. The last five kilometres were mostly spite.',
  'Did you know the first thing most people do after opening a new app is look for the back button?',
  'Pair programming for an afternoon fixed a bug that had survived three days of solo debugging.',
  'Board game night turned into a three hour negotiation about house rules. Best evening of the month.',
  'Writing tests first still feels slow on day one and fast on day thirty.',
  'Small win: the build is down from nine minutes to under three.',
  'Found my old sketchbook from university. Some of it is embarrassing. Some of it is better than what I draw now.',
  'Seven hours of sleep is not a luxury. It is the cheapest performance upgrade there is.',
  'The library near my flat has a reading room with no wifi. I have never been more productive.',
  'Learning to say "I do not know yet" has made my meetings shorter and my answers better.',
  'Switching from a to-do list to a short list of three things for the day. Sounds silly, works well.',
  'Made pasta from scratch. The kitchen looks like a flour factory exploded.',
  'Cold start, warm cache, p95. Always say which one you measured.',
  'My neighbour left a plant outside my door with a note that said "it needs more light than I have". I now have a plant.',
  'Spent the evening reading old commit messages. We were all so optimistic.',
  'Be kind to the person who wrote the code before you. It might have been you.',
  'Live music in the park on a weekday evening. This is what summer is for.',
  'We turned off a feature nobody used and the on-call pages dropped by half.',
  'Good documentation is a gift to the person starting on Monday.',
  'Cycled to work for the first time this year. Forgot how much I like it.',
  'Learned today that "eventually consistent" does not mean "consistent eventually if you are lucky".',
  'Quiet morning, fresh notebook, a clear plan. Let us see how long this lasts.',
  'If a queue can deliver a message twice, assume it will, and make the consumer fine with that.',
];

const { values } = parseArgs({
  options: { users: { type: 'string', default: '40' }, posts: { type: 'string', default: '2000' } },
});
const userCount = Number(values.users);
const postCount = Number(values.posts);
if (
  !Number.isInteger(userCount) ||
  userCount < 1 ||
  !Number.isInteger(postCount) ||
  postCount < 0
) {
  throw new Error('--users must be at least 1 and --posts must be 0 or more.');
}

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!;

const config = loadConfig();
const database = await connect(config.MONGODB_URI);

await database.users.deleteMany({});
await database.posts.deleteMany({});
await ensureIndexes(database);

const users: UserDoc[] = Array.from({ length: userCount }, (_, index) => {
  const name = NAMES[index % NAMES.length]!;
  const suffix = index >= NAMES.length ? String(Math.floor(index / NAMES.length) + 1) : '';
  return {
    _id: new ObjectId(),
    name,
    handle: `${name.toLowerCase().replace(/[^a-z]+/g, '')}${suffix}`,
    guest: false,
    createdAt: new Date(),
  };
});
await database.users.insertMany(users);

// Spread over the last 30 days, newest posts last in this array.
const now = Date.now();
const MONTH = 30 * 24 * 60 * 60 * 1000;
const times: number[] = [];
for (let i = 0; i < postCount; i++) {
  const repeat = times.length > 0 && Math.random() < 1 / 6;
  times.push(repeat ? pick(times) : now - Math.floor(Math.random() * MONTH));
}

const posts: PostDoc[] = times.map((time) => ({
  _id: new ObjectId(),
  authorId: pick(users)._id,
  visibility: 'public',
  text: pick(POSTS),
  createdAt: new Date(time),
}));
for (let i = 0; i < posts.length; i += 5000) {
  await database.posts.insertMany(posts.slice(i, i + 5000));
}

console.log(
  `Seeded ${users.length} users and ${posts.length} posts into ${database.db.databaseName}.`,
);
await database.client.close();
