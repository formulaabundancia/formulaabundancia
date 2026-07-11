"use client";

import { Visibility } from "@/lib/types";

export function VisibilityToggle({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (v: Visibility) => void;
}) {
  return (
    <div className="flex rounded-full bg-zinc-100 p-0.5 text-xs dark:bg-zinc-800">
      <button
        type="button"
        onClick={() => onChange("private")}
        className={`rounded-full px-2.5 py-1 font-medium transition ${
          value === "private"
            ? "bg-white text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        🔒 Solo yo
      </button>
      <button
        type="button"
        onClick={() => onChange("shared")}
        className={`rounded-full px-2.5 py-1 font-medium transition ${
          value === "shared"
            ? "bg-white text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        🌐 Compartido
      </button>
    </div>
  );
}
