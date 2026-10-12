# Deploying Pulse

> **Status: not deployed.** Everything below is the plan and the configuration, written from how the pieces
> behave locally. None of it has been run on a hosting provider, and `docker compose up` has not been run either
> (Docker is not installed on the machine this was built on). Treat it as a starting point, not a record.

## Free and temporary: a public link from your own laptop

No account, no cost. The link works while your laptop is on and the script is running.

```bash
brew install cloudflared     # once
scripts/share.sh
```

It seeds a database, builds and starts the stack with the demo accounts, serves everything on one port
(`scripts/share.mjs`) and prints an `https://<random>.trycloudflare.com` address. Send that link; they can press
**Continue as guest** or use the demo accounts. Press Ctrl+C to take it down. Anyone with the link can sign in as a
demo account, so it is for showing people, not for leaving up.

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

## Exact steps (Fly.io for the API and worker, Vercel for the web app)

Replace `example.com` with your domain. The web app lives at `app.example.com` and the API at `api.example.com`.
All of this is untested on the real services.

1. **MongoDB Atlas.** Create a free cluster and a database user, allow access from anywhere (Fly addresses change),
   and copy the connection string.
2. **Upstash Redis** (or Redis Cloud). Copy the `rediss://` URL.
3. **Cloudflare R2.** Create the bucket `pulse-media` (private), an API token with object read and write, and note
   the S3 endpoint `https://<account>.r2.cloudflarestorage.com`.
4. **API on Fly**, from the repository root:

   ```bash
   fly apps create pulse-api
   fly secrets set -c fly.api.toml \
     MONGODB_URI='mongodb+srv://...' REDIS_URL='rediss://...' \
     JWT_SECRET="$(openssl rand -base64 48)" \
     SITE_ORIGIN=https://app.example.com COOKIE_DOMAIN=.example.com \
     S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com \
     S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=...
   fly deploy -c fly.api.toml
   fly certs add api.example.com -c fly.api.toml     # then add the DNS record Fly prints
   ```

5. **Worker on Fly**, with the same secrets (without `SITE_ORIGIN` and `COOKIE_DOMAIN`):

   ```bash
   fly apps create pulse-worker
   fly secrets set -c fly.worker.toml MONGODB_URI=... REDIS_URL=... S3_ENDPOINT=... S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... JWT_SECRET=...
   fly deploy -c fly.worker.toml
   ```

6. **Web on Vercel.** Import the repository, set **Root Directory** to `apps/web` and switch on "Include source files
   outside of the Root Directory". Add these environment variables (they are read at build time):

   | Variable             | Value                      |
   | -------------------- | -------------------------- |
   | `API_URL`            | `https://api.example.com`  |
   | `NEXT_PUBLIC_WS_URL` | `wss://api.example.com/ws` |

   Then add `app.example.com` as the project's domain.

7. **Check.** Open `https://api.example.com/health` (expect `{"ok":true,"mongo":true,"redis":true}`), then the app:
   press **Continue as guest**, post, and open a second window to see a notification arrive.

Why `COOKIE_DOMAIN` and `TRUST_PROXY_HOPS=2`: the session cookie has to reach `api.example.com` for the WebSocket,
and rate limits have to count the visitor and not Vercel's address (a request passes through Vercel and Fly).
