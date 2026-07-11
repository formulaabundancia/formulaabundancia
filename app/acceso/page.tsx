"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-context";
import { PROFILE_DISPLAY_NAMES, ProfileName } from "@/lib/types";
import { AppLogo } from "@/components/AppLogo";

const NAMES: ProfileName[] = ["jose", "viviana", "dylan"];

function Logo() {
  return (
    <div className="flex flex-col items-center">
      <AppLogo size={64} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Fórmula Abundancia
      </h1>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        Cambia tu vida
      </p>
    </div>
  );
}

export default function AuthPage() {
  const { profileId, loading, needsNameSetup, takenNames, chooseName, signIn, signUp } = useProfile();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="animate-pulse">
          <AppLogo size={56} />
        </div>
      </main>
    );
  }

  if (needsNameSetup) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <Logo />
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">¿Quién eres? Elige tu nombre para terminar.</p>
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
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-lg font-medium text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
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
        <Logo />

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
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
