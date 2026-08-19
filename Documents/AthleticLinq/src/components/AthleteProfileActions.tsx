"use client";

import { useState, useEffect } from "react";
import { useAuth, isScout } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import ContactModal from "./ContactModal";
import ShortlistModal from "./ShortlistModal";

interface Props {
  athleteId: string;
  athleteFirstName: string;
  athleteLastName: string;
  /** "hero" = the three-button row in the profile header (default)
   *  "sidebar" = single "Contact" button in the right-column CTA card */
  variant?: "hero" | "sidebar";
}

// ── Login-required prompt ────────────────────────────────────────────────────
function LoginPrompt({
  action,
  onClose,
}: {
  action: "contact" | "shortlist";
  onClose: () => void;
}) {
  function handleOverlay(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlay}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-14 h-14 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-navy"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="font-display text-xl text-navy mb-2">
          Sign in as a Scout
        </h3>
        <p className="text-earth text-sm mb-6">
          {action === "contact"
            ? "Log in to your scout account to contact athletes directly."
            : "Log in to your scout account to build and manage your shortlist."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-stone/40 text-earth text-sm font-medium px-4 py-2.5 rounded-full hover:border-stone/70 transition-colors"
          >
            Cancel
          </button>
          <a
            href="/login"
            className="flex-1 bg-coral text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-coral-light transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AthleteProfileActions({
  athleteId,
  athleteFirstName,
  athleteLastName,
  variant = "hero",
}: Props) {
  const { user } = useAuth();
  const scout = isScout(user) ? user : null;

  const [contactOpen, setContactOpen] = useState(false);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState<"contact" | "shortlist" | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [shared, setShared] = useState(false);
  const [shortlistSuccess, setShortlistSuccess] = useState(false);

  // Load shortlist state on mount / when scout changes
  useEffect(() => {
    if (!scout) { setShortlisted(false); return; }
    const key = `shortlist_${scout.id}`;
    try {
      const list: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      setShortlisted(list.includes(athleteId));
    } catch {
      setShortlisted(false);
    }
  }, [scout, athleteId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleContact() {
    if (!scout) { setLoginPrompt("contact"); return; }
    setContactOpen(true);
  }

  function handleShortlist() {
    if (!scout) { setLoginPrompt("shortlist"); return; }
    if (shortlisted) return; // already invited — show as sent
    setShortlistOpen(true);
  }

  function handleShortlistSuccess() {
    setShortlisted(true);
    setShortlistOpen(false);
    setShortlistSuccess(true);
    setTimeout(() => setShortlistSuccess(false), 3000);
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers / HTTP
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(el);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  }

  // ── Shared modal layer ───────────────────────────────────────────────────────
  const modals = (
    <>
      {loginPrompt && (
        <LoginPrompt
          action={loginPrompt}
          onClose={() => setLoginPrompt(null)}
        />
      )}
      {contactOpen && scout && (
        <ContactModal
          athleteId={athleteId}
          athleteFirstName={athleteFirstName}
          scoutId={scout.id}
          scoutName={`${scout.firstName} ${scout.lastName}`}
          scoutOrg={scout.organization || ""}
          onClose={() => setContactOpen(false)}
        />
      )}
      {shortlistOpen && scout && (
        <ShortlistModal
          athleteId={athleteId}
          athleteFirstName={athleteFirstName}
          athleteLastName={athleteLastName}
          scoutId={scout.id}
          scoutName={`${scout.firstName} ${scout.lastName}`}
          scoutOrg={scout.organization || ""}
          onClose={() => setShortlistOpen(false)}
          onSuccess={handleShortlistSuccess}
        />
      )}
    </>
  );

  // ── Sidebar variant (single button) ─────────────────────────────────────────
  if (variant === "sidebar") {
    return (
      <>
        {modals}
        <button
          onClick={handleContact}
          className="bg-coral hover:bg-coral-light text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors w-full"
        >
          Contact {athleteFirstName}
        </button>
      </>
    );
  }

  // ── Hero variant (three buttons) ────────────────────────────────────────────
  return (
    <>
      {modals}

      {/* Contact Athlete */}
      <button
        onClick={handleContact}
        className="bg-coral hover:bg-coral-light text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
      >
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Contact Athlete
      </button>

      {/* Shortlist Invitation */}
      <button
        onClick={handleShortlist}
        className={`border text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
          shortlisted
            ? "border-coral/50 bg-coral/15 text-coral cursor-default"
            : "border-white/20 hover:border-white/50 text-white"
        }`}
      >
        {shortlisted ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {shortlistSuccess ? "Invitation Sent!" : "Shortlisted"}
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Send Invitation
          </>
        )}
      </button>

      {/* Share Profile */}
      <button
        onClick={handleShare}
        className={`border text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
          shared
            ? "border-olive/50 bg-olive/15 text-olive"
            : "border-white/20 hover:border-white/50 text-white"
        }`}
      >
        {shared ? (
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
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Link Copied!
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Profile
          </>
        )}
      </button>
    </>
  );
}
