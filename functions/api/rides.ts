// Cloudflare Pages Function backing the driving board.
//
// Storage: a single KV key (`rides:all`) holds the full JSON array of rides.
// This is fine for a wedding-scale board (~100 guests, low write concurrency).
//
// Required Cloudflare Pages bindings (set once in dashboard):
//   - KV namespace binding: variable name `RIDES_KV`
//   - Environment variable (encrypted): `ADMIN_TOKEN` — the secret you use in
//     the `?admin=<token>` activation URL on the client.

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

interface Env {
  RIDES_KV: KVNamespace;
  ADMIN_TOKEN?: string;
}

type Ride = {
  id: string;
  name: string;
  seats: number;
  area: string;
  time: string;
  timestamp: string;
};

type Context = {
  request: Request;
  env: Env;
};

const KEY = "rides:all";

async function getRides(env: Env): Promise<Ride[]> {
  const raw = await env.RIDES_KV.get(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setRides(env: Env, rides: Ride[]): Promise<void> {
  await env.RIDES_KV.put(KEY, JSON.stringify(rides));
}

function verifyAdmin(env: Env, token: string | undefined): boolean {
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function readBody(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    const parsed = await request.json().catch(() => ({}));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function envOk(env: Env): Response | null {
  if (!env.RIDES_KV) {
    return json(
      { error: "KV binding RIDES_KV not configured on this deployment" },
      500,
    );
  }
  return null;
}

export async function onRequestGet({ env }: Context): Promise<Response> {
  const guard = envOk(env);
  if (guard) return guard;
  const rides = await getRides(env);
  return json({ rides });
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const guard = envOk(env);
  if (guard) return guard;
  const params = await readBody(request);
  const action = (params.action || "add").toLowerCase();
  const rides = await getRides(env);

  if (action === "add") {
    const name = (params.name || "").trim();
    const seats = Number(params.seats) || 0;
    if (!name || seats <= 0) {
      return json({ error: "name and seats required" }, 400);
    }
    const id = params.id || crypto.randomUUID();
    const ride: Ride = {
      id,
      name,
      seats,
      area: (params.area || "").trim(),
      time: (params.time || "").trim(),
      timestamp: new Date().toISOString(),
    };
    const filtered = rides.filter((r) => r.id !== id);
    await setRides(env, [ride, ...filtered]);
    return json({ ok: true, ride });
  }

  if (action === "delete") {
    if (!verifyAdmin(env, params.adminToken)) return json({ error: "forbidden" }, 403);
    const id = params.id;
    if (!id) return json({ error: "missing id" }, 400);
    await setRides(env, rides.filter((r) => r.id !== id));
    return json({ ok: true });
  }

  if (action === "update") {
    if (!verifyAdmin(env, params.adminToken)) return json({ error: "forbidden" }, 403);
    const id = params.id;
    if (!id) return json({ error: "missing id" }, 400);
    const updated = rides.map((r) =>
      r.id === id
        ? {
            ...r,
            name: params.name !== undefined ? params.name : r.name,
            seats: params.seats !== undefined ? Number(params.seats) || 0 : r.seats,
            area: params.area !== undefined ? params.area : r.area,
            time: params.time !== undefined ? params.time : r.time,
          }
        : r,
    );
    await setRides(env, updated);
    return json({ ok: true });
  }

  return json({ error: "unknown action" }, 400);
}
