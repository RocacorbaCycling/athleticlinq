"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Athlete ──────────────────────────────────────────────────────────────────
export interface AthleteProfile {
  id: string;
  createdAt: string;
  type?: "athlete";
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  nationality: string;
  flag: string;
  location: string;
  sex?: string; // "male" | "female" | "prefer not to say"
  // Cycling
  discipline: string;
  category: string;
  team: string;
  experienceYears: string;
  bio: string;
  // Performance
  weight: string;
  ftp: string;
  fiveMinPower: string;
  twentyMinPower: string;
  maxPower: string;
  vo2max: string;
  // Computed
  compoundScore: number;
  ftpPerKg: string;
  // Connections — Strava basic
  stravaUrl: string;
  stravaConnected: boolean;
  stravaWeeklyHours?: number;
  stravaWeeklyTSS?: number;
  stravaRecentDistance?: number;
  stravaPowerVerified?: boolean;
  // Strava OAuth tokens
  stravaAthleteId?: number;
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  stravaTokenExpiresAt?: number;
  stravaLastSynced?: string;
  // Strava enhanced metrics
  stravaFTPEstimate?: number;
  stravaBestMaxPower?: number;
  stravaWeeklyElevation?: number;
  stravaYTDDistance?: number;
  stravaYTDElevation?: number;
  stravaYTDHours?: number;
  stravaTotalSufferScore?: number;
  instagramUrl?: string;
  // Profile
  profileImage?: string;
  videoUrl: string;
  videoThumbnail?: string;
  verified: boolean;
}

// ── Scout ────────────────────────────────────────────────────────────────────
export interface ScoutProfile {
  id: string;
  createdAt: string;
  type: "scout";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  organization: string;
  orgType: string;
  country: string;
  website?: string;
  disciplines: string[];
  categories: string[];
  regions: string[];
  minCompoundScore?: string;
  minFtpPerKg?: string;
  phone?: string;
  linkedIn?: string;
  verified: boolean;
}

// ── Parent / Guardian ────────────────────────────────────────────────────────
export interface ParentProfile {
  id: string;
  createdAt: string;
  type: "parent";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  linkedAthleteId?: string;   // athlete this parent manages
  linkedAthleteEmail?: string;
  verified: boolean;
}

export type ActiveUser = AthleteProfile | ScoutProfile | ParentProfile;

export function isScout(u: ActiveUser | null): u is ScoutProfile {
  return u?.type === "scout";
}
export function isParent(u: ActiveUser | null): u is ParentProfile {
  return u?.type === "parent";
}
export function isAthlete(u: ActiveUser | null): u is AthleteProfile {
  return !!u && u.type !== "scout" && u.type !== "parent";
}

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextType {
  user: ActiveUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean; error?: string;
    userType?: "athlete" | "scout" | "parent"; verified?: boolean;
  }>;
  logout: () => void;
  register: (profile: Omit<AthleteProfile, "id" | "createdAt" | "verified">) => Promise<void>;
  registerScout: (profile: Omit<ScoutProfile, "id" | "createdAt" | "verified" | "type">) => Promise<void>;
  registerParent: (profile: Omit<ParentProfile, "id" | "createdAt" | "verified" | "type">) => Promise<void>;
  updateProfile: (data: Partial<AthleteProfile>) => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const USERS_KEY   = "athleticlinq_users";
