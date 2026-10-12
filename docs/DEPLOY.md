# Deploying Pulse

> **Status: not deployed.** Everything below is the plan and the configuration, written from how the pieces
> behave locally. None of it has been run on a hosting provider, and `docker compose up` has not been run either
> (Docker is not installed on the machine this was built on). Treat it as a starting point, not a record.

## What has to run

| Part    | What                                                       | Needs                                                  |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| web     | Next.js (`npm run build -w @pulse/web`, then `next start`) | `API_URL`, and `NEXT_PUBLIC_WS_URL` at build time      |
| api     | `node apps/api/dist/server.js`                             | MongoDB, Redis, S3 or R2, `JWT_SECRET`, `SITE_ORIGIN`  |
| worker  | `node apps/worker/dist/server.js`                          | the same as the API                                    |
| MongoDB | Atlas free tier                                            | the indexes are created when the API starts            |
| Redis   | Upstash or Redis Cloud free tier                           | enough for queues, pub/sub and timelines in a demo     |
| Storage | Cloudflare R2                                              | S3 compatible, no egress fees; set `STORAGE_DRIVER=s3` |

The web app proxies `/api/*` to the API, so the browser sees one origin and the session cookie stays first-party.
The WebSocket cannot go through that proxy, so the browser connects to the API directly at `NEXT_PUBLIC_WS_URL`.
Put the web app and the API on the same registrable domain (for example `app.example.com` and `api.example.com`)
so the cookie is sent to both, and set `SITE_ORIGIN` to the web origin so the gateway accepts it.

Fly.io suits the API because of the long-lived sockets. Vercel suits the web app and gives a preview for every
pull request.

## Environment

See [`.env.example`](../.env.example). In production the API refuses to start with the development secret or with
`DEMO_LOGIN=true`. To let reviewers use the demo accounts on a public demo, run a separate non-production
environment with `DEMO_LOGIN=true` and seed it with `npm run seed`.

## Checklist before it goes public

- [ ] `JWT_SECRET` from `openssl rand -base64 48`, kept in the host's secret store
- [ ] `SITE_ORIGIN` and `NEXT_PUBLIC_WS_URL` match the real domains
- [ ] MongoDB user with access to one database only; Redis behind a password
- [ ] Storage bucket private, no public read
- [ ] Grafana Cloud (or the compose stack) scraping `/metrics` on ports 9464 and 9465, with the rules in `infra/prometheus/rules.yml`
- [ ] A one-click guest login, which exists (`Continue as guest`)
