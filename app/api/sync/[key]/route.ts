import { createHash } from "node:crypto";
import { get, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type TripPayload = {
  items: unknown;
};

const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

function normalizeKey(key: string) {
  const decoded = decodeURIComponent(key).trim();

  if (decoded.length < 6 || decoded.length > 120) {
    return null;
  }

  return createHash("sha256").update(decoded).digest("hex");
}

function pathnameForKey(syncKey: string) {
  return `trip-configs/${syncKey}.json`;
}

function unavailable() {
  return NextResponse.json(
    {
      error: "Cloud sync is not configured. Add a Vercel Blob store to this project.",
    },
    { status: 503 },
  );
}

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string }> }) {
  if (!isBlobConfigured) {
    return unavailable();
  }

  const { key } = await context.params;
  const syncKey = normalizeKey(key);

  if (!syncKey) {
    return NextResponse.json({ error: "Invalid sync key." }, { status: 400 });
  }

  const blob = await get(pathnameForKey(syncKey), { access: "private", useCache: false });

  if (!blob) {
    return NextResponse.json({ error: "No cloud itinerary for this key." }, { status: 404 });
  }

  const data = (await new Response(blob.stream).json()) as { items?: unknown; updatedAt?: string };

  if (!Array.isArray(data.items)) {
    return NextResponse.json({ error: "Invalid cloud itinerary payload." }, { status: 500 });
  }

  return NextResponse.json({
    items: data.items,
    updatedAt: data.updatedAt ?? blob.blob.uploadedAt,
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  if (!isBlobConfigured) {
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

  const updatedAt = new Date().toISOString();

  await put(pathnameForKey(syncKey), JSON.stringify({ items: payload.items, updatedAt }), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json",
  });

  return NextResponse.json({
    ok: true,
    updatedAt,
  });
}
