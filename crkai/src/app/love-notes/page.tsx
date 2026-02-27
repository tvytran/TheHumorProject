"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface Caption {
  id: string;
  content: string;
  created_datetime_utc: string;
  image_id: string | null;
  image_url: string | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [votingId, setVotingId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Fetch captions with their linked image URL via join
      const { data, error } = await supabase
        .from("captions")
        .select("id, content, created_datetime_utc, image_id, images(url)")
        .eq("is_public", true)
        .not("content", "is", null)
        .order("created_datetime_utc", { ascending: false })
        .limit(30);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Filter out captions that are empty or only emojis/whitespace
      const emojiRegex = /^[\s\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\p{Emoji_Component}\u200d\ufe0f]*$/u;
      const validCaptions = (data ?? [])
        .filter(
          (c: Record<string, unknown>) =>
            c.content &&
            typeof c.content === "string" &&
            c.content.trim().length > 0 &&
            !emojiRegex.test(c.content)
        )
        .map((c: Record<string, unknown>) => ({
          id: c.id as string,
          content: c.content as string,
          created_datetime_utc: c.created_datetime_utc as string,
          image_id: (c.image_id as string) || null,
          image_url:
            c.images && typeof c.images === "object" && (c.images as Record<string, unknown>).url
              ? ((c.images as Record<string, unknown>).url as string)
              : null,
        }));

      setCaptions(validCaptions);

      const ids = validCaptions.map((c) => c.id);
      if (ids.length > 0) {
        try {
          const { data: votes } = await supabase
            .from("caption_votes")
            .select("caption_id, vote_value")
            .in("caption_id", ids);

          const counts: VoteCounts = {};
          for (const id of ids) {
            counts[id] = { upvotes: 0, downvotes: 0 };
          }
          for (const v of votes ?? []) {
            if (counts[v.caption_id]) {
              if (v.vote_value === 1) counts[v.caption_id].upvotes++;
              else if (v.vote_value === -1) counts[v.caption_id].downvotes++;
            }
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
        } catch (e) {
          console.error("Failed to load votes:", e);
        }
      }

      setLoading(false);
    }
    init();
  }, []);

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

    const now = new Date().toISOString();
    const { error } = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      vote_value: voteValue,
      profile_id: user.id,
      created_datetime_utc: now,
      modified_datetime_utc: now,
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

  function goNext() {
    if (currentIndex < captions.length - 1 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setAnimating(false);
      }, 200);
    }
  }

  function goPrev() {
    if (currentIndex > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setAnimating(false);
      }, 200);
    }
  }

  const currentCaption = captions[currentIndex];
  const counts = currentCaption
    ? voteCounts[currentCaption.id] ?? { upvotes: 0, downvotes: 0 }
    : { upvotes: 0, downvotes: 0 };
  const myVote = currentCaption ? userVotes[currentCaption.id] ?? null : null;
  const isVoting = currentCaption ? votingId === currentCaption.id : false;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff0f3]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">💖</span>
          <p className="text-sm text-[#db2777]">Loading captions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff0f3]">
        <p className="text-red-500">Failed to load: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans">
      {/* Hearts background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-pink-200 opacity-25"
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

      <main className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-[#db2777] hover:text-[#9d174d]">
            &larr; Home
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#be185d]">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-full border-2 border-pink-300 bg-white px-3 py-1 text-xs font-bold text-[#be185d] transition-colors hover:bg-pink-50"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#ec4899] px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-pink-200 hover:bg-[#db2777]"
            >
              Sign in to vote
            </Link>
          )}
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <span className="text-4xl">💖</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#9d174d] sm:text-3xl">
            Vote on Captions
          </h1>
          <p className="mt-1 text-sm text-[#be185d]/60">
            One at a time — upvote or downvote each caption
          </p>
        </div>

        {/* Caption Card - One at a time */}
        {captions.length > 0 && currentCaption ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            {/* Progress */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-medium text-[#db2777]">
                {currentIndex + 1} / {captions.length}
              </span>
              <div className="h-1.5 w-32 rounded-full bg-pink-200">
                <div
                  className="h-full rounded-full bg-[#ec4899] transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / captions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* The Card */}
            <div
              className={`w-full overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-xl shadow-pink-200/40 transition-all duration-200 ${
                animating ? "scale-95 opacity-50" : "scale-100 opacity-100"
              }`}
            >
              {/* Card title bar */}
              <div className="flex items-center justify-between border-b-2 border-pink-200 bg-gradient-to-r from-pink-100 to-pink-50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-pink-300" />
                  <span className="h-3 w-3 rounded-full bg-pink-200" />
                  <span className="h-3 w-3 rounded-full bg-pink-100" />
                </div>
                <span className="text-xs font-bold text-[#be185d]">
                  caption #{currentIndex + 1}
                </span>
              </div>

              {/* Image */}
              {currentCaption.image_url && (
                <div className="flex items-center justify-center border-b border-pink-100 bg-pink-50/50 p-4">
                  <img
                    src={currentCaption.image_url}
                    alt="Caption image"
                    className="max-h-64 max-w-full rounded-xl object-contain shadow-md shadow-pink-200/30"
                  />
                </div>
              )}

              {/* Card content */}
              <div className="flex flex-col items-center px-6 py-8 text-center">
                <p className="text-lg leading-relaxed text-[#4a0e2a]">
                  {currentCaption.content ?? ""}
                </p>
                <span className="mt-4 text-xs text-pink-300">
                  {new Date(currentCaption.created_datetime_utc).toLocaleDateString()}
                </span>
              </div>

              {/* Vote buttons */}
              <div className="flex border-t-2 border-pink-200">
                <button
                  onClick={() => handleVote(currentCaption.id, 1)}
                  disabled={!user || isVoting}
                  className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                    myVote === 1
                      ? "bg-[#ec4899] text-white"
                      : user
                      ? "bg-pink-50 text-[#db2777] hover:bg-pink-100"
                      : "cursor-not-allowed bg-pink-50/50 text-pink-300"
                  }`}
                >
                  <span className="text-lg">👍</span>
                  <span>Upvote</span>
                  <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs">
                    {counts.upvotes}
                  </span>
                </button>
                <div className="w-0.5 bg-pink-200" />
                <button
                  onClick={() => handleVote(currentCaption.id, -1)}
                  disabled={!user || isVoting}
                  className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                    myVote === -1
                      ? "bg-[#be185d] text-white"
                      : user
                      ? "bg-pink-50 text-[#db2777] hover:bg-pink-100"
                      : "cursor-not-allowed bg-pink-50/50 text-pink-300"
                  }`}
                >
                  <span className="text-lg">👎</span>
                  <span>Downvote</span>
                  <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs">
                    {counts.downvotes}
                  </span>
                </button>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0 || animating}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all ${
                  currentIndex === 0
                    ? "border-pink-200 text-pink-200 cursor-not-allowed"
                    : "border-pink-400 text-[#db2777] hover:bg-pink-100 hover:scale-110"
                }`}
              >
                &larr;
              </button>
              <span className="text-xs text-[#be185d]/50">
                Tap arrows to browse
              </span>
              <button
                onClick={goNext}
                disabled={currentIndex === captions.length - 1 || animating}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all ${
                  currentIndex === captions.length - 1
                    ? "border-pink-200 text-pink-200 cursor-not-allowed"
                    : "border-pink-400 text-[#db2777] hover:bg-pink-100 hover:scale-110"
                }`}
              >
                &rarr;
              </button>
            </div>

            {!user && (
              <div className="mt-4 rounded-full border border-pink-300 bg-white px-5 py-2 text-xs text-[#be185d]">
                <Link href="/login" className="underline hover:text-[#9d174d]">
                  Sign in
                </Link>{" "}
                to vote on captions!
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[#db2777]">No captions to show yet.</p>
          </div>
        )}

        {/* Bottom nav tabs */}
        <div className="mt-8 flex overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-lg shadow-pink-200/30">
          <Link
            href="/love-notes"
            className="flex flex-1 flex-col items-center gap-1 bg-pink-100 py-4 text-[#9d174d] font-bold text-xs"
          >
            <span className="text-lg">💖</span>
            Vote
          </Link>
          <div className="w-0.5 bg-pink-200" />
          <Link
            href="/generate"
            className="flex flex-1 flex-col items-center gap-1 py-4 text-[#db2777]/60 hover:text-[#db2777] hover:bg-pink-50 text-xs transition-colors"
          >
            <span className="text-lg">📷</span>
            Create
          </Link>
          <div className="w-0.5 bg-pink-200" />
          <Link
            href="/humor-flavors"
            className="flex flex-1 flex-col items-center gap-1 py-4 text-[#db2777]/60 hover:text-[#db2777] hover:bg-pink-50 text-xs transition-colors"
          >
            <span className="text-lg">🎭</span>
            Flavors
          </Link>
        </div>
      </main>
    </div>
  );
}
