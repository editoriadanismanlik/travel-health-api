import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Sentry } from '@sentry/node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/metrics';

// Configure Winston logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL }
    })
  ]
});

// Configure Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};

// Configure Prometheus metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  startServer: true,
});

export const metrics = new MeterProvider({
  exporter: prometheusExporter,
  interval: 1000,
}).getMeter('travel-health-api');

// Create metrics
export const apiMetrics = {
  requestCounter: metrics.createCounter('api_requests_total', {
    description: 'Total number of API requests'
  }),
  responseTime: metrics.createHistogram('api_response_time_seconds', {
    description: 'API response time in seconds'
  }),
  activeConnections: metrics.createUpDownCounter('websocket_connections_active', {
    description: 'Number of active WebSocket connections'
  })
}; 