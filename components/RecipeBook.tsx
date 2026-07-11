"use client";

import { useEffect, useState } from "react";
import { addRecipe, deleteRecipe, getRecipes, toggleRecipeFavorita } from "@/lib/storage";
import { DEFAULT_RECIPES } from "@/lib/recipes-seed";
import { Recipe, Visibility } from "@/lib/types";
import { useProfile } from "@/lib/profile-context";
import { VisibilityToggle } from "@/components/VisibilityToggle";

function RecipeCard({ recipe, onChange }: { recipe: Recipe; onChange: () => void }) {
  const { profileId } = useProfile();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="flex items-center gap-2">
          <span className="text-zinc-800 dark:text-zinc-100">{recipe.nombre}</span>
          {recipe.visibility === "private" && <span className="text-xs">🔒</span>}
        </span>
        <span className="flex items-center gap-2">
          <span
            role="button"
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
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{recipe.instrucciones}</p>
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
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("shared");

  const refresh = () => getRecipes().then(setRecipes);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recipes !== null && recipes.length === 0 && profileId) {
      (async () => {
        for (const r of DEFAULT_RECIPES) {
          await addRecipe(r.nombre, r.ingredientes, r.instrucciones, profileId, "shared");
        }
        refresh();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes, profileId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !profileId) return;
    await addRecipe(nombre.trim(), ingredientes.trim(), instrucciones.trim(), profileId, visibility);
    setNombre("");
    setIngredientes("");
    setInstrucciones("");
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
        className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-700"
      >
        {showForm ? "Cancelar" : "+ Añadir receta"}
      </button>

      {showForm && (
        <form
          onSubmit={submit}
          className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del plato"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <textarea
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
            placeholder="Ingredientes"
            rows={2}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            placeholder="Preparación"
            rows={3}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="flex items-center justify-between gap-2">
            <VisibilityToggle value={visibility} onChange={setVisibility} />
            <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
              Guardar
            </button>
          </div>
        </form>
      )}

      {favoritas.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Favoritas</h3>
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
    </div>
  );
}
