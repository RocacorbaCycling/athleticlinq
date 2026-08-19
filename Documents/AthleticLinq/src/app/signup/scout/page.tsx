"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { notifySignup } from "@/lib/notify";

export default function ScoutSignup() {
  const { registerScout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Organization
    role: "",
    organization: "",
    orgType: "",
    country: "",
    website: "",

    // Scouting Preferences
    disciplines: [] as string[],
    categories: [] as string[],
    regions: [] as string[],
    minCompoundScore: "",
    minFtpPerKg: "",

    // Contact
    phone: "",
    linkedIn: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: "disciplines" | "categories" | "regions", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerScout({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      organization: formData.organization,
      orgType: formData.orgType,
      country: formData.country,
      website: formData.website || undefined,
      disciplines: formData.disciplines,
      categories: formData.categories,
      regions: formData.regions,
      minCompoundScore: formData.minCompoundScore || undefined,
      minFtpPerKg: formData.minFtpPerKg || undefined,
      phone: formData.phone || undefined,
      linkedIn: formData.linkedIn || undefined,
    });

    // Notify admin of new scout signup (fire-and-forget — never blocks registration)
    notifySignup({
      type        : "scout",
      firstName   : formData.firstName,
      lastName    : formData.lastName,
      email       : formData.email,
      organization: formData.organization,
      role        : formData.role,
      country     : formData.country,
      orgType     : formData.orgType,
    });

    setSubmitted(true);
    // Redirect to dashboard after a short delay so the success screen is visible
    setTimeout(() => router.push("/dashboard"), 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-navy mb-3">Application Submitted</h1>
          <p className="text-earth mb-4">
            Thank you, {formData.firstName}. Your scout account is now <span className="font-semibold text-navy">pending verification</span>.
          </p>

          {/* Verification status card */}
          <div className="bg-white rounded-xl p-5 border border-stone/40 shadow-sm text-left mb-6 max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-navy font-medium text-sm">Verification Pending</p>
                <p className="text-earth/60 text-xs">Usually within 24–48 hours</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-earth/70">
              <div className="flex items-center gap-2">
                <span className="text-olive">✓</span> Account created
              </div>
              <div className="flex items-center gap-2">
                <span className="text-olive">✓</span> Organization details submitted
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Identity & organization verification in progress</span>
              </div>
              <div className="flex items-center gap-2 text-earth/40">
                <span>○</span> Full platform access granted
              </div>
            </div>
          </div>

          <p className="text-earth/60 text-sm mb-8">
            Our team will verify your identity and organization before granting full access to athlete profiles, performance data, and contact details. You&apos;ll receive an email at <span className="font-medium text-navy">{formData.email}</span> once approved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="border border-navy/20 hover:border-navy/40 text-navy font-medium px-6 py-3 rounded-full transition-colors text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="relative bg-navy-deep pt-24 pb-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_25%]"
          style={{ backgroundImage: "url('/hero-discover.jpg')" }}
        />
        <div className="absolute inset-0 bg-navy-deep/70" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
            Scout / Team Account
          </h1>
          <p className="text-white/50 text-sm">
            Access the world&apos;s most promising young cycling talent. Filter by power data, compound score, and more.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal Details */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
            <h2 className="font-display text-xl text-navy mb-1">Your Details</h2>
            <p className="text-earth text-sm mb-6">Who are you?</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="e.g. Patrick"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="e.g. Lefévere"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="your@team.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="Min 8 characters"
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="Confirm password"
                  minLength={8}
                />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
            <h2 className="font-display text-xl text-navy mb-1">Organization</h2>
            <p className="text-earth text-sm mb-6">Tell us about your team or agency.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Your Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                >
                  <option value="">Select role</option>
                  <option value="scout">Scout</option>
                  <option value="team-manager">Team Manager</option>
                  <option value="ds">Directeur Sportif</option>
                  <option value="agent">Agent</option>
                  <option value="coach">Coach / Trainer</option>
                  <option value="federation">National Federation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Organization Type *</label>
                <select
                  required
                  value={formData.orgType}
                  onChange={(e) => update("orgType", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                >
                  <option value="">Select type</option>
                  <option value="worldtour">UCI WorldTour Team</option>
                  <option value="proteam">UCI ProTeam</option>
                  <option value="conti">Continental Team</option>
                  <option value="development">Development Team</option>
                  <option value="agency">Talent Agency</option>
                  <option value="federation">National Federation</option>
                  <option value="independent">Independent Scout</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => update("organization", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="e.g. Team Visma - Lease a Bike"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="e.g. Netherlands"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="https://www.your-team.com"
                />
              </div>
            </div>
          </div>

          {/* Scouting Preferences */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
            <h2 className="font-display text-xl text-navy mb-1">Scouting Preferences</h2>
            <p className="text-earth text-sm mb-6">What kind of talent are you looking for? We&apos;ll personalise your feed.</p>

            {/* Disciplines */}
            <div className="mb-5">
              <label className="block text-xs uppercase tracking-wider text-earth mb-2 font-medium">Disciplines of Interest</label>
              <div className="flex flex-wrap gap-2">
                {["Road", "Track", "CX", "MTB", "Gravel", "TT"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleArray("disciplines", d)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      formData.disciplines.includes(d)
                        ? "bg-coral text-white border-coral"
                        : "bg-cream-warm/30 text-earth border-stone/40 hover:border-coral/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-5">
              <label className="block text-xs uppercase tracking-wider text-earth mb-2 font-medium">Age Categories</label>
              <div className="flex flex-wrap gap-2">
                {["U17", "U19", "U23", "U25", "Elite"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleArray("categories", c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      formData.categories.includes(c)
                        ? "bg-coral text-white border-coral"
                        : "bg-cream-warm/30 text-earth border-stone/40 hover:border-coral/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="mb-5">
              <label className="block text-xs uppercase tracking-wider text-earth mb-2 font-medium">Regions</label>
              <div className="flex flex-wrap gap-2">
                {["Europe", "Africa", "Asia", "North America", "South America", "Oceania"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleArray("regions", r)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      formData.regions.includes(r)
                        ? "bg-coral text-white border-coral"
                        : "bg-cream-warm/30 text-earth border-stone/40 hover:border-coral/40"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum thresholds */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Min Compound Score (W²/kg)</label>
                <input
                  type="number"
                  value={formData.minCompoundScore}
                  onChange={(e) => update("minCompoundScore", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="e.g. 2500"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Min FTP (W/kg)</label>
                <input
                  type="number"
                  value={formData.minFtpPerKg}
                  onChange={(e) => update("minFtpPerKg", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="e.g. 4.5"
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
            <h2 className="font-display text-xl text-navy mb-1">Additional Contact</h2>
            <p className="text-earth text-sm mb-6">Optional ways for athletes to reach you.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="+31 6 1234 5678"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedIn}
                  onChange={(e) => update("linkedIn", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 px-2">
            <input type="checkbox" required className="mt-1 rounded border-stone/40" />
            <p className="text-earth/60 text-xs">
              I agree to the{" "}
              <a href="#" className="text-coral hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-coral hover:underline">Privacy Policy</a>.
              I understand that athlete data is shared with verified scouts only.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-coral hover:bg-coral-light text-white font-medium px-12 py-3 rounded-full transition-colors text-sm"
            >
              Create Scout Account
            </button>
          </div>
        </form>

        {/* Already have account */}
        <p className="text-center text-earth text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-coral hover:underline font-medium">
            Log in
          </Link>
          {" · "}
          <Link href="/signup/athlete" className="text-coral hover:underline font-medium">
            Sign up as Athlete
          </Link>
        </p>
      </div>
    </div>
  );
}
