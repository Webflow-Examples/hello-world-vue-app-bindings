<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

type Status = 'ok' | 'error' | 'loading';

interface ServiceStatus {
  status: 'ok' | 'error';
  latency: number;
  error?: string;
}

interface HealthcheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    d1: ServiceStatus;
    kv_sessions: ServiceStatus;
    kv_flags: ServiceStatus;
    r2: ServiceStatus;
  };
}

const BINDINGS = [
  {
    key: 'd1',
    name: 'D1',
    title: 'SQL database',
    description: 'Serverless SQLite at the edge. Great for user data, CMS content, app state.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/sqlite',
  },
  {
    key: 'r2',
    name: 'R2',
    title: 'Object storage',
    description: 'S3-compatible object storage with zero egress fees. Ideal for uploads and assets.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/object-storage',
  },
  {
    key: 'kv_sessions',
    name: 'KV · Sessions',
    title: 'Session store',
    description: 'Low-latency key-value store. Perfect for sessions, caches, and tokens.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/key-value-store',
  },
  {
    key: 'kv_flags',
    name: 'KV · Flags',
    title: 'Feature flags',
    description: 'KV namespace dedicated to feature flags with instant global propagation.',
    docs: 'https://developers.webflow.com/webflow-cloud/storing-data/key-value-store',
  },
] as const;

const data = ref<HealthcheckResponse | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('api/binding-status', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data.value = (await res.json()) as HealthcheckResponse;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error';
  }
});

const subtitle = computed(() => {
  if (error.value) return `Unreachable · ${error.value}`;
  if (data.value) return `Last checked ${new Date(data.value.timestamp).toLocaleTimeString()}`;
  return 'Checking…';
});

function svcFor(key: (typeof BINDINGS)[number]['key']): ServiceStatus | undefined {
  return data.value?.services[key];
}

function statusFor(key: (typeof BINDINGS)[number]['key']): Status {
  if (error.value) return 'error';
  const svc = svcFor(key);
  if (!svc) return 'loading';
  return svc.status;
}
</script>

<template>
  <div class="wf-section-title">
    <h2>Cloudflare bindings</h2>
    <p>{{ subtitle }}</p>
  </div>

  <div class="wf-bindings">
    <div v-for="b in BINDINGS" :key="b.key" class="wf-binding" :data-status="statusFor(b.key)">
      <div class="wf-binding-head">
        <span class="wf-binding-name">{{ b.name }}</span>
        <span
          class="wf-dot"
          :data-status="statusFor(b.key) === 'loading' ? undefined : statusFor(b.key)"
          :title="svcFor(b.key)?.error ?? statusFor(b.key)"
        />
      </div>
      <h3 class="wf-binding-title">{{ b.title }}</h3>
      <p class="wf-binding-desc">{{ b.description }}</p>
      <div class="wf-binding-meta">
        <span>
          {{ svcFor(b.key) ? `${svcFor(b.key)!.latency}ms` : statusFor(b.key) === 'loading' ? '…' : '—' }}
        </span>
        <a :href="b.docs" target="_blank" rel="noreferrer">Docs ↗</a>
      </div>
    </div>
  </div>
</template>
