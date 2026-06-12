<script setup lang="ts">
import * as Sentry from '@sentry/vue';
import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Join the app's base mount path with an API path (same helper as
 * BindingsStatus). `import.meta.env.BASE_URL` is populated by Vite from
 * the `base` config (wired to COSMIC_MOUNT_PATH at build time).
 */
function buildAppUrl(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '').replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
}

const PING_INTERVAL_MS = 30_000;

const sentryConfigured = Boolean(import.meta.env.VITE_SENTRY_DSN);

const lastPing = ref('waiting…');
const pingCount = ref(0);

/**
 * Calls /api/sentry-ping on mount and every 30s. Each round trip produces:
 *  - a server-side Sentry log (emitted inside the worker route), and
 *  - a browser-side Sentry log (emitted here after the response).
 * The buttons trigger a client / server error to verify error capture.
 */
async function ping(): Promise<void> {
  const startedAt = Date.now();
  try {
    const res = await fetch(buildAppUrl('api/sentry-ping'));
    const body = (await res.json()) as { requestedAt?: string };

    Sentry.logger.info('client: sentry-ping completed', {
      status: res.status,
      durationMs: Date.now() - startedAt,
      serverTime: body.requestedAt ?? 'unknown',
    });

    pingCount.value += 1;
    lastPing.value = new Date().toLocaleTimeString();
  } catch (err) {
    Sentry.logger.error('client: sentry-ping failed', {
      durationMs: Date.now() - startedAt,
      message: err instanceof Error ? err.message : String(err),
    });
    lastPing.value = 'failed — see console / Sentry';
  }
}

let intervalId: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (!sentryConfigured) return;
  void ping();
  intervalId = setInterval(() => void ping(), PING_INTERVAL_MS);
});

onUnmounted(() => {
  if (intervalId !== undefined) clearInterval(intervalId);
});

function triggerClientError(): void {
  throw new Error('sentry-ping: intentional test error (browser)');
}

function triggerServerError(): void {
  void fetch(buildAppUrl('api/sentry-ping?error=1'));
}
</script>

<template>
  <section v-if="!sentryConfigured" class="wf-bindings" aria-label="Sentry status">
    <p class="wf-subtitle">
      Sentry is not configured — set <code>VITE_SENTRY_DSN</code> (browser) and
      <code>SENTRY_DSN</code> (worker) in your environment variables to enable it.
    </p>
  </section>

  <section v-else class="wf-bindings" aria-label="Sentry status">
    <p class="wf-subtitle">
      Sentry demo · pings <code>/api/sentry-ping</code> every {{ PING_INTERVAL_MS / 1000 }}s ·
      pings sent: {{ pingCount }} · last: {{ lastPing }}
    </p>
    <div class="wf-cta">
      <button class="wf-btn wf-btn-ghost" type="button" @click="triggerClientError">
        Trigger client error
      </button>
      <button class="wf-btn wf-btn-ghost" type="button" @click="triggerServerError">
        Trigger server error
      </button>
    </div>
  </section>
</template>
