# 0010. The server validates; the browser trusts the types

Status: accepted

## Context

The first version of the web client parsed every response with the shared Zod schemas. Zod is about 45 kB
gzipped, and the browser needed it only to check data that the same schemas had just produced on the server.

## Decision

Schemas in `@pulse/shared` are used at every boundary of the API: request bodies, queries, environment variables.
The browser imports their _types_ and nothing else, and `@pulse/shared` is marked `sideEffects: false` so the
schemas are not bundled. Response bodies are trusted, as they are with any typed API client.

## Consequences

- A server and client that drift apart are caught by TypeScript at build time and by the browser tests, not by a
  runtime check on every response.
- Anything that comes from outside the system (user input) is still validated, on the server.
