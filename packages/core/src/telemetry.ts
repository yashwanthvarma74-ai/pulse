import { metrics } from '@opentelemetry/api';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';

// Starts the OpenTelemetry meter provider and serves every instrument in metrics.ts to Prometheus at
// http://localhost:<port>/metrics. Grafana reads the numbers from Prometheus.
export function startMetrics(serviceName: string, port: number): () => Promise<void> {
  const exporter = new PrometheusExporter({ port });
  const provider = new MeterProvider({
    resource: resourceFromAttributes({ 'service.name': serviceName }),
    readers: [exporter],
  });
  metrics.setGlobalMeterProvider(provider);
  return () => provider.shutdown();
}
