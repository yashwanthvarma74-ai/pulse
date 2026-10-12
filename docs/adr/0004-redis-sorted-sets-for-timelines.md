# 0004. Redis sorted sets for timelines, rebuilt from MongoDB when lost

Status: accepted

## Context

Push fan-out needs a per-user list of post ids, written often and read newest first by range.

## Decision

One sorted set per user, `timeline:<userId>`, with the post id as member and `createdAt` in milliseconds as score,
trimmed to the newest `TIMELINE_MAX` (1,000) entries. A second key marks that the timeline has been built, so an
empty timeline is not rebuilt on every read.

The timeline is a cache. It is deleted when someone follows or unfollows, and rebuilt from MongoDB (one indexed
read of the posts of the accounts they follow, sorted by time) the next time it is read. If Redis is unreachable
the same rebuild query serves the feed directly.

## Why

Range reads by score are exactly what sorted sets are for. Because the source of truth stays in MongoDB, the
cache can be thrown away, repaired or wrong without losing anything.

## Details worth knowing

Redis orders members with equal scores by the member itself, which for hex ids is the same order as `_id`. To
page by `(createdAt, _id)`, the posts at the cursor's exact timestamp are read separately and compared by id, and
everything older comes from an exclusive score range.

## Consequences

- Depth is capped: the pushed part of "Latest" reaches back 1,000 posts. Pulled posts (big accounts, communities)
  have no such limit.
- A cold timeline costs one rebuild. For an account following 40 people that is one query of about 800 keys, 5 ms.
