import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { captionIds } = await request.json();

  if (!Array.isArray(captionIds) || captionIds.length === 0) {
    return NextResponse.json({ error: "captionIds required" }, { status: 400 });
  }

  const { error } = await adminClient
    .from("captions")
    .update({ is_public: true })
    .in("id", captionIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: captionIds.length });
}
