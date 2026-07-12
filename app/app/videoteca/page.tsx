"use client";

import { Header } from "@/components/Header";
import { VideoLibrary } from "@/components/VideoLibrary";
import { PlayIcon } from "@/components/icons";

export default function VideotecaPage() {
  return (
    <>
      <Header backHref="/app" />
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <PlayIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Videoteca</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Vídeos para ver juntos o guardar para más tarde.</p>
          <div className="mt-5">
            <VideoLibrary />
          </div>
        </div>
      </main>
    </>
  );
}
