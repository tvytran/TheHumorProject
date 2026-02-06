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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-red-500">Failed to load humor flavors: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl px-6 py-16 sm:px-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          &larr; Back to home
        </Link>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Humor Flavors
        </h1>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400">
          {flavors.length} flavors loaded from Supabase
        </p>
        <div className="grid gap-4">
          {flavors.map((flavor: HumorFlavor) => (
            <div
              key={flavor.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-medium text-black dark:text-zinc-50">
                  {flavor.slug}
                </h2>
                <span className="shrink-0 text-xs text-zinc-400">
                  {new Date(flavor.created_datetime_utc).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {flavor.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
