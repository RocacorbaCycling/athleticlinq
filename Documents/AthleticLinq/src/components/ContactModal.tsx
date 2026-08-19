"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  athleteId: string;
  athleteFirstName: string;
  scoutId: string;
  scoutName: string;
  scoutOrg: string;
  onClose: () => void;
}

export default function ContactModal({
  athleteId,
  athleteFirstName,
  scoutId,
  scoutName,
  scoutOrg,
  onClose,
}: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError("");

    if (!supabase) { setError("Could not send message. Please try again."); setSending(false); return; }

    const { error: insertErr } = await supabase.from("messages").insert({
      from_scout_id: scoutId,
      to_athlete_id: athleteId,
      scout_name: scoutName,
      scout_organization: scoutOrg,
      message: message.trim(),
    });

    setSending(false);
    if (insertErr) { setError("Failed to send — please try again."); return; }
    setSent(true);
  }

  // Trap focus and close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {sent ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-coral"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-navy mb-2">
              Message Sent!
            </h3>
            <p className="text-earth text-sm mb-6 max-w-xs mx-auto">
              Your message has been delivered to {athleteFirstName}. They&apos;ll
              receive it in their dashboard and can reply directly.
            </p>
            <button
              onClick={onClose}
              className="bg-coral hover:bg-coral-light text-white text-sm font-medium px-8 py-2.5 rounded-full transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Compose state ─────────────────────────────────────────── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-xl text-navy">
                  Contact {athleteFirstName}
                </h3>
                <p className="text-earth text-xs mt-0.5">
                  Your message will appear in their dashboard
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-stone/40 flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4 text-earth"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* From badge */}
            <div className="bg-cream-warm rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-navy"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-navy font-medium">{scoutName}</span>
                {scoutOrg && (
                  <span className="text-earth"> &middot; {scoutOrg}</span>
                )}
              </div>
            </div>

            {/* Message textarea */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Introduce yourself and let ${athleteFirstName} know why you're interested…`}
              rows={6}
              className="w-full border border-stone/40 rounded-xl px-4 py-3 text-sm text-warm-black placeholder-earth/50 focus:outline-none focus:border-coral/60 focus:ring-2 focus:ring-coral/10 resize-none mb-1"
            />
            <div className="flex justify-between items-center mb-4">
              <span className="text-earth/50 text-xs">
                {message.length} / 1000 characters
              </span>
              {error && <span className="text-coral text-xs">{error}</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="border border-stone/40 text-earth text-sm font-medium px-5 py-2.5 rounded-full hover:border-stone/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending || message.length > 1000}
                className="bg-coral hover:bg-coral-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
