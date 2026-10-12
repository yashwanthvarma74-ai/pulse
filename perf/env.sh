# Settings for a production-like local stack used by every script in this folder.
# It has its own database, Redis prefix and ports, so it never touches a development environment.
#
#   source perf/env.sh
#   npm run seed -w @pulse/api               # 13,000 posts, 1,500 fans (the dataset the numbers come from)
#   npm run build
#   node apps/api/dist/server.js &            # API, built
#   node apps/worker/dist/server.js &         # worker, built
#   npm run start -w @pulse/web -- --port 3200 &
export NODE_ENV_FOR_WEB=production
export MONGODB_URI=mongodb://127.0.0.1:27017/pulse_perf
export REDIS_URL=redis://127.0.0.1:6379
export REDIS_PREFIX=pulse_perf
export API_PORT=4201
export API_URL=http://127.0.0.1:4201
export API_METRICS_PORT=9664
export WORKER_METRICS_PORT=9665
export SITE_ORIGIN=http://localhost:3200
export NEXT_PUBLIC_WS_URL=ws://localhost:4201/ws
export NEXT_DIST_DIR=.next-perf
# the demo login is how the scripts sign in; it is refused in NODE_ENV=production
export DEMO_LOGIN=true
export LOG_LEVEL=warn
export MEDIA_DIR=/tmp/pulse-perf-media
export FANOUT_THRESHOLD=1000
export JWT_SECRET=perf-secret-that-is-long-enough-for-hs256
# the load scripts write from one address; the production default is 30 posts a minute
export WRITE_RATE_LIMIT=100000
