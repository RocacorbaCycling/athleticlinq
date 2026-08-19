"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  athleteId: string;
  athleteFirstName: string;
  athleteLastName: string;
  scoutId: string;
  scoutName: string;
  scoutOrg: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  "Climber — Grand Tour squad",
  "Climber — stage races",
  "Time trial specialist",
  "Sprinter — road racing",
  "All-rounder / GC candidate",
  "Classics / puncheur specialist",
  "Track cyclist",
  "MTB / gravel rider",
  "Development / U23 programme",
  "Other / general interest",
];

export default function ShortlistModal({
  athleteId,
  athleteFirstName,
  athleteLastName,
  scoutId,
  scoutName,
  scoutOrg,
  onClose,
  onSuccess,
}: Props) {
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleOverlay(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError("Please select a role type."); return; }
    if (!message.trim()) { setError("Please write a short message."); return; }
    setLoading(true);
    setError("");

    const entry = {
      scout_id: scoutId,
      athlete_id: athleteId,
      athlete_name: `${athleteFirstName} ${athleteLastName}`,
      scout_name: scoutName,
      scout_organization: scoutOrg,
      role_type: role,
      message: message.trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // localStorage fallback
    try {
      const key = `shortlist_${scoutId}`;
      const list: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      if (!list.includes(athleteId)) list.push(athleteId);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    if (supabase) {
      const { error: dbErr } = await supabase
        .from("shortlists")
        .upsert(entry, { onConflict: "scout_id,athlete_id" });
      if (dbErr) {
        console.warn("Shortlist DB error:", dbErr.message);
      }
    }

    setLoading(false);
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlay}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone/20">
          <div>
            <h3 className="font-display text-lg text-navy-deep">Send Shortlist Invitation</h3>
            <p className="text-earth text-xs mt-0.5">
              to {athleteFirstName} {athleteLastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone/20 flex items-center justify-center text-earth transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-2">
              Role / Opportunity
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-navy-deep focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white"
            >
              <option value="">Select the role you have in mind…</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-2">
              Personal Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder={`Hi ${athleteFirstName}, we've been following your performances and…`}
              className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-navy-deep focus:outline-none focus:ring-2 focus:ring-coral/30 resize-none bg-white"
            />
            <p className="text-earth/40 text-xs mt-1 text-right">{message.length}/500</p>
          </div>

          {/* Sending as */}
          <div className="bg-stone/10 rounded-xl p-3 text-xs text-earth">
            Sending as <strong className="text-navy-deep">{scoutName}</strong>
            {scoutOrg ? ` · ${scoutOrg}` : ""}
          </div>

          {error && (
            <p className="text-coral text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone/40 text-earth text-sm font-medium py-2.5 rounded-full hover:border-stone/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-coral hover:bg-coral/90 text-white text-sm font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
