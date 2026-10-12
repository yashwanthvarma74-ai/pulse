# 0003. Hybrid fan-out: push below a follower threshold, pull above it

Status: accepted

## Context

A new post has to reach every follower's feed. Pure push (copy the post into every follower's timeline) makes one
post from an account with millions of followers millions of writes. Pure pull (query everyone you follow when the
feed opens) makes every feed load slow.

## Decision

The fan-out worker pushes a post's id into each follower's Redis timeline, unless the author has more than
`FANOUT_THRESHOLD` followers (1,000 by default). Those accounts are not pushed. Their followers pull them at read
time from MongoDB through `{ authorId, parentId, createdAt, _id }`, and the feed service merges the pulled posts
with the pushed timeline by `(createdAt, _id)`.

Replies and members-only posts are never pushed: replies are not feed items, and community posts reach members
through the community pull.

## Why

Both costs stay bounded. Push cost is capped at the threshold per post. Pull cost is capped by how many big
accounts one person follows, which is small, and each is one indexed range scan.

## Evidence

- `feed.test.ts`: a small account's post lands in every follower timeline; a post from an account over the
  threshold is absent from them and still appears in the follower's feed at read time.
- The seeded popular account has 1,517 followers. Its posts are pulled, and the feed load test (`perf/k6`) includes
  readers who follow it: ranked first page p95 86 ms.

## Consequences

- The threshold is a tuning knob. Too low and many reads pay for a pull; too high and a post from a borderline
  account is a large write. `pulse_fanout_lag_ms` and `pulse_fanout_targets_total` show which way to move it.
- The "New posts" signal is only sent for pushed posts. Followers of a big account see its posts when they next
  refresh.
- An account that crosses the threshold leaves its older pushed posts in timelines. They are deduplicated by id at
  read time and age out of the 1,000 entry cap.
