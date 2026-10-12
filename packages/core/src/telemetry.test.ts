import { afterAll, describe, expect, it } from 'vitest';
import { instruments } from './metrics';
import { startMetrics } from './telemetry';

const PORT = 19464;
let stop: () => Promise<void>;
afterAll(() => stop?.());

describe('metrics', () => {
  it('serves every instrument to Prometheus once started', async () => {
    stop = startMetrics('pulse-test', PORT);
    instruments.feedLatency.record(42, { mode: 'ranked' });
    instruments.notificationsCreated.add(1, { type: 'mention' });
    instruments.scrollFps.record(58);

    await new Promise((resolve) => setTimeout(resolve, 200));
    const text = await (await fetch(`http://127.0.0.1:${PORT}/metrics`)).text();

    expect(text).toContain('pulse_feed_request_duration_ms_bucket');
    expect(text).toContain('mode="ranked"');
    expect(text).toContain('pulse_notifications_created_total');
    expect(text).toContain('pulse_scroll_fps_bucket');
    expect(text).toContain('service_name="pulse-test"');
  });
});
