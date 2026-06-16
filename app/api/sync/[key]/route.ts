import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

type TripPayload = {
  items: unknown;
};

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
const globalForPg = globalThis as typeof globalThis & { tripPlannerPool?: Pool };
const pool =
  connectionString &&
  (globalForPg.tripPlannerPool ??
    new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    }));

if (pool && !globalForPg.tripPlannerPool) {
  globalForPg.tripPlannerPool = pool;
}

function normalizeKey(key: string) {
  const decoded = decodeURIComponent(key).trim();

  if (decoded.length < 6 || decoded.length > 120) {
    return null;
  }

  return createHash("sha256").update(decoded).digest("hex");
}

async function ensureTable() {
  if (!pool) {
    return;
  }

  await pool.query(`
    create table if not exists trip_configs (
      sync_key text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
}

function unavailable() {
  return NextResponse.json(
    {
      error: "Cloud sync is not configured. Add POSTGRES_URL or DATABASE_URL on Vercel.",
    },
    { status: 503 },
  );
}

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string }> }) {
  if (!pool) {
    return unavailable();
  }

  const { key } = await context.params;
  const syncKey = normalizeKey(key);

  if (!syncKey) {
    return NextResponse.json({ error: "Invalid sync key." }, { status: 400 });
  }

  await ensureTable();

  const result = await pool.query("select data, updated_at from trip_configs where sync_key = $1", [syncKey]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "No cloud itinerary for this key." }, { status: 404 });
  }

  return NextResponse.json({
    items: result.rows[0].data,
    updatedAt: result.rows[0].updated_at,
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  if (!pool) {
    return unavailable();
  }

  const { key } = await context.params;
  const syncKey = normalizeKey(key);

  if (!syncKey) {
    return NextResponse.json({ error: "Invalid sync key." }, { status: 400 });
  }

  const payload = (await request.json()) as TripPayload;

  if (!Array.isArray(payload.items)) {
    return NextResponse.json({ error: "Invalid itinerary payload." }, { status: 400 });
  }

  await ensureTable();

  const result = await pool.query(
    `
      insert into trip_configs (sync_key, data, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (sync_key)
      do update set data = excluded.data, updated_at = now()
      returning updated_at
    `,
    [syncKey, JSON.stringify(payload.items)],
  );

  return NextResponse.json({
    ok: true,
    updatedAt: result.rows[0].updated_at,
  });
}
