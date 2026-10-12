# 0009. A WebSocket gateway that forwards signals from Redis

Status: accepted

## Context

Notifications should appear without a refresh, and the feed should know that something new exists.

## Decision

`ws` runs on the API's HTTP server at `/ws`. A browser connects once, signed in with the same cookie; the
connection is refused for a missing or forged session, another origin, or more than five sessions per person. The
gateway holds one Redis pattern subscription and forwards what the workers publish on `notify:<userId>`.

Two messages exist: a **notification** (saved in MongoDB first, so a missed message is only a missed toast) and a
**new post** signal, which carries a post id and nothing else. The browser counts signals and shows a pill; it
never receives post content over the socket, so a signal cannot leak a post.

## Consequences

- The gateway has no state that matters, so several can run behind a load balancer.
- It lives in the API process today. It is a module (`apps/api/src/gateway.ts`) that can be its own service when
  socket count and request load need different scaling.
- Delivery time is measured in two places, at the gateway and in the browser, as `pulse_notification_delivery_ms`.
