"use client";

import { useState, useEffect } from "react";
import { useAuth, isAthlete } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Props {
  toAthleteId: string;
  /** "card" = compact overlay on grid card; "profile" = pill button in hero */
  variant?: "card" | "profile";
}

export default function FireButton({ toAthleteId, variant = "profile" }: Props) {
  const { user } = useAuth();
  const athlete = isAthlete(user) ? user : null;
  const isSelf = athlete?.id === toAthleteId;

  const [fired, setFired] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    // Total fire count for this athlete
    supabase
      .from("fires")
      .select("*", { count: "exact", head: true })
      .eq("to_athlete_id", toAthleteId)
      .then(({ count: c }) => setCount(c ?? 0));

    // Whether the current athlete has fired this profile
    if (!athlete || isSelf) return;
    supabase
      .from("fires")
      .select("id")
      .eq("from_athlete_id", athlete.id)
      .eq("to_athlete_id", toAthleteId)
      .maybeSingle()
      .then(({ data }) => setFired(!!data));
  }, [athlete, toAthleteId, isSelf]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!athlete || isSelf || !supabase || loading) return;
    setLoading(true);
    if (fired) {
      await supabase
        .from("fires")
        .delete()
        .eq("from_athlete_id", athlete.id)
        .eq("to_athlete_id", toAthleteId);
      setFired(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from("fires")
        .upsert(
          { from_athlete_id: athlete.id, to_athlete_id: toAthleteId },
          { onConflict: "from_athlete_id,to_athlete_id" }
        );
      setFired(true);
      setCount((c) => c + 1);
    }
    setLoading(false);
  }

  const canInteract = !!athlete && !isSelf;

  // ── Card variant ─────────────────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <button
        onClick={canInteract ? toggle : undefined}
        disabled={loading}
        title={isSelf ? "Your profile" : fired ? "Remove fire" : "Fire this rider!"}
        className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-200 disabled:opacity-60 ${
          fired
            ? "bg-orange-500/90 text-white shadow-md"
            : canInteract
            ? "bg-black/30 text-white/70 hover:bg-orange-500/80 hover:text-white"
            : "bg-black/20 text-white/40 cursor-default"
        }`}
      >
        <span className="text-sm leading-none">🔥</span>
        {count > 0 && (
          <span className="text-[10px] font-bold leading-none">{count}</span>
        )}
      </button>
    );
  }

  // ── Profile variant ──────────────────────────────────────────────────────────
  return (
    <button
      onClick={canInteract ? toggle : undefined}
      disabled={loading || !canInteract}
      title={isSelf ? `${count} fires from other athletes` : fired ? "Remove fire" : "Fire this rider!"}
      className={`border text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 disabled:opacity-50 ${
        fired
          ? "border-orange-400/60 bg-orange-500/15 text-orange-300"
          : canInteract
          ? "border-white/20 hover:border-orange-400/50 text-white/80 hover:text-orange-300"
          : "border-white/10 text-white/40 cursor-default"
      }`}
    >
      <span className="text-base leading-none">🔥</span>
      {isSelf
        ? `${count} ${count === 1 ? "fire" : "fires"}`
        : fired
        ? `Fired${count > 1 ? ` · ${count}` : ""}`
        : `Fire${count > 0 ? ` · ${count}` : ""}`}
    </button>
  );
}
