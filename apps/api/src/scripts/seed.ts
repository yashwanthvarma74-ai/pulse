// Fills the database with a documented synthetic dataset for demos and measurements.
//
//   npm run seed -- --posts 3000 --general-posts 10000
//
// It REPLACES the whole database and clears Pulse's Redis keys. What it makes:
//   - 6 demo accounts (see DEMO_ACCOUNTS) that the demo login lists, with a few relationships set up
//     so a reviewer can see who sees what
//   - 36 more named people, and 1,500 "fan" accounts that follow one popular account, so that account
//     is over the fan-out threshold and is pulled at read time instead of pushed
//   - 5 communities. "General" is joined by everyone and gets --general-posts posts, which is what the
//     10,000 item scroll tests use
//   - posts spread over the last 30 days; about one in six shares a timestamp with another, so the
//     cursor tie-break is exercised by real data. About one in ten is followers-only.
//   - reactions and replies that match the counters on each post
//   - a few photos, a few open reports for the moderator queue
import { parseArgs } from 'node:util';
import { ObjectId } from 'mongodb';
import sharp from 'sharp';
import {
  createCore,
  ensureIndexes,
  loadConfig,
  newUserDoc,
  processImage,
  uploadImage,
  type CommunityDoc,
  type FollowDoc,
  type MembershipDoc,
  type PostDoc,
  type ReactionDoc,
  type UserDoc,
} from '@pulse/core';

const NAMES = [
  'Maya Chen',
  'Daniel Okafor',
  'Hannah Weiss',
  'Lucas Ferreira',
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
  'Nora Kim',
  'Mateo Silva',
  'Ivy Carter',
  'Omar Farouk',
  'Lena Fischer',
  'Kai Nakamura',
  'Ruth Adeyemi',
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
  'Pair programming for an afternoon fixed a bug that had survived three days of solo debugging.',
  'Board game night turned into a three hour negotiation about house rules. Best evening of the month.',
  'Writing tests first still feels slow on day one and fast on day thirty.',
  'Small win: the build is down from nine minutes to under three.',
  'Found my old sketchbook from university. Some of it is embarrassing. Some of it is better than what I draw now.',
  'Seven hours of sleep is not a luxury. It is the cheapest performance upgrade there is.',
  'The library near my flat has a reading room with no wifi. I have never been more productive.',
  'Learning to say "I do not know yet" has made my meetings shorter and my answers better.',
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
  'If a queue can deliver a message twice, assume it will, and make the consumer fine with that.',
];

const REPLIES = [
  'Same here, it took me a while to get it right.',
  'Great point. I had never thought about it that way.',
  'This made my day.',
  'Agreed, and the boring option is usually the right one.',
  'Thanks for sharing, saving this for later.',
  'Ha, this is so true.',
  'Could you say more about how you did that?',
];

const COMMUNITIES = [
  {
    slug: 'general',
    name: 'General',
    description: 'Everything and anything. Everyone starts here.',
    featured: true,
  },
  {
    slug: 'photography',
    name: 'Photography',
    description: 'Share what you saw today.',
    featured: true,
  },
  {
    slug: 'open-source',
    name: 'Open Source',
    description: 'Maintainers, contributors and curious people.',
    featured: true,
  },
  {
    slug: 'running',
    name: 'Running',
    description: 'Miles, shoes and the occasional marathon.',
    featured: false,
  },
  {
    slug: 'home-cooking',
    name: 'Home Cooking',
    description: 'Recipes that worked and ones that did not.',
    featured: false,
  },
];

const DEMO_ACCOUNTS = [
  {
    handle: 'alice',
    name: 'Alice Nguyen',
    role: 'Follows Bob and the celebrity, member of Photography',
    extra: {},
  },
  { handle: 'bob', name: 'Bob Carter', role: 'Follows Alice, member of Photography', extra: {} },
  {
    handle: 'carol',
    name: 'Carol Mendes',
    role: 'New here: follows nobody, in no communities',
    extra: {},
  },
  {
    handle: 'dan',
    name: 'Dan Whitfield',
    role: "Blocked by Alice, so Alice's posts are invisible to him",
    extra: {},
  },
  {
    handle: 'celebrity',
    name: 'Priya Raman',
    role: 'Popular account: over the fan-out threshold, read by pull',
    extra: { featured: true },
  },
  {
    handle: 'moderator',
    name: 'Morgan Ellis',
    role: 'Moderator: works the report queue',
    extra: { moderator: true },
  },
];

