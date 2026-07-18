"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "./supabase";
import { Profile, ProfileId, ProfileName } from "./types";
import { seedPersonalContent } from "./storage";
import { JOSE_SEED_CONTENT } from "./personal-content-seed";

const CHILD_BLOCKED_PREFIXES = [
  "/app/salud",
  "/app/dinero",
  "/app/amor",
  "/app/estadisticas",
  "/app/libreria",
  "/app/entreno",
];

interface ProfileContextValue {
  profileId: ProfileId | null;
  profile: Profile | null;
  allProfiles: Profile[];
  adultProfiles: Profile[];
  loading: boolean;
  needsNameSetup: boolean;
  takenNames: ProfileName[];
  chooseName: (name: ProfileName) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined); // undefined = aún no se sabe
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfiles = useCallback(async () => {
    const { data, error } = await supabase.from("profiles").select("id, name, role");
    if (error) console.error("No se pudo leer 'profiles' — ¿ejecutaste supabase/schema.sql?", error.message);
    setAllProfiles((data as Profile[]) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      setAllProfiles([]);
      setLoading(false);
      if (pathname !== "/acceso") router.replace("/acceso");
      return;
    }
    refreshProfiles().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const profile = allProfiles.find((p) => p.id === userId) ?? null;
  const needsNameSetup = userId != null && !loading && !profile;
  const takenNames = allProfiles.map((p) => p.name);
  const adultProfiles = allProfiles.filter((p) => p.role === "adult");

  // Guard de rol: Dylan no puede navegar a secciones de pareja/finanzas.
  useEffect(() => {
    if (!profile) return;
    if (profile.role === "child" && CHILD_BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))) {
      router.replace("/app/dylan");
    }
  }, [profile, pathname, router]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const chooseName = async (name: ProfileName) => {
    if (!userId) return { error: "No hay sesión activa." };
    const role = name === "dylan" ? "child" : "adult";
    const { error } = await supabase.from("profiles").insert({ id: userId, name, role });
    if (error) return { error: error.message };
    if (name === "jose") await seedPersonalContent(userId, JOSE_SEED_CONTENT);
    await refreshProfiles();
    router.push("/app");
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/acceso");
  };

  return (
    <ProfileContext.Provider
      value={{
        profileId: profile?.id ?? null,
        profile,
        allProfiles,
        adultProfiles,
        loading,
        needsNameSetup,
        takenNames,
        chooseName,
        signUp,
        signIn,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile debe usarse dentro de ProfileProvider");
  return ctx;
}