export const SCOUTS_KEY  = "athleticlinq_scouts";
const SESSION_KEY = "athleticlinq_session";

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage, then verify against DB
  useEffect(() => {
    async function restore() {
      try {
        const cached = localStorage.getItem(SESSION_KEY);
        if (!cached) { setIsLoading(false); return; }
        const parsed: ActiveUser = JSON.parse(cached);

        if (supabase) {
          // Re-fetch from DB so admin verify changes are reflected immediately
          const table =
            parsed.type === "scout" ? "scouts" :
            parsed.type === "parent" ? "parents" :
            "athletes";
          const { data } = await supabase
            .from(table)
            .select("profile, verified")
            .eq("id", parsed.id)
            .single();
          if (data) {
            const fresh = { ...data.profile, verified: data.verified } as ActiveUser;
            setUser(fresh);
            localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
          } else {
            setUser(parsed); // DB not available or row deleted
          }
        } else {
          // No Supabase — use cached session as-is
          setUser(parsed);
        }
      } catch {
        // Corrupt session — clear it
        localStorage.removeItem(SESSION_KEY);
      }
      setIsLoading(false);
    }
    restore();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const lowerEmail = email.toLowerCase();

    if (supabase) {
      // Check athletes
      const { data: athRow } = await supabase
        .from("athletes")
        .select("profile, verified")
        .eq("email", lowerEmail)
        .single();
      if (athRow && athRow.profile.password === password) {
        const u: AthleteProfile = { ...athRow.profile, type: "athlete", verified: athRow.verified };
        setUser(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        return { success: true, userType: "athlete" as const, verified: u.verified };
      }

      // Check scouts
      const { data: scoutRow } = await supabase
        .from("scouts")
        .select("profile, verified")
        .eq("email", lowerEmail)
        .single();
      if (scoutRow && scoutRow.profile.password === password) {
        const u: ScoutProfile = { ...scoutRow.profile, verified: scoutRow.verified };
        setUser(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        return { success: true, userType: "scout" as const, verified: u.verified };
      }
    } else {
      // localStorage fallback
      const users: AthleteProfile[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const found = users.find(u => u.email.toLowerCase() === lowerEmail && u.password === password);
      if (found) {
        const u = { ...found, type: "athlete" as const };
        setUser(u); localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        return { success: true, userType: "athlete" as const, verified: u.verified };
      }
      const scouts: ScoutProfile[] = JSON.parse(localStorage.getItem(SCOUTS_KEY) || "[]");
      const fs = scouts.find(s => s.email.toLowerCase() === lowerEmail && s.password === password);
      if (fs) {
        setUser(fs); localStorage.setItem(SESSION_KEY, JSON.stringify(fs));
        return { success: true, userType: "scout" as const, verified: fs.verified };
      }
    }

      // Check parents
      if (supabase) {
        const { data: parentRow } = await supabase
          .from("parents")
          .select("profile, verified")
          .eq("email", lowerEmail)
          .single();
        if (parentRow && parentRow.profile.password === password) {
          const u: ParentProfile = { ...parentRow.profile, verified: parentRow.verified };
          setUser(u);
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
          return { success: true, userType: "parent" as const, verified: u.verified };
        }
      } else {
        const parents: ParentProfile[] = JSON.parse(localStorage.getItem("athleticlinq_parents") || "[]");
        const fp = parents.find((p) => p.email.toLowerCase() === lowerEmail && p.password === password);
        if (fp) {
          setUser(fp);
          localStorage.setItem(SESSION_KEY, JSON.stringify(fp));
          return { success: true, userType: "parent" as const, verified: fp.verified };
        }
      }

    return { success: false, error: "Invalid email or password. Please check your details and try again." };
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // ── register athlete ───────────────────────────────────────────────────────
  const register = useCallback(async (
    profile: Omit<AthleteProfile, "id" | "createdAt" | "verified">
  ) => {
    const newUser: AthleteProfile = {
      ...profile,
      type: "athlete",
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      verified: false,
    };

    if (supabase) {
      await supabase.from("athletes").insert({
        id: newUser.id,
        email: newUser.email.toLowerCase(),
        profile: newUser,
        verified: false,
      });
    }

    // Always mirror to localStorage for session + offline fallback
    try {
      const users: AthleteProfile[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}

    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  }, []);

  // ── register scout ─────────────────────────────────────────────────────────
  const registerScout = useCallback(async (
    profile: Omit<ScoutProfile, "id" | "createdAt" | "verified" | "type">
  ) => {
    const newScout: ScoutProfile = {
      ...profile,
      type: "scout",
      id: `scout_${Date.now()}`,
      createdAt: new Date().toISOString(),
      verified: false,
    };

    if (supabase) {
      await supabase.from("scouts").insert({
        id: newScout.id,
        email: newScout.email.toLowerCase(),
        profile: newScout,
        verified: false,
      });
    }

    try {
      const scouts: ScoutProfile[] = JSON.parse(localStorage.getItem(SCOUTS_KEY) || "[]");
      scouts.push(newScout);
      localStorage.setItem(SCOUTS_KEY, JSON.stringify(scouts));
    } catch {}

    setUser(newScout);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newScout));
  }, []);

  // ── register parent ───────────────────────────────────────────────────────
  const registerParent = useCallback(async (
    profile: Omit<ParentProfile, "id" | "createdAt" | "verified" | "type">
  ) => {
    const newParent: ParentProfile = {
      ...profile,
      type: "parent",
      id: `parent_${Date.now()}`,
      createdAt: new Date().toISOString(),
      verified: false,
    };

    if (supabase) {
      await supabase.from("parents").insert({
        id: newParent.id,
        email: newParent.email.toLowerCase(),
        profile: newParent,
        linked_athlete_id: newParent.linkedAthleteId ?? null,
        verified: false,
      });
      // If linked to an athlete, update that athlete's record
      if (newParent.linkedAthleteId) {
        await supabase
          .from("athletes")
          .update({ parent_id: newParent.id })
          .eq("id", newParent.linkedAthleteId);
      }
    }

    try {
      const parents: ParentProfile[] = JSON.parse(localStorage.getItem("athleticlinq_parents") || "[]");
      parents.push(newParent);
      localStorage.setItem("athleticlinq_parents", JSON.stringify(parents));
    } catch {}

    setUser(newParent);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newParent));
  }, []);

  // ── updateProfile ──────────────────────────────────────────────────────────
  const updateProfile = useCallback((data: Partial<AthleteProfile>) => {
    setUser((prev) => {
      if (!prev || prev.type === "scout" || prev.type === "parent") return prev;
      const updated: AthleteProfile = { ...prev, ...data };

      // Sync to Supabase (fire-and-forget)
      if (supabase) {
        supabase.from("athletes")
          .update({ profile: updated })
          .eq("id", prev.id)
          .then(() => {});
      }

      // Update localStorage
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        const users: AthleteProfile[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        const idx = users.findIndex(u => u.id === prev.id);
        if (idx > -1) { users[idx] = updated; localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
      } catch (err) {
        console.error("updateProfile localStorage failed:", err);
      }

      return updated;
    });
  }, []);

  // ── deleteAccount ──────────────────────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!user) return;
    const table = user.type === "scout" ? "scouts" : "athletes";
    const localKey = user.type === "scout" ? SCOUTS_KEY : USERS_KEY;

    // Delete from Supabase
    if (supabase) {
      await supabase.from(table).delete().eq("id", user.id);
    }

    // Remove from localStorage list
    try {
      const items: ActiveUser[] = JSON.parse(localStorage.getItem(localKey) || "[]");
      localStorage.setItem(localKey, JSON.stringify(items.filter((u) => u.id !== user.id)));
    } catch {}

    // Clear session
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, registerScout, registerParent, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
