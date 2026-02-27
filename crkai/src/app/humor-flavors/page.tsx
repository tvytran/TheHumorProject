import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface HumorFlavor {
  id: number;
  created_datetime_utc: string;
  description: string;
  slug: string;
}

export const revalidate = 60;

export default async function HumorFlavorsPage() {
  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff0f3]">
        <p className="text-red-500">Failed to load humor flavors: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans">
      <main className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-[#db2777] hover:text-[#9d174d]"
          >
            &larr; Home
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <span className="text-4xl">🎭</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#9d174d] sm:text-3xl">
            Humor Flavors
          </h1>
          <p className="mt-1 text-sm text-[#be185d]/60">
            {flavors.length} flavors loaded from Supabase
          </p>
        </div>

        {/* Flavors grid */}
        <div className="grid gap-4">
          {flavors.map((flavor: HumorFlavor) => (
            <div
              key={flavor.id}
              className="rounded-2xl border-2 border-pink-200 bg-white p-5 shadow-md shadow-pink-100/40 transition-all hover:border-pink-300 hover:-translate-y-0.5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-bold text-[#9d174d]">
                  {flavor.slug}
                </h2>
                <span className="shrink-0 text-xs text-pink-300">
                  {new Date(flavor.created_datetime_utc).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#4a0e2a]/70">
                {flavor.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom nav tabs */}
        <div className="mt-10 flex overflow-hidden rounded-2xl border-2 border-pink-300 bg-white shadow-lg shadow-pink-200/30">
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
            className="flex flex-1 flex-col items-center gap-1 py-4 text-[#db2777]/60 hover:text-[#db2777] hover:bg-pink-50 text-xs transition-colors"
          >
            <span className="text-lg">📷</span>
            Create
          </Link>
          <div className="w-0.5 bg-pink-200" />
          <Link
            href="/humor-flavors"
            className="flex flex-1 flex-col items-center gap-1 bg-pink-100 py-4 text-[#9d174d] font-bold text-xs"
          >
            <span className="text-lg">🎭</span>
            Flavors
          </Link>
        </div>
      </main>
    </div>
  );
}
