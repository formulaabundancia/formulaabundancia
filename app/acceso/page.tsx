"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-context";
import { PROFILE_DISPLAY_NAMES, ProfileName } from "@/lib/types";

const NAMES: ProfileName[] = ["jose", "viviana", "dylan"];

export default function AuthPage() {
  const { profileId, loading, needsNameSetup, takenNames, chooseName, signIn, signUp } = useProfile();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profileId) router.replace("/app");
  }, [loading, profileId, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  const pickName = async (name: ProfileName) => {
    setNameError(null);
    const result = await chooseName(name);
    if (result.error) setNameError(result.error);
  };

  if (loading) return null;

  if (needsNameSetup) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            ¿Quién eres?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Elige tu nombre para terminar.</p>
          {nameError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {nameError}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            {NAMES.map((name) => {
              const taken = takenNames.includes(name);
              return (
                <button
                  key={name}
                  disabled={taken}
                  onClick={() => pickName(name)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-lg font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  {PROFILE_DISPLAY_NAMES[name]}
                  {taken ? " (ya registrado)" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Fórmula Abundancia
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Salud · Dinero · Amor</p>
        </div>

        <div className="mt-8 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signin"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            minLength={6}
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {submitting ? "..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
