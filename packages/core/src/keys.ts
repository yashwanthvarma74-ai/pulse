// Every Redis key in one place, so a prefix is all it takes to keep two environments apart.
export function redisKeys(prefix: string) {
  return {
    // sorted set: member postId, score createdAt
    timeline: (userId: string) => `${prefix}:timeline:${userId}`,
    // set while a timeline has been built from MongoDB, so an empty one is not rebuilt on every read
    timelineBuilt: (userId: string) => `${prefix}:timeline_built:${userId}`,
    // a ranked feed frozen for one reader, so its pages never shift
    snapshot: (id: string) => `${prefix}:feedsnap:${id}`,
    // pub/sub channel the gateway listens on for one user
    notify: (userId: string) => `${prefix}:notify:${userId}`,
    notifyPattern: () => `${prefix}:notify:*`,
  };
}
export type RedisKeys = ReturnType<typeof redisKeys>;
