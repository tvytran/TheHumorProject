"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "./ThemeToggle";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff0f3] font-sans">
      {/* Floating hearts background */}
      <div className="theme-decorations pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-pink-200 opacity-30"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 57) % 100}%`,
              fontSize: `${12 + (i % 4) * 8}px`,
            }}
          >
            {i % 4 === 0 ? "♥" : i % 4 === 1 ? "✦" : i % 4 === 2 ? "♡" : "✧"}
          </span>
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-bold tracking-tight text-[#be185d]">
          The Humor Project
        </span>
        <div className="flex items-center gap-4 text-sm text-[#db2777]">
          <Link href="/humor-flavors" className="hover:text-[#9d174d] transition-colors">
            Flavors
          </Link>
          <Link href="/love-notes" className="hover:text-[#9d174d] transition-colors">
            Vote
          </Link>
          <Link href="/generate" className="hover:text-[#9d174d] transition-colors">
            Create
          </Link>
          <ThemeToggle />
          {user ? (
            <button
              onClick={handleSignOut}
              className="rounded-full border-2 border-pink-300 bg-white px-4 py-1.5 text-sm font-medium text-[#be185d] transition-colors hover:bg-pink-50"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#ec4899] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#db2777] shadow-md shadow-pink-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/70 px-4 py-1.5 text-xs text-[#db2777] backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
          Powered by Supabase + AI
        </div>

        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#9d174d] sm:text-5xl lg:text-6xl">
          Campus humor,
          <br />
          <span className="text-[#f472a8]">served fresh.</span>
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-[#be185d]/70">
          A collection of humor flavors and real campus moments from
          Columbia &amp; Barnard, fetched live from Supabase.
        </p>

        {/* Main Action Tabs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/love-notes"
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-[#ec4899] px-8 text-sm font-semibold text-white transition-all hover:bg-[#db2777] shadow-lg shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-105"
          >
            <span>💖</span> Vote on Captions
          </Link>
          <Link
            href="/generate"
            className="group flex h-12 items-center justify-center gap-2 rounded-full border-2 border-pink-300 bg-white px-8 text-sm font-semibold text-[#be185d] transition-all hover:bg-pink-50 hover:border-pink-400 hover:scale-105"
          >
            <span>📷</span> Create a Caption
          </Link>
        </div>
      </main>

      {/* How it works — added after user study showed all 3 testers
          needed verbal explanation to understand what the app does */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-16">
        <div className="rounded-3xl border-2 border-pink-200 bg-white/80 p-8 backdrop-blur-sm">
          <h2 className="text-center text-xl font-bold text-[#9d174d] sm:text-2xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#be185d]/70">
            The Humor Project collects funny captions from Columbia &amp; Barnard
            students to study what makes campus humor land. Here&apos;s the loop:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-pink-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ec4899] text-base font-bold text-white">
                1
              </div>
              <h3 className="text-sm font-bold text-[#9d174d]">Upload a photo</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#be185d]/70">
                Snap a campus moment and let our AI write a few caption options.
              </p>
            </div>
            <div className="rounded-2xl bg-pink-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ec4899] text-base font-bold text-white">
                2
              </div>
              <h3 className="text-sm font-bold text-[#9d174d]">Vote on captions</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#be185d]/70">
                Browse one caption at a time. Upvote the funny ones, downvote the duds.
              </p>
            </div>
            <div className="rounded-2xl bg-pink-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ec4899] text-base font-bold text-white">
                3
              </div>
              <h3 className="text-sm font-bold text-[#9d174d]">Help us learn</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#be185d]/70">
                Your votes feed a research dataset on humor — used only for the
                study, never sold or shared.
              </p>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-[#be185d]/60">
            New here? Start by{" "}
            <Link href="/love-notes" className="font-semibold text-[#db2777] underline">
              voting on a few captions
            </Link>
            {" "}— no account needed to browse.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 pt-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Vote Card */}
          <Link
            href="/love-notes"
            className="group rounded-2xl border-2 border-pink-200 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-pink-400 hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-1"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-xl">
              💖
            </div>
            <h3 className="text-base font-bold text-[#9d174d]">
              Vote on Captions
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#be185d]/60">
              See one caption at a time and vote it up or down. Swipe through campus moments.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-pink-400 group-hover:text-[#db2777] transition-colors">
              Start voting
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>

          {/* Create Card */}
          <Link
            href="/generate"
            className="group rounded-2xl border-2 border-pink-200 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-pink-400 hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-1"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-xl">
              📷
            </div>
            <h3 className="text-base font-bold text-[#9d174d]">
              Create a Caption
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#be185d]/60">
              Upload a photo and get AI-generated humor captions instantly. Sign in to try it.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-pink-400 group-hover:text-[#db2777] transition-colors">
              Try it now
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>

          {/* Flavors Card */}
          <Link
            href="/humor-flavors"
            className="group rounded-2xl border-2 border-pink-200 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-pink-400 hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-1"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-xl">
              🎭
            </div>
            <h3 className="text-base font-bold text-[#9d174d]">
              Humor Flavors
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#be185d]/60">
              Explore distinct comedy personalities from Supabase — each with its own unique style.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-pink-400 group-hover:text-[#db2777] transition-colors">
              View flavors
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-5xl border-t border-pink-200 px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <span className="text-xs text-[#db2777]/50">
            The Humor Project &mdash; Columbia &amp; Barnard
          </span>
          <span className="text-xs text-[#db2777]/50">
            Built with Next.js &amp; Supabase
          </span>
        </div>
      </footer>
    </div>
  );
}
