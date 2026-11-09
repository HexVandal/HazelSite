import { NextResponse } from "next/server";

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, { status, headers });
}

export function errorJson(message: string, status = 400) {
  return json({ error: message }, status, { "Cache-Control": "no-store" });
}

export function readError(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected API error";
}
