"use client";

import { useState, useEffect } from "react";
import { useAuth, isScout } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Props {
  athleteId: string;
  athleteFirstName: string;
  athleteLastName: string;
  /** "card" = small star overlay on grid card, "action" = pill button in action row */
  variant?: "card" | "action";
}

export default function FavouriteButton({
  athleteId,
  athleteFirstName,
  athleteLastName,
  variant = "action",
}: Props) {
  const { user } = useAuth();
  const scout = isScout(user) ? user : null;
  const [favourited, setFavourited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scout || !supabase) return;
    supabase
      .from("favourites")
      .select("id")
      .eq("scout_id", scout.id)
      .eq("athlete_id", athleteId)
      .maybeSingle()
      .then(({ data }) => setFavourited(!!data));
  }, [scout, athleteId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!scout || !supabase || loading) return;
    setLoading(true);
    if (favourited) {
      await supabase
        .from("favourites")
        .delete()
        .eq("scout_id", scout.id)
        .eq("athlete_id", athleteId);
      setFavourited(false);
    } else {
      await supabase
        .from("favourites")
        .upsert(
          { scout_id: scout.id, athlete_id: athleteId },
          { onConflict: "scout_id,athlete_id" }
        );
      await supabase.from("notifications").insert({
        athlete_id: athleteId,
        type: "favourite",
        scout_name: `${scout.firstName} ${scout.lastName}`,
        scout_org: scout.organization || "",
        scout_id: scout.id,
      });
      setFavourited(true);
    }
    setLoading(false);
  }

  if (!scout) return null;

  const starPath =
    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";

  if (variant === "card") {
    return (
      <button
        onClick={toggle}
        title={favourited ? "Remove from favourites" : "Favourite this athlete"}
        disabled={loading}
        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 disabled:opacity-60 ${
          favourited
            ? "bg-amber-400/90 text-white shadow-md"
            : "bg-black/30 text-white/60 hover:bg-black/50 hover:text-amber-300"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill={favourited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={favourited ? 0 : 1.8}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={starPath} />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favourited ? "Remove from favourites" : "Favourite this athlete"}
      className={`border text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 disabled:opacity-60 ${
        favourited
          ? "border-amber-400/60 bg-amber-400/15 text-amber-300 cursor-default"
          : "border-white/20 hover:border-amber-400/50 text-white/80 hover:text-amber-300"
      }`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill={favourited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favourited ? 0 : 1.8}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={starPath} />
      </svg>
      {favourited ? "Favourited" : "Favourite"}
    </button>
  );
}
