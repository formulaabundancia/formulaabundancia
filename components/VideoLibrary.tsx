"use client";

import { useEffect, useRef, useState } from "react";
import { addVideo, deleteVideo, getVideos } from "@/lib/storage";
import { DEFAULT_VIDEOS } from "@/lib/videos-seed";
import { Video } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { youtubeEmbedUrl } from "@/lib/youtube";

function VideoCard({ video, onChange }: { video: Video; onChange: () => void }) {
  const { profileId } = useProfile();
  const embedUrl = youtubeEmbedUrl(video.videoUrl);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
      {embedUrl ? (
        <div className="aspect-video">
          <iframe src={embedUrl} title={video.titulo} className="h-full w-full" allowFullScreen />
        </div>
      ) : (
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="block px-4 py-3 text-xs text-indigo-500 underline dark:text-indigo-400"
        >
          Ver enlace
        </a>
      )}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-200">{video.titulo}</p>
        {video.ownerId === profileId && (
          <button
            onClick={() => deleteVideo(video.id).then(onChange)}
            className="shrink-0 pl-3 text-xs text-zinc-400 hover:text-red-500"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

export function VideoLibrary() {
  const { profileId } = useProfile();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const seeded = useRef(false);

  const refresh = () => getVideos().then(setVideos);

  useEffect(() => {
    refresh();
  }, []);

  // Siembra la primera vez, igual que RecipeBook — el guard evita bucles si el
  // insert falla (p. ej. porque la tabla todavía no existe en Supabase).
  useEffect(() => {
    if (seeded.current) return;
    if (videos !== null && videos.length === 0 && profileId) {
      seeded.current = true;
      (async () => {
        try {
          for (const v of DEFAULT_VIDEOS) {
            await addVideo(v.titulo, v.videoUrl, profileId, "shared");
          }
          refresh();
        } catch (err) {
          console.error("No se pudieron sembrar los vídeos — revisa que la tabla 'videos' esté al día", err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, profileId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !videoUrl.trim() || !profileId) return;
    // Siempre compartido: Viviana ve todo lo que se añada.
    await addVideo(titulo.trim(), videoUrl.trim(), profileId, "shared");
    setTitulo("");
    setVideoUrl("");
    setShowForm(false);
    refresh();
  };

  if (!videos) return null;

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setShowForm((s) => !s)}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {showForm ? "Cancelar" : "+ Añadir vídeo"}
      </button>

      {showForm && (
        <form onSubmit={submit} className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del vídeo"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enlace de YouTube"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <p className="text-xs text-zinc-400">El vídeo lo verá también Viviana — aquí no hay opción de privado.</p>
          <button
            type="submit"
            className="mt-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onChange={refresh} />
        ))}
        {videos.length === 0 && <p className="text-sm text-zinc-400 dark:text-zinc-500">Aún no hay vídeos.</p>}
      </div>
    </div>
  );
}
