"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { USERS_KEY, SCOUTS_KEY } from "@/context/AuthContext";

type Step = "email" | "reset" | "done";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<"athlete" | "scout" | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Step 1: verify the email exists ────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const lowerEmail = email.toLowerCase().trim();

    try {
      if (supabase) {
        // Check athletes table
        const { data: athRow } = await supabase
          .from("athletes")
          .select("id")
          .eq("email", lowerEmail)
          .single();

        if (athRow) {
          setAccountType("athlete");
          setStep("reset");
          setLoading(false);
          return;
        }

        // Check scouts table
        const { data: scoutRow } = await supabase
          .from("scouts")
          .select("id")
          .eq("email", lowerEmail)
          .single();

        if (scoutRow) {
          setAccountType("scout");
          setStep("reset");
          setLoading(false);
          return;
        }
      } else {
        // localStorage fallback
        const athletes = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        if (athletes.find((a: { email: string }) => a.email.toLowerCase() === lowerEmail)) {
          setAccountType("athlete");
          setStep("reset");
          setLoading(false);
          return;
        }
        const scouts = JSON.parse(localStorage.getItem(SCOUTS_KEY) || "[]");
        if (scouts.find((s: { email: string }) => s.email.toLowerCase() === lowerEmail)) {
          setAccountType("scout");
          setStep("reset");
          setLoading(false);
          return;
        }
      }

      // Email not found — show a neutral message to avoid exposing account existence
      setError("If that email is registered, you can now reset your password. Please check and try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  // ── Step 2: update the password ─────────────────────────────────────────────
  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const lowerEmail = email.toLowerCase().trim();

    try {
      if (supabase && accountType) {
        const table = accountType === "scout" ? "scouts" : "athletes";

        // Fetch current profile JSON so we can update just the password field
        const { data, error: fetchErr } = await supabase
          .from(table)
          .select("profile")
          .eq("email", lowerEmail)
          .single();

        if (fetchErr || !data) throw new Error("Could not fetch account.");

        const updatedProfile = { ...data.profile, password };

        const { error: updateErr } = await supabase
          .from(table)
          .update({ profile: updatedProfile })
          .eq("email", lowerEmail);

        if (updateErr) throw updateErr;
      }

      // Also update localStorage if present
      try {
        const key = accountType === "scout" ? SCOUTS_KEY : USERS_KEY;
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        const idx = stored.findIndex(
          (u: { email: string }) => u.email.toLowerCase() === lowerEmail
        );
        if (idx > -1) {
          stored[idx] = { ...stored[idx], password };
          localStorage.setItem(key, JSON.stringify(stored));
        }
      } catch { /* ignore */ }

      setStep("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#c83c5a" strokeWidth="2.5" strokeDasharray="56 14" strokeLinecap="round" />
              <path d="M13 28 L20 10 L27 28" stroke="#1a2744" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.5 22.5 H24.5" stroke="#c83c5a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="29" cy="28" r="2.5" fill="#c83c5a" />
            </svg>
            <span className="font-display text-2xl text-navy tracking-tight">
              Athletic<span className="text-coral">Linq</span>
            </span>
          </Link>

          {step === "email" && (
            <>
              <h1 className="font-display text-3xl text-navy mb-2">Reset your password</h1>
              <p className="text-earth text-sm">Enter the email address on your account and we&apos;ll let you set a new password.</p>
            </>
          )}
          {step === "reset" && (
            <>
              <h1 className="font-display text-3xl text-navy mb-2">Choose a new password</h1>
              <p className="text-earth text-sm">Pick something secure — at least 8 characters.</p>
            </>
          )}
          {step === "done" && (
            <>
              <h1 className="font-display text-3xl text-navy mb-2">Password updated!</h1>
              <p className="text-earth text-sm">You can now log in with your new password.</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coral hover:bg-coral-light text-white font-medium py-2.5 rounded-full transition-colors text-sm mt-2 disabled:opacity-60"
              >
                {loading ? "Checking…" : "Continue"}
              </button>
            </form>
          )}

          {/* ── Step 2: New password ── */}
          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Email display (read-only) */}
              <div className="flex items-center gap-2 bg-stone/10 rounded-xl px-4 py-2.5 text-sm text-earth">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{email}</span>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); }}
                  className="ml-auto text-xs text-coral hover:underline shrink-0"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="At least 8 characters"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth/50 hover:text-earth transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">
                  Confirm new password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="Re-enter your new password"
                  minLength={8}
                />
              </div>

              {/* Strength hint */}
              {password.length > 0 && (
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1;
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength
                            ? strength <= 1 ? "bg-coral" : strength <= 2 ? "bg-amber-400" : strength <= 3 ? "bg-olive/70" : "bg-olive"
                            : "bg-stone/30"
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coral hover:bg-coral-light text-white font-medium py-2.5 rounded-full transition-colors text-sm mt-2 disabled:opacity-60"
              >
                {loading ? "Saving…" : "Set new password"}
              </button>
            </form>
          )}

          {/* ── Step 3: Done ── */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-olive/10 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-earth text-sm leading-relaxed">
                Your password has been updated. Log in with your new password to continue.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-coral hover:bg-coral-light text-white font-medium py-2.5 rounded-full transition-colors text-sm"
              >
                Go to Log In
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="text-earth text-sm hover:text-coral transition-colors">
            ← Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