const { values } = parseArgs({
  options: {
    posts: { type: 'string', default: '3000' },
    'general-posts': { type: 'string', default: '10000' },
    fans: { type: 'string', default: '1500' },
  },
});
const postCount = Number(values.posts);
const generalCount = Number(values['general-posts']);
const fanCount = Number(values.fans);
for (const n of [postCount, generalCount, fanCount]) {
  if (!Number.isInteger(n) || n < 0)
    throw new Error('--posts, --general-posts and --fans must be 0 or more.');
}

const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!;
const chance = (p: number) => Math.random() < p;
const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );

const config = loadConfig();
const core = await createCore(config, { indexes: false });
const { database } = core;

await database.db.dropDatabase();
await ensureIndexes(database);
// the BullMQ keys stay: a running worker is using them
const keys = (await core.redis.keys(`${config.REDIS_PREFIX}:*`)).filter(
  (key) => !key.includes(':bull:'),
);
if (keys.length > 0) await core.redis.del(...keys);

// ---- people ----
const demo = DEMO_ACCOUNTS.map((account) =>
  newUserDoc({
    name: account.name,
    handle: account.handle,
    demoRole: account.role,
    ...account.extra,
  }),
);
const byHandle = (handle: string) => demo.find((user) => user.handle === handle)!;
const people: UserDoc[] = NAMES.map((name) =>
  newUserDoc({
    name,
    handle: name.toLowerCase().replace(/[^a-z]+/g, ''),
    featured: ['Maya Chen', 'Daniel Okafor', 'Hannah Weiss', 'Aiko Tanaka'].includes(name),
  }),
);
const fans: UserDoc[] = Array.from({ length: fanCount }, (_, i) =>
  newUserDoc({ name: `Fan ${i + 1}`, handle: `fan${String(i + 1).padStart(4, '0')}` }),
);
const everyone = [...demo, ...people];
await database.users.insertMany([...everyone, ...fans]);

// ---- communities ----
const communities: CommunityDoc[] = COMMUNITIES.map((community) => ({
  _id: new ObjectId(),
  ...community,
  ownerId: byHandle('moderator')._id,
  memberCount: 0,
  createdAt: new Date(),
}));
const community = (slug: string) => communities.find((c) => c.slug === slug)!;
const memberships: MembershipDoc[] = [];
const join = (user: UserDoc, c: CommunityDoc) =>
  memberships.push({
    _id: new ObjectId(),
    communityId: c._id,
    userId: user._id,
    createdAt: new Date(),
  });
for (const user of everyone) {
  join(user, community('general'));
  for (const c of communities.slice(1)) {
    if (user.handle === 'carol') continue;
    const always = c.slug === 'photography' && ['alice', 'bob'].includes(user.handle);
    if (always || chance(0.3)) join(user, c);
  }
}
for (const c of communities)
  c.memberCount = memberships.filter((m) => m.communityId.equals(c._id)).length;
await database.communities.insertMany(communities);
await database.memberships.insertMany(memberships);

// ---- follows and blocks ----
const follows: FollowDoc[] = [];
const followKey = new Set<string>();
const follow = (a: UserDoc, b: UserDoc) => {
  const key = `${a._id}:${b._id}`;
  if (a._id.equals(b._id) || followKey.has(key)) return;
  followKey.add(key);
  follows.push({
    _id: new ObjectId(),
    followerId: a._id,
    followeeId: b._id,
    createdAt: new Date(),
  });
};
const celebrity = byHandle('celebrity');
for (const person of people) {
  for (let i = 0; i < 8; i++) follow(person, pick(people));
  if (chance(0.5)) follow(person, celebrity);
}
follow(byHandle('alice'), byHandle('bob'));
follow(byHandle('alice'), celebrity);
follow(byHandle('bob'), byHandle('alice'));
follow(byHandle('dan'), byHandle('alice'));
for (const fan of fans) follow(fan, celebrity);

