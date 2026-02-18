"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface Caption {
  id: string;
  content: string;
  created_datetime_utc: string;
}

interface VoteCounts {
  [captionId: string]: { upvotes: number; downvotes: number };
}

interface UserVotes {
  [captionId: string]: 1 | -1 | null;
}

export default function LoveNotesPage() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [votingId, setVotingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("captions")
        .select("id, content, created_datetime_utc")
        .eq("is_public", true)
        .order("created_datetime_utc", { ascending: false })
        .limit(30);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setCaptions(data ?? []);

      const ids = (data ?? []).map((c) => c.id);
      if (ids.length > 0) {
        const { data: votes } = await supabase
          .from("caption_votes")
          .select("caption_id, vote_value")
          .in("caption_id", ids);

        const counts: VoteCounts = {};
        for (const id of ids) {
          counts[id] = { upvotes: 0, downvotes: 0 };
        }
        for (const v of votes ?? []) {
          if (v.vote_value === 1) counts[v.caption_id].upvotes++;
          else if (v.vote_value === -1) counts[v.caption_id].downvotes++;
        }
        setVoteCounts(counts);

        if (user) {
          const { data: myVotes } = await supabase
            .from("caption_votes")
            .select("caption_id, vote_value")
            .eq("profile_id", user.id)
            .in("caption_id", ids);

          const uv: UserVotes = {};
          for (const v of myVotes ?? []) {
            uv[v.caption_id] = v.vote_value;
          }
          setUserVotes(uv);
        }
      }

      setLoading(false);
    }
    init();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleVote(captionId: string, voteValue: 1 | -1) {
    if (!user) return;
    if (votingId === captionId) return;

    setVotingId(captionId);

    const existing = userVotes[captionId];

    if (existing === voteValue) {
      setVotingId(null);
      return;
    }

    const { error } = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      vote_value: voteValue,
      profile_id: user.id,
    });

    if (error) {
      console.error("Vote insert error:", error.message, error.code, error.details);
    } else {
      setVoteCounts((prev) => {
        const updated = { ...prev };
        const counts = { ...(updated[captionId] ?? { upvotes: 0, downvotes: 0 }) };

        if (existing === 1) counts.upvotes = Math.max(0, counts.upvotes - 1);
        if (existing === -1) counts.downvotes = Math.max(0, counts.downvotes - 1);

        if (voteValue === 1) counts.upvotes++;
        else counts.downvotes++;

        updated[captionId] = counts;
        return updated;
      });
      setUserVotes((prev) => ({ ...prev, [captionId]: voteValue }));
    }

    setVotingId(null);
  }

  const filtered = captions.filter((c) =>
    c.content.toLowerCase().includes(search.toLowerCase())
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
          <Link href="/" className="text-sm text-[#c2185b] hover:text-[#880e4f]">
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
          <div className="flex items-center gap-2 border-b-2 border-[#e57373] bg-[#f48fb1] px-4 py-2">
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="h-3 w-3 rounded-full border border-[#c2185b] bg-[#ef9a9a]" />
            <span className="ml-2 text-xs font-bold text-[#880e4f]">
              love_notes.exe
            </span>
          </div>
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
            {!user && (
              <div className="mt-1 inline-block rounded border border-[#e57373] bg-[#fce4ec] px-4 py-1 text-xs text-[#880e4f]">
                <Link href="/login" className="underline hover:text-[#c2185b]">
                  Sign in
                </Link>{" "}
                to rate notes!
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 overflow-hidden rounded-lg border-2 border-[#e57373] bg-[#fff5f5] shadow-[4px_4px_0px_#e57373]">
          <div className="flex items-center gap-2 border-b-2 border-[#e57373] bg-[#f48fb1] px-4 py-2">
            <span className="text-sm">🔍</span>
            <span className="text-xs font-bold text-[#880e4f]">Love Search</span>
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
              Showing {filtered.length} of {captions.length} notes ♡
            </div>
          )}
        </div>

        {/* Notes grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((caption, i) => {
            const counts = voteCounts[caption.id] ?? { upvotes: 0, downvotes: 0 };
            const myVote = userVotes[caption.id] ?? null;
            const isVoting = votingId === caption.id;

            return (
              <div
                key={caption.id}
                className="overflow-hidden rounded-lg border-2 border-[#e57373] bg-[#fff5f5] shadow-[3px_3px_0px_#ef9a9a] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#e57373]"
              >
                <div className="flex items-center justify-between border-b-2 border-[#e57373] bg-[#f48fb1] px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#ef9a9a]" />
                    <span className="h-2 w-2 rounded-full bg-[#ef9a9a]" />
                    <span className="h-2 w-2 rounded-full bg-[#ef9a9a]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#880e4f]">
                    note #{i + 1}
                  </span>
                </div>
                <div className="px-4 py-4">
                  <div className="mb-3 flex items-start gap-2">
                    <span className="mt-0.5 text-lg">
                      {["💕", "💘", "💌", "🌸", "💗", "✨", "💝", "🎀"][i % 8]}
                    </span>
                    <p className="text-sm leading-relaxed text-[#5d1049]">
                      {caption.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#e57373]">
                      {new Date(caption.created_datetime_utc).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(caption.id, 1)}
                        disabled={!user || isVoting}
                        title={user ? "Upvote" : "Sign in to vote"}
                        className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-bold transition-colors ${
                          myVote === 1
                            ? "border-[#c2185b] bg-[#c2185b] text-white"
                            : user
                            ? "border-[#e57373] bg-[#fce4ec] text-[#c2185b] hover:bg-[#f48fb1]"
                            : "cursor-not-allowed border-[#f8bbd0] bg-[#fce4ec] text-[#f48fb1]"
                        }`}
                      >
                        <span>▲</span>
                        <span>{counts.upvotes}</span>
                      </button>
                      <button
                        onClick={() => handleVote(caption.id, -1)}
                        disabled={!user || isVoting}
                        title={user ? "Downvote" : "Sign in to vote"}
                        className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-bold transition-colors ${
                          myVote === -1
                            ? "border-[#880e4f] bg-[#880e4f] text-white"
                            : user
                            ? "border-[#e57373] bg-[#fce4ec] text-[#c2185b] hover:bg-[#f48fb1]"
                            : "cursor-not-allowed border-[#f8bbd0] bg-[#fce4ec] text-[#f48fb1]"
                        }`}
                      >
                        <span>▼</span>
                        <span>{counts.downvotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && search && (
          <div className="mt-8 text-center text-sm text-[#c2185b]">
            No love notes match &quot;{search}&quot; 💔
          </div>
        )}

        {/* Footer */}
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
