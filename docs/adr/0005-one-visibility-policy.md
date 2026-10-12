# 0005. One visibility policy, used by every door

Status: accepted

## Context

A post can be public, followers-only or members-only; it can be removed; and either person can block the other.
Every part of the system that shows a post has to agree, or one of them leaks. The doors are: the feed, profiles,
community pages, search, notifications, replies, reactions, reports and image URLs.

## Decision

`canView(viewer, post)` in `packages/core/src/policy.ts` is the only place the rule is written. It is a pure
function of a small context (who the viewer follows, who is blocked in either direction, which communities they
belong to), loaded once per request. A reply is visible only when the reply and the post it answers both are.

Anything the viewer may not see answers exactly like something that does not exist (404, never 403), so ids cannot
be probed. Lists are built with `scanPage`, which keeps reading batches until it has a full page of visible rows.

Notifications are checked twice: when they are created (no notification for a post the recipient could not see, or
from someone they blocked) and when they are read (a post removed or blocked since drops out).

## Evidence

`privacy.property.test.ts` builds random social graphs (follows, blocks, communities, three kinds of visibility,
removed posts, replies) and compares what every person gets through every door with a second statement of the
rules written independently in the test. 25 random graphs per run, five people each, every door checked for every
person. Weakening the policy (ignoring blocks, or treating followers-only as public) makes it fail. The browser
tests repeat the idea with real accounts. Result: 0 unauthorized items.

## Consequences

- A change to the rules is a change to one function and one oracle.
- Moderators read reported posts from the queue directly. That is the one deliberate bypass, behind the moderator
  check, in `listOpenReports`.
- The viewer context is three small indexed reads per request. For someone following tens of thousands of accounts
  it would need caching.
