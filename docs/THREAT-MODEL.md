# Threat model

Short on purpose. Pulse is a portfolio project that has run on one machine, so this lists what the code defends
against, how, and what it does not.

## What an attacker wants

1. **See a post they are not allowed to see** (followers-only, members-only, from someone who blocked them).
2. **Act as someone else** (post, react, report, moderate).
3. **Make the service expensive or unavailable** (spam, uploads, scraping).
4. **Run code in another person's browser** (stored cross-site scripting through posts, names or images).

## Defences

| Threat                                      | Defence                                                                                                                                                                  | Test                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Reading a hidden post through any route     | One policy function for every door, hidden and missing answer the same (404), see ADR 0005                                                                               | `privacy.property.test.ts`, `privacy.spec.ts` |
| Guessing an image URL                       | Every image request is checked against the post it belongs to, then redirected to a signed URL valid for 5 minutes                                                       | `media.test.ts` (API), `media.spec.ts`        |
| Using reactions, reports or search to probe | They all run the policy first, so a hidden post cannot be reacted to, reported or found                                                                                  | `privacy.property.test.ts`                    |
| Forged or stolen session                    | HS256 JWT in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production); the secret must be set in production; forged cookies are refused                             | `auth.test.ts`                                |
| Cross-site request forgery                  | `SameSite=Lax` cookie, JSON bodies only, and state changes are never GET                                                                                                 | by construction                               |
| Cross-site WebSocket hijacking              | The socket checks the `Origin` header against `SITE_ORIGIN` and the session cookie, and caps five sockets per person                                                     | `gateway.test.ts`                             |
| Cross-site scripting                        | Post text is rendered as React text, never HTML; mentions become links built from a parsed handle; images are re-encoded WebP, served with their own content type        | `PostText.test.tsx`, `PostCard.test.tsx`      |
| Malicious uploads                           | Decoded and re-encoded (`sharp`), 8 MB and 40 megapixel limits, only JPEG, PNG, WebP and GIF, metadata (including GPS) dropped                                           | `media.test.ts` (core)                        |
| Path traversal in storage                   | Keys are resolved inside the storage directory and rejected otherwise                                                                                                    | `media.test.ts` (core)                        |
| Abuse of expensive routes                   | Per-address rate limits on guest creation, writes, uploads, reports, search and community creation                                                                       | by construction                               |
| Injection through the query string or body  | Every input is parsed with a Zod schema at the boundary; MongoDB queries are built from parsed values, never from strings; search text is escaped before it is a pattern | API tests, `users.test.ts`                    |
| Leaking secrets                             | Secrets only in environment variables; `.env` is ignored by git; production refuses the development secret and the demo login                                            | `config.test.ts`                              |
| Vulnerable dependencies                     | Dependabot, and `npm audit` for high severity in CI                                                                                                                      | CI                                            |

## Known weaknesses

- **Guests are free and temporary.** Anyone can make one, so the per-address limit is the only brake. A real
  service would add a challenge and per-account limits.
- **The demo login lists seeded accounts.** It is off by default and refused in production, but when it is on, it is
  a login with no password. It exists to demonstrate privacy.
- **No account recovery or email.** A lost cookie is a lost guest.
- **Rate limits are in process memory.** Behind several API instances each would count separately; they would move
  into Redis.
- **Moderation is a phrase list and a human queue.** It is a first pass, not a defence against a determined spammer.
- **The signed image URL is a bearer token for 5 minutes.** Anyone holding the URL can load that image until it
  expires.
