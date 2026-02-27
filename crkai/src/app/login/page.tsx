"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff0f3] font-sans">
      {/* Hearts background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-pink-200 opacity-25"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 57) % 100}%`,
              fontSize: `${14 + (i % 3) * 8}px`,
            }}
          >
            {i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "♡"}
          </span>
        ))}
      </div>

      <nav className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-[#be185d]"
        >
          The Humor Project
        </Link>
      </nav>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6">
        <div className="w-full overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-xl shadow-pink-200/40">
          {/* Window title bar */}
          <div className="flex items-center justify-between border-b-2 border-pink-200 bg-gradient-to-r from-pink-100 to-pink-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-pink-300" />
              <span className="h-3 w-3 rounded-full bg-pink-200" />
              <span className="h-3 w-3 rounded-full bg-pink-100" />
            </div>
            <span className="text-xs font-bold text-[#be185d]">login.exe</span>
          </div>

          <div className="p-8">
            <div className="mb-4 text-center">
              <span className="text-4xl">💖</span>
            </div>
            <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-[#9d174d]">
              Sign in
            </h1>
            <p className="mb-8 text-center text-sm text-[#be185d]/60">
              Sign in to vote on captions and create your own
            </p>

            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-pink-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#4a0e2a] transition-all hover:bg-pink-50 hover:border-pink-300 hover:shadow-md hover:shadow-pink-100"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 text-sm text-[#db2777]/60 hover:text-[#db2777]"
        >
          &larr; Back to home
        </Link>
      </main>
    </div>
  );
}
