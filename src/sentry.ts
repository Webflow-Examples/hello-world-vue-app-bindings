import * as Sentry from '@sentry/vue';
import type { App } from 'vue';

/**
 * Browser-side Sentry initialization. Called from main.ts with the app
 * instance (so the Vue integration can hook the app's errorHandler) before
 * the app mounts. The DSN is inlined at build time from VITE_SENTRY_DSN —
 * set it in your Webflow Cloud environment variables.
 */
export function initSentry(app: App): void {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Demo settings: capture everything. Lower these in a real app.
    tracesSampleRate: 1.0,

    // Send Sentry structured logs (Sentry.logger.*) from the browser.
    enableLogs: true,
  });
}
