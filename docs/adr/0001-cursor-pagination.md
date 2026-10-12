# 0001. Cursor pagination on (createdAt, \_id)

Status: accepted

## Context

Every list in Pulse is an infinite scroll over posts that keep arriving. A page boundary has to stay put while
new posts are published, and it has to stay cheap deep into the list.

## Decision

Each page ends with a cursor holding the `createdAt` and `_id` of its last post. The next page is "everything
strictly below that pair" in `(createdAt, _id)` order, sorted on both fields, newest first. Lists that read
oldest first (replies) use the same pair the other way round. The cursor is an opaque base64url string.

The shared `scanPage` helper builds a page from batches, so rows the viewer may not see never produce a short or
empty page (see [0005](0005-one-visibility-policy.md)).

Indexes put equality fields first and then the two sort fields in sort order, for example
`{ communityId, parentId, createdAt: -1, _id: -1 }`. `docs/explain/queries.md` holds the query plans.

## Why

- **Offsets shift.** With "skip 3, take 3", a post published after page 1 loads moves everything down by one and
  the first post of page 2 is a repeat. A cursor names a position in the data, so inserts above it change nothing.
- **Timestamps collide.** Two posts can share a millisecond. Comparing `_id` as well gives every post a unique place
  in the order, so none is skipped or served twice. About one seeded post in six shares a timestamp on purpose.
- **Cost stays flat.** A page 5,000 posts deep examines 42 index keys for 41 rows, the same as the first page.

## Evidence

- `packages/core/src/feed.test.ts` and `posts.test.ts` read whole lists with posts arriving between pages, and run
  randomized properties (fast-check) over timestamps, page sizes, hidden posts and inserts. Removing the `_id` half
  of the comparison makes them fail.
- `perf/paging.mjs`: 10,144 posts read in 203 pages while 660 more were published into the same community:
  0 duplicates, 0 missing.

## Consequences

- Clients cannot jump to "page 7". An infinite feed does not need to.
- A cursor only makes sense for the order it was made in. The ranked feed has its own cursor
  ([0006](0006-ranked-snapshot-and-latest-cursor.md)), and the two are told apart by a prefix.

## Alternatives

- **Offset and limit:** simple, and wrong while the data changes.
- **Cursor on `_id` alone:** works only while `_id` order equals time order.
