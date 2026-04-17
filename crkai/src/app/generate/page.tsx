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

interface HumorFlavor {
  id: string;
  slug: string;
  description: string | null;
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
  const [flavors, setFlavors] = useState<HumorFlavor[]>([]);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>("");
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

      // Fetch humor flavors
      const { data: flavorData } = await supabase
        .from("humor_flavors")
        .select("id, slug, description")
        .order("created_datetime_utc", { ascending: false });
      if (flavorData && flavorData.length > 0) {
        setFlavors(flavorData);
        setSelectedFlavorId(String(flavorData[0].id));
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

      const step3Data = await step3Res.json();
      const { imageId } = step3Data;
      console.log("[generate] step3 response:", step3Data);
      console.log("[generate] imageId:", imageId);

      // Step 4: Generate captions
      setStatus("Generating captions...");
      console.log("[generate] sending to generate-captions:", { imageId, humorFlavorId: selectedFlavorId });
      const step4Res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId, humorFlavorId: selectedFlavorId }),
      });

      if (!step4Res.ok) {
        const errText = await step4Res.text();
        throw new Error(errText || `Failed to generate captions (${step4Res.status})`);
      }

      const responseText = await step4Res.text();
      let captionData;
      try {
        captionData = JSON.parse(responseText);
      } catch {
        throw new Error(responseText || "Caption API returned an invalid response");
      }
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
    <div className="min-h-screen bg-[#fff0f3] font-sans">
      {/* Hearts background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-pink-200 opacity-20"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 57) % 100}%`,
              fontSize: `${12 + (i % 4) * 8}px`,
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
          {user && (
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
          )}
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <span className="text-4xl">📷</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#9d174d] sm:text-3xl">
            Create a Caption
          </h1>
          <p className="mt-1 text-sm text-[#be185d]/60">
            Upload a photo and get AI-generated humor captions
          </p>
        </div>

        {/* Upload area */}
        <div className="mb-5 overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-lg shadow-pink-200/30">
          <div className="flex items-center justify-between border-b-2 border-pink-200 bg-gradient-to-r from-pink-100 to-pink-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-pink-300" />
              <span className="h-3 w-3 rounded-full bg-pink-200" />
              <span className="h-3 w-3 rounded-full bg-pink-100" />
            </div>
            <span className="text-xs font-bold text-[#be185d]">upload.exe</span>
          </div>

          <div className="p-6">
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
                  className="max-h-64 rounded-xl object-contain"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setCaptions([]);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-[#db2777] hover:text-[#9d174d] underline"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-pink-300 py-12 text-pink-400 transition-colors hover:border-pink-400 hover:text-[#db2777] hover:bg-pink-50/50"
              >
                <span className="text-4xl">📷</span>
                <span className="text-sm font-semibold">
                  Click to select an image
                </span>
                <span className="text-xs text-pink-300">
                  JPEG, PNG, WebP, GIF, or HEIC
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Humor Flavor selector */}
        {flavors.length > 0 && (
          <div className="mb-5 overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-lg shadow-pink-200/30">
            <div className="flex items-center justify-between border-b-2 border-pink-200 bg-gradient-to-r from-pink-100 to-pink-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-pink-300" />
                <span className="h-3 w-3 rounded-full bg-pink-200" />
                <span className="h-3 w-3 rounded-full bg-pink-100" />
              </div>
              <span className="text-xs font-bold text-[#be185d]">humor flavor</span>
            </div>
            <div className="p-4">
              <select
                value={selectedFlavorId}
                onChange={(e) => setSelectedFlavorId(e.target.value)}
                className="w-full rounded-xl border-2 border-pink-200 bg-pink-50 px-3 py-2 text-sm text-[#4a0e2a] focus:border-pink-400 focus:outline-none"
              >
                {flavors.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.slug}{f.description ? ` — ${f.description.slice(0, 60)}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!file || loading || !selectedFlavorId}
          className={`mb-5 w-full rounded-full px-6 py-3.5 text-sm font-bold transition-all ${
            file && !loading
              ? "bg-[#ec4899] text-white hover:bg-[#db2777] shadow-lg shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-[1.02]"
              : "cursor-not-allowed bg-pink-200 text-pink-400"
          }`}
        >
          {loading ? status || "Processing..." : "Generate Captions"}
        </button>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Generated Captions */}
        {captions.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-center text-lg font-bold text-[#9d174d]">
              Generated Captions
            </h2>
            <div className="grid gap-3">
              {captions.map((caption, i) => (
                <div
                  key={caption.id || i}
                  className="rounded-2xl border-2 border-pink-200 bg-white p-5 shadow-md shadow-pink-100/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {["✨", "💫", "🌟", "💖"][i % 4]}
                    </span>
                    <p className="text-sm leading-relaxed text-[#4a0e2a]">
                      {caption.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer to push tab bar down */}
        <div className="flex-1" />

        {/* Bottom nav tabs */}
        <div className="mt-8 flex overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-lg shadow-pink-200/30">
          <Link
            href="/love-notes"
            className="flex flex-1 flex-col items-center gap-1 py-4 text-[#db2777]/60 hover:text-[#db2777] hover:bg-pink-50 text-xs transition-colors"
          >
            <span className="text-lg">💖</span>
            Vote
          </Link>
          <div className="w-0.5 bg-pink-200" />
          <Link
            href="/generate"
            className="flex flex-1 flex-col items-center gap-1 bg-pink-100 py-4 text-[#9d174d] font-bold text-xs"
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
