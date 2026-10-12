import {
  metrics,
  type Attributes,
  type Counter,
  type Histogram,
  type MetricOptions,
} from '@opentelemetry/api';

// OpenTelemetry instruments. They do nothing until an app starts a meter provider (the API and the
// worker do, and serve the numbers to Prometheus), so tests and scripts pay nothing for them.
//
// The metrics API, unlike the tracing one, does not hand out instruments that attach to a provider
// started later. An instrument made at import time would stay silent forever. So each one is made on
// first use against whichever provider is current, and made again if the provider changes.
function lazy<T>(make: (meter: ReturnType<typeof metrics.getMeter>) => T): () => T {
  let provider: unknown;
  let instrument: T | undefined;
  return () => {
    const current = metrics.getMeterProvider();
    if (instrument === undefined || provider !== current) {
      provider = current;
      instrument = make(metrics.getMeter('pulse'));
    }
    return instrument;
  };
}

const histogram = (name: string, options: MetricOptions) => {
  const get = lazy<Histogram>((meter) => meter.createHistogram(name, options));
  return { record: (value: number, attributes?: Attributes) => get().record(value, attributes) };
};

const counter = (name: string, options: MetricOptions) => {
  const get = lazy<Counter>((meter) => meter.createCounter(name, options));
  return { add: (value: number, attributes?: Attributes) => get().add(value, attributes) };
};

export const instruments = {
  httpDuration: histogram('pulse_http_request_duration_ms', {
    description: 'API request duration by route and status',
    unit: 'ms',
    advice: { explicitBucketBoundaries: [5, 10, 25, 50, 100, 250, 500, 1000, 2500] },
  }),
  feedLatency: histogram('pulse_feed_request_duration_ms', {
    description: 'Time to build one page of the feed',
    unit: 'ms',
    advice: { explicitBucketBoundaries: [5, 10, 25, 50, 100, 200, 300, 500, 1000, 2500] },
  }),
  fanoutLag: histogram('pulse_fanout_lag_ms', {
    description: 'Time from a post being saved to its fan-out finishing',
    unit: 'ms',
    advice: { explicitBucketBoundaries: [10, 50, 100, 250, 500, 1000, 5000, 30000] },
  }),
  fanoutTargets: counter('pulse_fanout_targets_total', {
    description: 'Timelines written by push fan-out',
  }),
  fanoutSkipped: counter('pulse_fanout_pulled_total', {
    description: 'Posts left to read-time pull because the author is over the follower threshold',
  }),
  notificationsCreated: counter('pulse_notifications_created_total', {
    description: 'Notifications saved',
  }),
  notificationsDeduped: counter('pulse_notifications_deduplicated_total', {
    description: 'Replayed events that did not notify again',
  }),
  notificationDelivery: histogram('pulse_notification_delivery_ms', {
    description: 'Time from an event being queued to the browser receiving the notification',
    unit: 'ms',
    advice: { explicitBucketBoundaries: [10, 25, 50, 100, 250, 500, 1000, 2500, 10000] },
  }),
  scrollFps: histogram('pulse_scroll_fps', {
    description: 'Frames per second while scrolling, reported by real browsers',
    unit: 'fps',
    advice: { explicitBucketBoundaries: [10, 20, 30, 40, 50, 55, 60] },
  }),
  mediaProcessed: counter('pulse_media_processed_total', {
    description: 'Images processed, by outcome',
  }),
  moderationFlags: counter('pulse_moderation_flags_total', {
    description: 'Posts the moderation worker flagged for review',
  }),
};
