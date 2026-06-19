/// <reference types="@cloudflare/workers-types" />

import { handleBindingStatus } from "./routes/binding-status";
import { handleEnvDebug } from "./routes/env-debug";

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  FLAGS: KVNamespace;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // Webflow Cloud mounts the app at a path prefix (e.g. /my-app),
    // so match from /api/ onward so routing works regardless of mount.
    const apiIndex = url.pathname.indexOf("/api/");
    const path = apiIndex !== -1 ? url.pathname.slice(apiIndex) : url.pathname;

    if (path === "/api/env-debug") {
      return handleEnvDebug(request, env);
    }

    if (path === "/api/binding-status") {
      return handleBindingStatus(request, env);
    }

    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
