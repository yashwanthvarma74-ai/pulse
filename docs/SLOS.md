# Service level objectives

What Pulse promises, how it is measured, and what alerts when it is missed. The alert rules live in
[`infra/prometheus/rules.yml`](../infra/prometheus/rules.yml) and every number comes from the OpenTelemetry
instruments in [`packages/core/src/metrics.ts`](../packages/core/src/metrics.ts), shown on the Grafana dashboard in
[`infra/grafana/dashboards/pulse.json`](../infra/grafana/dashboards/pulse.json).

| Objective                              | Target                    | Measured by                                                     | Alert (fires after)                        |
| -------------------------------------- | ------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| Feed page, p95                         | under 300 ms              | `pulse_feed_request_duration_ms`                                | `FeedLatencyHigh`, over 300 ms for 10 min  |
| Notification delivery, p95             | under 500 ms              | `pulse_notification_delivery_ms{stage="gateway"}` and `browser` | `NotificationDeliverySlow`, 10 min         |
| Fan-out of a pushed post, p95          | under 5 s                 | `pulse_fanout_lag_ms{mode="push"}`                              | `FanoutLagHigh`, 10 min (ticket, not page) |
| Server errors                          | under 1% of requests      | `pulse_http_request_duration_ms` by status                      | `ApiErrorRateHigh`, 5 min                  |
| Scroll smoothness reported by browsers | 55+ fps on 80% of scrolls | `pulse_scroll_fps`                                              | `ScrollSmoothnessLow`, 30 min (ticket)     |
| Unauthorized posts shown               | zero                      | the privacy property test and the browser tests, in CI          | any failing test blocks the merge          |

## What alerts mean

- **Page**: a reader is affected now. Look at Redis latency and queue depth first.
- **Ticket**: quality is slipping but nobody is blocked. For fan-out, lower `FANOUT_THRESHOLD` or add a worker.

## What is not measured yet

There is no uptime probe and no per-user error budget. Both would be the next additions to a deployed service.