await database.blocks.insertOne({
  _id: new ObjectId(),
  blockerId: byHandle('alice')._id,
  blockedId: byHandle('dan')._id,
  createdAt: new Date(),
});
// Alice blocked Dan, so that follow no longer exists
const aliceBlocksDan = `${byHandle('dan')._id}:${byHandle('alice')._id}`;
const keptFollows = follows.filter((f) => `${f.followerId}:${f.followeeId}` !== aliceBlocksDan);

const followers = new Map<string, number>();
const following = new Map<string, number>();
for (const f of keptFollows) {
  followers.set(f.followeeId.toHexString(), (followers.get(f.followeeId.toHexString()) ?? 0) + 1);
  following.set(f.followerId.toHexString(), (following.get(f.followerId.toHexString()) ?? 0) + 1);
}
for (const batch of chunk(keptFollows, 5000)) await database.follows.insertMany(batch);
await database.users.bulkWrite(
  [...everyone, ...fans].map((user) => ({
    updateOne: {
      filter: { _id: user._id },
      update: {
        $set: {
          followerCount: followers.get(user._id.toHexString()) ?? 0,
          followingCount: following.get(user._id.toHexString()) ?? 0,
        },
      },
    },
  })),
);

// ---- photos ----
const gradient = (a: string, b: string, i: number) =>
  sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#g)"/><circle cx="${300 + i * 90}" cy="${250 + (i % 3) * 140}" r="${120 + (i % 4) * 30}" fill="#ffffff" fill-opacity="0.18"/><rect x="${700 - i * 20}" y="560" width="760" height="220" rx="24" fill="#000000" fill-opacity="0.14"/></svg>`,
    ),
  )
    .jpeg({ quality: 88 })
    .toBuffer();
const PALETTE: [string, string][] = [
  ['#4f46e5', '#22ccee'],
  ['#d92d20', '#fdb022'],
  ['#067647', '#6ce9a6'],
  ['#101828', '#667085'],
  ['#b54708', '#fde272'],
  ['#3730a3', '#f97066'],
];
const photoOwner = byHandle('alice');
const photoIds: ObjectId[] = [];
for (let i = 0; i < 12; i++) {
  const [a, b] = PALETTE[i % PALETTE.length]!;
  const media = await uploadImage(core, photoOwner._id, await gradient(a, b, i));
  await processImage(core, new ObjectId(media.id));
  photoIds.push(new ObjectId(media.id));
}

// ---- posts, replies, reactions ----
const MONTH = 30 * 24 * 60 * 60 * 1000;
const now = Date.now();
const times: number[] = [];
const nextTime = () => {
  const repeat = times.length > 0 && chance(1 / 6);
  const time = repeat ? pick(times) : now - Math.floor(Math.random() * MONTH);
  times.push(time);
  return time;
};

const posts: PostDoc[] = [];
const newPost = (author: UserDoc, fields: Partial<PostDoc> = {}): PostDoc => {
  const post: PostDoc = {
    _id: new ObjectId(),
    authorId: author._id,
    visibility: 'public',
    text: pick(POSTS),
    createdAt: new Date(nextTime()),
    communityId: null,
    parentId: null,
    mediaIds: [],
    mentions: [],
    status: 'visible',
    reactionCount: 0,
    replyCount: 0,
    unprocessed: false,
    ...fields,
  };
  posts.push(post);
  return post;
};

const photography = community('photography');
const photographyMembers = new Set(
  memberships
    .filter((m) => m.communityId.equals(photography._id))
    .map((m) => m.userId.toHexString()),
);
let photoIndex = 0;

for (let i = 0; i < postCount; i++) {
  const author = chance(0.04) ? celebrity : pick(people);
  const inCommunity = chance(0.35);
  const target = inCommunity ? pick(communities.slice(1)) : null;
  const members = target ? memberships.filter((m) => m.communityId.equals(target._id)) : [];
  const poster =
    target && members.length
      ? (everyone.find((u) => u._id.equals(pick(members).userId)) ?? author)
      : author;
  const post = newPost(poster, {
    communityId: target?._id ?? null,
    visibility: target
      ? chance(0.2)
        ? 'community'
        : 'public'
      : chance(0.1)
        ? 'followers'
        : 'public',
  });
  if (
    target?.slug === 'photography' &&
    photographyMembers.has(poster._id.toHexString()) &&
    photoIndex < photoIds.length &&
    chance(0.35)
  ) {
    post.mediaIds = [photoIds[photoIndex++]!];
    await database.media.updateOne(
      { _id: post.mediaIds[0]! },
      { $set: { postId: post._id, ownerId: poster._id } },
    );
  }
}
// make sure every photo is used by a post in Photography, which is where Alice and Bob look
while (photoIndex < photoIds.length) {
  const post = newPost(
    photographyMembers.has(photoOwner._id.toHexString()) ? photoOwner : people[0]!,
    {
      communityId: photography._id,
      mediaIds: [photoIds[photoIndex]!],
      text: 'Out with the camera today.',
    },
  );
  await database.media.updateOne(
    { _id: photoIds[photoIndex]! },
    { $set: { postId: post._id, ownerId: post.authorId } },
  );
  photoIndex++;
}

