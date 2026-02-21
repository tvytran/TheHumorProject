"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight text-black dark:text-white">
          The Humor Project
        </span>
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/humor-flavors" className="hover:text-black dark:hover:text-white transition-colors">
            Flavors
          </Link>
          <Link href="/love-notes" className="hover:text-black dark:hover:text-white transition-colors">
            Love Notes
          </Link>
          <Link href="/generate" className="hover:text-black dark:hover:text-white transition-colors">
            Generate
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Powered by Supabase
        </div>

        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-black sm:text-5xl lg:text-6xl dark:text-white">
          Campus humor,
          <br />
          <span className="text-zinc-400 dark:text-zinc-500">served fresh.</span>
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          A collection of humor flavors and real campus moments from
          Columbia &amp; Barnard, fetched live from Supabase.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/love-notes"
            className="flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            View Love Notes
          </Link>
          <Link
            href="/humor-flavors"
            className="flex h-11 items-center justify-center rounded-lg border border-zinc-200 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Explore Flavors
          </Link>
        </div>
      </main>

      {/* Feature Cards */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Love Notes Card */}
          <Link
            href="/love-notes"
            className="group rounded-xl border border-zinc-200 p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-lg dark:bg-pink-950">
              💖
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Campus Love Notes
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Real campus moments — the meet-cutes, the drama, and everything
              in between. With a retro Y2K aesthetic.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
              Browse notes
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Humor Flavors Card */}
          <Link
            href="/humor-flavors"
            className="group rounded-xl border border-zinc-200 p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-lg dark:bg-violet-950">
              🎭
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Humor Flavors
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Explore distinct humor personalities — from Gigachad to
              Dwight Schrute. Each flavor has its own comedic style.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
              View flavors
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>

          {/* Generate Captions Card */}
          <Link
            href="/generate"
            className="group rounded-xl border border-zinc-200 p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700 sm:col-span-2"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg dark:bg-amber-950">
              📷
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Generate Captions
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Upload an image and get AI-generated humor captions instantly.
              Sign in to try it out.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
              Try it now
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-5xl border-t border-zinc-100 px-6 py-6 dark:border-zinc-900">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            The Humor Project &mdash; Columbia &amp; Barnard
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            Built with Next.js &amp; Supabase
          </span>
        </div>
      </footer>
    </div>
  );
}
