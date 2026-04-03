import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { caption_id, vote_value } = body;

  if (!caption_id || ![1, -1].includes(vote_value)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await supabase.from("caption_votes").upsert(
    {
      caption_id,
      vote_value,
      profile_id: user.id,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    },
    { onConflict: "caption_id,profile_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
