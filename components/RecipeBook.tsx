"use client";

import { useEffect, useRef, useState } from "react";
import {
  addRecipe,
  deleteRecipe,
  getRecipes,
  setRecipeStatus,
  toggleRecipeFavorita,
  toggleRecipeProbada,
} from "@/lib/storage";
import { DEFAULT_RECIPES, SUGGESTED_RECIPES } from "@/lib/recipes-seed";
import { Recipe } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { youtubeEmbedUrl } from "@/lib/youtube";

function RecipeCard({ recipe, onChange }: { recipe: Recipe; onChange: () => void }) {
  const { profileId } = useProfile();
  const [open, setOpen] = useState(false);
  const embedUrl = recipe.videoUrl ? youtubeEmbedUrl(recipe.videoUrl) : null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
      {recipe.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.imagenUrl} alt={recipe.nombre} className="h-36 w-full object-cover" />
      )}
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className={recipe.probada ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}>
          {recipe.nombre}
        </span>
        <span className="flex items-center gap-3">
          <span
            role="button"
            title="Probada"
            onClick={(e) => {
              e.stopPropagation();
              toggleRecipeProbada(recipe.id, recipe.probada).then(onChange);
            }}
            className={recipe.probada ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600"}
          >
            ✓
          </span>
          <span
            role="button"
            title="Favorita"
            onClick={(e) => {
              e.stopPropagation();
              toggleRecipeFavorita(recipe.id, recipe.favorita).then(onChange);
            }}
            className={recipe.favorita ? "text-amber-500" : "text-zinc-300 dark:text-zinc-600"}
          >
            ★
          </span>
          <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && (
        <div className="border-t border-zinc-100 px-4 py-3 text-sm dark:border-zinc-800">
          <p className="font-medium text-zinc-600 dark:text-zinc-300">Ingredientes</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{recipe.ingredientes}</p>
          <p className="mt-3 font-medium text-zinc-600 dark:text-zinc-300">Preparación</p>
          <p className="mt-1 whitespace-pre-line text-zinc-600 dark:text-zinc-400">{recipe.instrucciones}</p>
          {embedUrl && (
            <div className="mt-3 aspect-video overflow-hidden rounded-xl">
              <iframe
                src={embedUrl}
                title={`Vídeo de ${recipe.nombre}`}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}
          <p className="mt-3 text-xs text-zinc-400">{recipe.probada ? "✓ Ya la habéis probado" : "Aún sin probar"}</p>
          {recipe.ownerId === profileId && (
            <button
              onClick={() => deleteRecipe(recipe.id).then(onChange)}
              className="mt-3 text-xs text-zinc-400 hover:text-red-500"
            >
              Eliminar receta
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RecipeBook() {
  const { profileId } = useProfile();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [suggestions, setSuggestions] = useState<Recipe[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const seeded = useRef(false);

  const refresh = () => {
    getRecipes("active").then(setRecipes);
    getRecipes("suggested").then(setSuggestions);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Siembra la primera vez: recetas activas de ejemplo + sugerencias.
  // El guard `seeded` evita que esto se repita en bucle si el insert falla
  // (p. ej. porque la tabla de Supabase todavía no está lista) — sin él,
  // cada refresh() que sigue devolviendo [] volvería a disparar el efecto.
  useEffect(() => {
    if (seeded.current) return;
    if (recipes !== null && suggestions !== null && recipes.length === 0 && suggestions.length === 0 && profileId) {
      seeded.current = true;
      (async () => {
        try {
          for (const r of DEFAULT_RECIPES) {
            await addRecipe(r.nombre, r.ingredientes, r.instrucciones, profileId, "shared", "active", r.favorita);
          }
          for (const r of SUGGESTED_RECIPES) {
            await addRecipe(r.nombre, r.ingredientes, r.instrucciones, profileId, "shared", "suggested");
          }
          refresh();
        } catch (err) {
          console.error("No se pudieron sembrar las recetas — revisa que la tabla 'recipes' esté al día", err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes, suggestions, profileId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profileId) return;
    // Las recetas siempre son compartidas: Viviana tiene que ver todo lo que se añada.
    await addRecipe(
      nombre.trim(),
      ingredientes.trim(),
      instrucciones.trim(),
      profileId,
      "shared",
      "active",
      false,
      imagenUrl.trim() || undefined,
      videoUrl.trim() || undefined
    );
    setNombre("");
    setIngredientes("");
    setInstrucciones("");
    setImagenUrl("");
    setVideoUrl("");
    setShowForm(false);
    refresh();
  };

  if (!recipes) return null;

  const favoritas = recipes.filter((r) => r.favorita);
  const resto = recipes.filter((r) => !r.favorita);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setShowForm((s) => !s)}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {showForm ? "Cancelar" : "+ Añadir receta"}
      </button>

      {showForm && (
        <form
          onSubmit={submit}
          className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900"
        >
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del plato"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <textarea
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
            placeholder="Ingredientes"
            rows={2}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            placeholder="Preparación paso a paso"
            rows={3}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            placeholder="Enlace a una foto del plato (opcional)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enlace a un vídeo de YouTube (opcional)"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <p className="text-xs text-zinc-400">La receta la verá también Viviana — aquí no hay opción de privado.</p>
          <button
            type="submit"
            className="mt-1 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Guardar
          </button>
        </form>
      )}

      {favoritas.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">★ Favoritas</h3>
          <div className="flex flex-col gap-2">
            {favoritas.map((r) => (
              <RecipeCard key={r.id} recipe={r} onChange={refresh} />
            ))}
          </div>
        </div>
      )}

      {resto.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Todas</h3>
          <div className="flex flex-col gap-2">
            {resto.map((r) => (
              <RecipeCard key={r.id} recipe={r} onChange={refresh} />
            ))}
          </div>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Sugerencias — más comida murciana y española
          </h3>
          <div className="flex flex-col gap-2">
            {suggestions.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
              >
                <span className="text-sm text-zinc-700 dark:text-zinc-200">{r.nombre}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecipeStatus(r.id, "active").then(refresh)}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                  >
                    Añadir
                  </button>
                  <button
                    onClick={() => setRecipeStatus(r.id, "declined").then(refresh)}
                    className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
