import "server-only";
import type { ReservationTransport } from "./creamery-reservations.ts";
import { ensure } from "../../purchases/reservation-v2.ts";

export type ProtectedTransport = {
  http(url: string, init: RequestInit): Promise<Response>;
  credentials(): Promise<{ bearer: string; gatewayHeaders: Readonly<Record<string, string>> }>;
};
/** No ambient fetch, credentials, origin or automatic retries. Gateway headers
 * are trusted provisioning inputs and never returned in diagnostics. */
export function createPurchaseTransport(origin: string, deps: ProtectedTransport): ReservationTransport {
  const base = new URL(origin);
  ensure(base.protocol === "https:" && base.origin === origin && !base.username && !base.password, "Invalid purchase origin");
  return async request => {
    ensure((request.method === "POST" && (request.path === "/v1/reservations" || request.path === "/v1/reservation-keys/close" ||
      /^\/v1\/reservations\/[a-f0-9-]{36}\/(?:commit|release)$/i.test(request.path))) ||
      (request.method === "GET" && (/^\/v1\/(?:reservations\/by-idempotency|reservation-keys)\/[^/?#]+$/.test(request.path) ||
        /^\/v1\/members\/resolve\?discordUserId=[1-9][0-9]{0,19}$/.test(request.path))), "Purchase route denied");
    const controller = new AbortController();
    let active = true, reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const url = new URL(request.path, base).href;
    const stop = () => { active = false; controller.abort(); try { void reader?.cancel().catch(() => {}); } catch {} };
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { stop(); reject(new Error("Protected purchase transport unavailable")); }, 5000);
    });
    const operation = async () => {
      const { bearer, gatewayHeaders } = await deps.credentials();
      ensure(active && /^[A-Za-z0-9\-._~+/]+=*$/.test(bearer), "Protected purchase transport unavailable");
      const headers = new Headers();
      for (const [key, value] of Object.entries(gatewayHeaders)) {
        ensure(["cf-access-client-id", "cf-access-client-secret"].includes(key.toLowerCase()), "Protected purchase transport unavailable");
        headers.set(key, value);
      }
      headers.set("Authorization", `Bearer ${bearer}`); headers.set("Accept", "application/json");
      if (request.body !== undefined) headers.set("Content-Type", "application/json");
      const init: RequestInit = { method: request.method, headers, redirect: "error", cache: "no-store",
        credentials: "omit", signal: controller.signal, ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }) };
      const check = await request.beforeSend?.();
      ensure(active, "Protected purchase transport unavailable"); check?.();
      // No asynchronous work between the last deadline check and native transport.
      const response = await deps.http(url, init);
      if (!active) { try { void response.body?.cancel().catch(() => {}); } catch {} throw new Error(); }
      ensure(!response.redirected && (!response.url || response.url === url), "Protected purchase transport unavailable");
      if (!/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?\s*$/i.test(response.headers.get("content-type") ?? "")) {
        try { void response.body?.cancel().catch(() => {}); } catch {}
        return { status: response.status, body: null };
      }
      reader = response.body?.getReader(); ensure(reader, "Protected purchase transport unavailable");
      const chunks: Uint8Array[] = []; let bytes = 0;
      while (true) { const part = await reader.read(); ensure(active); if (part.done) break;
        bytes += part.value.byteLength; if (bytes > 16384) return { status: response.status, body: null }; chunks.push(part.value); }
      const data = new Uint8Array(bytes); let offset = 0;
      for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
      let body: unknown = null;
      try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(data)); } catch { /* Successful malformed evidence reaches the adapter as invalid data. */ }
      return { status: response.status, body };
    };
    try { return await Promise.race([operation(), timeout]); }
    catch { throw new Error("Protected purchase transport unavailable"); }
    finally { stop(); clearTimeout(timer); }
  };
}
