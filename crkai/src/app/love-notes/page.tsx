"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface CommunityContext {
  id: number;
  content: string;
  created_datetime_utc: string;
}

export default function LoveNotesPage() {
  const [contexts, setContexts] = useState<CommunityContext[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("community_contexts")
        .select("id, content, created_datetime_utc")
        .order("id", { ascending: true })
        .limit(30);

      if (error) {
        setError(error.message);
      } else {
        setContexts(data ?? []);
      }
      setLoading(false);
    }
    init();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const filtered = contexts.filter((ctx) =>
    ctx.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fce4ec]">
        <p className="text-sm text-[#c2185b]">Loading love notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffe4ec]">
        <p className="text-red-500">Failed to load: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fce4ec] font-sans">
      {/* Stars background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-[#f8bbd0] opacity-40"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              fontSize: `${10 + (i % 3) * 6}px`,
            }}
          >
            {i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "♡"}
          </span>
        ))}
      </div>

      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-8">
        {/* Back link + user info */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-[#c2185b] hover:text-[#880e4f]"
          >
            &larr; Back to home
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#ad1457]">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded border-2 border-[#e57373] bg-[#f48fb1] px-3 py-1 text-xs font-bold text-[#880e4f] shadow-[2px_2px_0px_#e57373] transition-colors hover:bg-[#f06292]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Hero window */}
        <div className="mb-8 overflow-hidden rounded-lg border-2 border-[#e57373] bg-[#fff5f5] shadow-[4px_4px_0px_#e57373]">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b-2 border-[#e57373] bg-[#f48fb1] px-4 py-2">
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="ml-2 text-xs font-bold text-[#880e4f]">
              love_notes.exe
            </span>
          </div>
          {/* Content */}
          <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
            <span className="text-5xl">💖</span>
            <h1 className="text-2xl font-bold tracking-tight text-[#c2185b] sm:text-3xl">
              Campus Love Notes
            </h1>
            <p className="max-w-md text-sm text-[#ad1457]">
              Real campus moments from Columbia &amp; Barnard — the
              meet-cutes, the drama, and everything in between.
            </p>
            <div className="mt-2 inline-block rounded border border-[#f48fb1] bg-[#fce4ec] px-4 py-1 text-xs text-[#c2185b]">
              This message may contain Love 💌
            </div>
          </div>
        </div>

        {/* Love Search */}
        <div className="mb-8 overflow-hidden rounded-lg border-2 border-[#e57373] bg-[#fff5f5] shadow-[4px_4px_0px_#e57373]">
          <div className="flex items-center gap-2 border-b-2 border-[#e57373] bg-[#f48fb1] px-4 py-2">
            <span className="text-sm">🔍</span>
            <span className="text-xs font-bold text-[#880e4f]">
              Love Search
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              type="text"
              placeholder="Search love notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded border-2 border-[#f48fb1] bg-[#fce4ec] px-4 py-2 text-sm text-[#5d1049] placeholder-[#e57373] outline-none focus:border-[#c2185b]"
            />
            <button
              onClick={() => setSearch("")}
              className="rounded border-2 border-[#e57373] bg-[#f48fb1] px-4 py-2 text-xs font-bold text-[#880e4f] shadow-[2px_2px_0px_#e57373] transition-colors hover:bg-[#f06292]"
            >
              Clear
            </button>
          </div>
          {search && (
            <div className="border-t border-[#f48fb1] px-4 py-2 text-center text-xs text-[#c2185b]">
              Showing {filtered.length} of {contexts.length} notes ♡
            </div>
          )}
        </div>

        {/* Notes grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((ctx, i) => (
            <div
              key={ctx.id}
              className="overflow-hidden rounded-lg border-2 border-[#e57373] bg-[#fff5f5] shadow-[3px_3px_0px_#ef9a9a] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#e57373]"
            >
              {/* Mini title bar */}
              <div className="flex items-center justify-between border-b-2 border-[#e57373] bg-[#f48fb1] px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ef9a9a]" />
                  <span className="h-2 w-2 rounded-full bg-[#ef9a9a]" />
                  <span className="h-2 w-2 rounded-full bg-[#ef9a9a]" />
                </div>
                <span className="text-[10px] font-bold text-[#880e4f]">
                  note #{ctx.id}
                </span>
              </div>
              {/* Body */}
              <div className="px-4 py-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-0.5 text-lg">
                    {["💕", "💘", "💌", "🌸", "💗", "✨", "💝", "🎀"][i % 8]}
                  </span>
                  <p className="text-sm leading-relaxed text-[#5d1049]">
                    {ctx.content}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#e57373]">
                    {new Date(ctx.created_datetime_utc).toLocaleDateString()}
                  </span>
                  <div className="flex gap-0.5 text-[10px]">
                    {"♥♥♥♥♥".split("").map((h, j) => (
                      <span
                        key={j}
                        className={
                          j < 3 + (i % 3)
                            ? "text-[#e57373]"
                            : "text-[#f8bbd0]"
                        }
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && search && (
          <div className="mt-8 text-center text-sm text-[#c2185b]">
            No love notes match &quot;{search}&quot; 💔
          </div>
        )}

        {/* Footer window */}
        <div className="mt-10 overflow-hidden rounded-lg border-2 border-[#e57373] bg-[#fff5f5] shadow-[4px_4px_0px_#e57373]">
          <div className="flex items-center gap-2 border-b-2 border-[#e57373] bg-[#f48fb1] px-4 py-2">
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
          </div>
          <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
            <span className="text-2xl">💖</span>
            <p className="text-sm font-bold text-[#c2185b]">
              REMEMBER TO LOVE YOURSELF!
            </p>
            <div className="mt-2 flex gap-3">
              <span className="rounded border border-[#f48fb1] bg-[#fce4ec] px-4 py-1 text-xs text-[#c2185b]">
                Cute!
              </span>
              <span className="rounded border border-[#f48fb1] bg-[#fce4ec] px-4 py-1 text-xs text-[#c2185b]">
                Aww!
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
