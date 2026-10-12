# 0006. A ranked feed frozen in a snapshot, and a latest feed on a cursor

Status: accepted

## Context

A ranked feed is not ordered by time, so a `(createdAt, _id)` cursor cannot page it. And a ranked list that is
recomputed for every page reshuffles under the reader: repeats, gaps, a feed that jumps.

## Decision

Two feeds, told apart by a prefix on the cursor:

- **Latest** (`c.`) is newest first, paged by the time cursor of [0001](0001-cursor-pagination.md). It merges the
  pushed timeline, big accounts and communities. It is also the fallback when Redis is unreachable.
- **Ranked** (`s.`, the default "For you") takes the newest 300 candidates, scores each once, and stores the ordered
  list in Redis for 15 minutes as a snapshot bound to the viewer. Its pages are slices of that fixed list, so they
  cannot overlap or leave a gap however many posts arrive meanwhile. Posts are loaded and checked against the
  policy again for each slice, because a block or removal can happen after the snapshot.

New posts never go into a feed that is open. The browser shows a "New posts" pill, and pressing it asks for the
first page again, which takes a new snapshot and a new ranking.

The score is `0.5 * recency + 0.25 * affinity + 0.2 * engagement + 0.05 * media`, every feature between 0 and 1.
The top three contributors become the reasons stored in `feed_reasons`, so "Why am I seeing this?" shows the
calculation and not a story told afterwards.

## Consequences

- The ranked feed is 300 posts deep. After that, "You are all caught up" and the Latest tab.
- An expired snapshot answers 410, and the browser offers to refresh.
- Ranking inputs are cheap (counters on the post, one follows query). Anything heavier would be precomputed.
