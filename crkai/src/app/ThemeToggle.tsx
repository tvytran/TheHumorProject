"use client";

import { useEffect, useState } from "react";

type Theme = "pink" | "neutral";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("pink");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crkai-theme") as Theme | null;
      if (stored === "neutral") setTheme("neutral");
    } catch {}
  }, []);

  function toggle() {
    const next: Theme = theme === "pink" ? "neutral" : "pink";
    setTheme(next);
    try {
      localStorage.setItem("crkai-theme", next);
    } catch {}
    if (next === "neutral") {
      document.documentElement.setAttribute("data-theme", "neutral");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  return (
    <button
      onClick={toggle}
      title="Switch color theme"
      aria-label="Switch color theme"
      className="rounded-full border-2 border-pink-300 bg-white px-3 py-1 text-xs font-medium text-[#be185d] transition-colors hover:bg-pink-50"
    >
      {theme === "pink" ? "Neutral theme" : "Pink theme"}
    </button>
  );
}
