import { NextResponse } from "next/server";

export function jsonOk(data, init = {}) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message, status = 400, details = null) {
  return NextResponse.json(
    { ok: false, error: message, ...(details ? { details } : {}) },
    { status }
  );
}
