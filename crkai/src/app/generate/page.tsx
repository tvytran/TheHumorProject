"use client";

import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

const API_BASE = "https://api.almostcrackd.ai";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

interface GeneratedCaption {
  id: string;
  content: string;
  [key: string]: unknown;
}

export default function GeneratePage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
      }
    }
    init();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Unsupported file type. Please use JPEG, PNG, WebP, GIF, or HEIC.");
      return;
    }

    setFile(selected);
    setError(null);
    setCaptions([]);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleGenerate() {
    if (!file || !token) return;

    setLoading(true);
    setError(null);
    setCaptions([]);

    try {
      // Step 1: Generate presigned URL
      setStatus("Getting upload URL...");
      const step1Res = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!step1Res.ok) {
        throw new Error(`Failed to get upload URL (${step1Res.status})`);
      }

      const { presignedUrl, cdnUrl } = await step1Res.json();

      // Step 2: Upload image bytes
      setStatus("Uploading image...");
      const step2Res = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!step2Res.ok) {
        throw new Error(`Failed to upload image (${step2Res.status})`);
      }

      // Step 3: Register image URL
      setStatus("Registering image...");
      const step3Res = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });

      if (!step3Res.ok) {
        throw new Error(`Failed to register image (${step3Res.status})`);
      }

      const { imageId } = await step3Res.json();

      // Step 4: Generate captions
      setStatus("Generating captions...");
      const step4Res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      if (!step4Res.ok) {
        throw new Error(`Failed to generate captions (${step4Res.status})`);
      }

      const captionData = await step4Res.json();
      setCaptions(Array.isArray(captionData) ? captionData : [captionData]);
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-[#0a0a0a]">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-black dark:hover:text-white"
          >
            &larr; Back to home
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-black dark:text-white">
          Generate Captions
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Upload an image and get AI-generated humor captions.
        </p>

        {/* Upload area */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />

          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={preview}
                alt="Selected image"
                className="max-h-64 rounded-lg object-contain"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setCaptions([]);
                  setError(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white"
              >
                Remove image
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-12 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:hover:border-zinc-500"
            >
              <span className="text-3xl">📷</span>
              <span className="text-sm font-medium">
                Click to select an image
              </span>
              <span className="text-xs">
                JPEG, PNG, WebP, GIF, or HEIC
              </span>
            </button>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!file || loading}
          className={`mb-6 w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
            file && !loading
              ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
          }`}
        >
          {loading ? status || "Processing..." : "Generate Captions"}
        </button>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Captions */}
        {captions.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Generated Captions
            </h2>
            <div className="grid gap-3">
              {captions.map((caption, i) => (
                <div
                  key={caption.id || i}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {caption.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