// the big community: everyone is a member, so every post in it is readable by every demo account
const general = community('general');
for (let i = 0; i < generalCount; i++) newPost(pick(everyone), { communityId: general._id });

// A few posts from the demo accounts, so the demo has something to show on first load.
const demoPosts: [string, string, Partial<PostDoc>][] = [
  ['alice', 'Anyone have a good way to keep photo folders tidy? Mine is a disaster.', {}],
  [
    'alice',
    'Followers-only: the surprise party is on Saturday. Keep it quiet!',
    { visibility: 'followers' },
  ],
  ['bob', 'Hello from Bob. I follow Alice, so I can see her followers-only posts.', {}],
  ['dan', 'Dan here. Alice blocked me, so she and her posts do not exist for me.', {}],
  ['celebrity', 'Thank you all for the kind words this week. Back to work!', {}],
  ['carol', 'Brand new here. Looking for people to follow.', {}],
];
for (const [handle, text, fields] of demoPosts)
  newPost(byHandle(handle), {
    text,
    createdAt: new Date(now - Math.floor(Math.random() * 3_600_000)),
    ...fields,
  });

// An obvious spam post, for the moderator queue to find.
const spammer = pick(people);
const spam = newPost(spammer, {
  text: 'Get FREE CRYPTO now, just click the link in my bio!',
  createdAt: new Date(now - 600_000),
});

// replies and reactions, kept in step with the counters
const replies: PostDoc[] = [];
const reactions: ReactionDoc[] = [];
const sample = posts.filter((p) => !p.parentId && p.visibility !== 'community');
for (const post of sample) {
  if (!chance(0.45)) continue;
  const reactors = new Set<string>();
  const count = chance(0.1) ? 10 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) reactors.add(pick(everyone)._id.toHexString());
  for (const id of reactors)
    reactions.push({
      _id: new ObjectId(),
      postId: post._id,
      userId: new ObjectId(id),
      createdAt: new Date(),
    });
  post.reactionCount = reactors.size;

  if (post.visibility !== 'public' || !chance(0.25)) continue;
  const replyCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < replyCount; i++) {
    replies.push({
      ...post,
      _id: new ObjectId(),
      authorId: pick(everyone)._id,
      text: pick(REPLIES),
      parentId: post._id,
      mediaIds: [],
      mentions: [],
      createdAt: new Date(post.createdAt.getTime() + (i + 1) * 60_000),
      reactionCount: 0,
      replyCount: 0,
    });
  }
  post.replyCount = replyCount;
}
for (const batch of chunk([...posts, ...replies], 5000)) await database.posts.insertMany(batch);
for (const batch of chunk(reactions, 5000)) await database.reactions.insertMany(batch);

// ---- reports ----
await database.reports.insertMany([
  {
    _id: new ObjectId(),
    reporterId: null,
    postId: spam._id,
    reason: 'spam',
    details: 'Matched "free crypto"',
    status: 'open',
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    reporterId: byHandle('bob')._id,
    postId: pick(sample)._id,
    reason: 'other',
    details: 'Not sure this is appropriate',
    status: 'open',
    createdAt: new Date(),
  },
]);

console.log(
  `Seeded ${everyone.length + fans.length} users (${fans.length} fans), ${communities.length} communities, ` +
    `${posts.length} posts (${generalCount} in General), ${replies.length} replies and ${reactions.length} reactions ` +
    `into ${database.db.databaseName}.`,
);
console.log('Demo accounts:', DEMO_ACCOUNTS.map((a) => a.handle).join(', '));
await core.close();
