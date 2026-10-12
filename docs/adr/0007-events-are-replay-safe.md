# 0007. Events carry deterministic ids, and the worker repairs what the queue lost

Status: accepted

## Context

Fan-out, notifications, image processing and moderation run after the API has answered, in BullMQ workers. A
queue delivers at least once, so every job can run twice, and a post can be saved while Redis is down.

## Decision

- Each event's id is built from what caused it (`post_created:<postId>`, `reaction:<postId>:<userId>`,
  `follow:<a>:<b>`), so sending it again produces the same id.
- A notification is unique on `(userId, eventId)`. The consumer inserts it and only publishes it to the user's
  sockets if the insert was new. Replaying the whole queue notifies no one twice.
- Fan-out writes the same sorted-set member every time, so it is safe to repeat.
- A post has `unprocessed: true` until the worker has finished it. A sweep every 30 seconds queues work again for
  any post still unprocessed after 30 seconds. A crash, or Redis being away when the post was written, leaves it
  unprocessed, and it is picked up later. Enqueueing has a 1.5 second timeout, because BullMQ otherwise waits for
  the connection for as long as the outage lasts.

## Evidence

`handlers.test.ts` replays events three times and counts notifications and published messages (one each), runs the
sweep, and `workers.test.ts` runs the real workers against real Redis and MongoDB. The Redis-down case is in
`feed.test.ts` and `auth.test.ts`.

## Consequences

- At-least-once with idempotent consumers, not exactly-once.
- Liking, unliking and liking again does not notify again, because the event id is the same.
