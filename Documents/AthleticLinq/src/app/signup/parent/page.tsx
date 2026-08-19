"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ParentSignup() {
  const { registerParent } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    athleteEmail: "",  // their child's AthleticLinq email
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedAthleteId, setLinkedAthleteId] = useState<string | undefined>();
  const [linkedAthleteName, setLinkedAthleteName] = useState<string | undefined>();

  const update = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  // Step 1: validate personal details and look up athlete
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Look up the linked athlete by email (optional step)
    if (form.athleteEmail) {
      setLoading(true);
      if (supabase) {
        const { data } = await supabase
          .from("athletes")
          .select("id, profile")
          .eq("email", form.athleteEmail.toLowerCase())
          .single();
        if (data) {
          setLinkedAthleteId(data.id);
          setLinkedAthleteName(`${data.profile.firstName} ${data.profile.lastName}`);
        } else {
          setError("No athlete account found with that email. Ask your child to sign up first, or skip this step.");
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    }

    setStep(2);
  }

  // Step 2: final submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerParent({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        linkedAthleteId,
        linkedAthleteEmail: form.athleteEmail || undefined,
      });
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const inp =
    "w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
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
          <h1 className="font-display text-3xl text-navy mb-2">
            {step === 1 ? "Create a Guardian Account" : "Review & Confirm"}
          </h1>
          <p className="text-earth text-sm">
            {step === 1
              ? "Stay in control of your child's scouting journey."
              : "Check the details below, then create your account."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s < step
                    ? "bg-olive text-white"
                    : s === step
                    ? "bg-navy text-white"
                    : "bg-stone/30 text-earth"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? "bg-olive" : "bg-stone/30"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
          {/* What is this banner */}
          <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-navy text-xs font-semibold mb-1">Guardian Account</p>
                <p className="text-earth/70 text-xs leading-relaxed">
                  All scout invitations sent to your child route through you first. You approve or decline every approach. Your child&apos;s contact details are never shared without your consent.
                </p>
              </div>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">First Name</label>
                  <input className={inp} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Last Name</label>
                  <input className={inp} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Your Email</label>
                <input type="email" className={inp} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="parent@example.com" required />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Password</label>
                <input type="password" className={inp} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" minLength={8} required />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Confirm Password</label>
                <input type="password" className={inp} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">
                  Child&apos;s AthleticLinq Email{" "}
                  <span className="normal-case text-earth/40 font-normal">(optional — link to existing account)</span>
                </label>
                <input
                  type="email"
                  className={inp}
                  value={form.athleteEmail}
                  onChange={(e) => update("athleteEmail", e.target.value)}
                  placeholder="child@example.com"
                />
                <p className="text-earth/40 text-xs mt-1">Leave blank if your child hasn&apos;t signed up yet</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy hover:bg-navy/90 text-white font-medium py-2.5 rounded-full transition-colors text-sm mt-2 disabled:opacity-60"
              >
                {loading ? "Checking…" : "Continue →"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-stone/10">
                  <span className="text-earth">Name</span>
                  <span className="text-navy font-medium">{form.firstName} {form.lastName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone/10">
                  <span className="text-earth">Email</span>
                  <span className="text-navy font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone/10">
                  <span className="text-earth">Linked athlete</span>
                  <span className="text-navy font-medium">
                    {linkedAthleteName ?? (form.athleteEmail ? "Not found" : "None linked yet")}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-earth">Account type</span>
                  <span className="text-navy font-medium">Parent / Guardian</span>
                </div>
              </div>

              {!linkedAthleteName && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
                  No athlete linked yet. You can link to your child&apos;s account later from your dashboard.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-stone/40 text-earth text-sm font-medium py-2.5 rounded-full hover:border-stone/70 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-navy hover:bg-navy/90 text-white text-sm font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create Account"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-earth text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-coral hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
