# 0001. Cursor pagination on (createdAt, \_id)

Status: accepted

## Context

The feed is an infinite scroll over posts that keep arriving. A page boundary has to stay put while new posts
are published, and it has to stay cheap deep into the feed.

## Decision

Each page ends with a cursor holding the `createdAt` and `_id` of its last post. The next page is "everything
strictly below that pair" in `(createdAt, _id)` order, sorted on both fields, newest first. The API asks for one
row more than the page size to know whether another page exists, and returns `nextCursor: null` on the last one.

The cursor is an opaque base64url string. Clients pass it back and never read it.

The index is `{ visibility: 1, createdAt: -1, _id: -1 }`: equality first, then the two sort fields in the sort
direction. `docs/explain/feed.md` holds the query plans.

## Why

- **Offsets shift.** With "skip 3, take 3", a post published after page 1 loads moves everything down by one and
  the first post of page 2 is a repeat. A cursor names a position in the data, so inserts above it change nothing.
- **Timestamps collide.** Two posts can share a millisecond. Sorting and comparing on `_id` as well gives every
  post a unique place in the order, so none is skipped or served twice.
- **Cost stays flat.** The query is an index range scan that starts at the cursor. A page in the middle of 10,000
  posts examines 23 index keys, the same as the first page. An offset has to walk past every skipped row.

## Evidence

- `apps/api/src/feed.test.ts` reads whole feeds with posts arriving between pages, including 25 posts in one
  millisecond, and a randomized test (fast-check) over timestamps, page sizes and inserts. Removing the `_id` half
  of the comparison makes two of these fail.
- Walking 10,000 seeded posts 50 at a time through the running app returned each post exactly once.

## Consequences

- Clients cannot jump to "page 7". An infinite feed does not need to.
- A cursor is only meaningful for the sort order it was made with. When ranking replaces recency (week 4), the
  cursor will carry the score as well, and old cursors will be rejected.

## Alternatives

- **Offset and limit:** simple, and wrong while the data changes, as above.
- **Cursor on `_id` alone:** works while `_id` order equals time order. Later posts can be backdated or imported,
  so the timestamp stays the source of truth.
