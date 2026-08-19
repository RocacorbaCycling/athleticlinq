"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { notifySignup } from "@/lib/notify";

export default function AthleteSignup() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    nationality: "",
    location: "",
    sex: "",

    // Step 2: Cycling Profile
    discipline: "",
    category: "",
    team: "",
    experienceYears: "",
    bio: "",

    // Step 3: Performance Data
    weight: "",
    ftp: "",
    fiveMinPower: "",
    twentyMinPower: "",
    maxPower: "",
    vo2max: "",

    // Step 4: Connections
    stravaUrl: "",
    instagramUrl: "",
  });


  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate compound score live
  const fiveMin = parseFloat(formData.fiveMinPower) || 0;
  const weight = parseFloat(formData.weight) || 1;
  const compoundScore = Math.round((fiveMin * fiveMin) / weight);
  const ftpPerKg = formData.ftp && formData.weight
    ? (parseFloat(formData.ftp) / parseFloat(formData.weight)).toFixed(2)
    : "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Get nationality flag emoji
    const flagMap: Record<string, string> = {
      italy: "🇮🇹", france: "🇫🇷", spain: "🇪🇸", germany: "🇩🇪",
      "united kingdom": "🇬🇧", uk: "🇬🇧", usa: "🇺🇸", "united states": "🇺🇸",
      australia: "🇦🇺", netherlands: "🇳🇱", belgium: "🇧🇪", colombia: "🇨🇴",
      slovenia: "🇸🇮", denmark: "🇩🇰", norway: "🇳🇴", sweden: "🇸🇪",
      switzerland: "🇨🇭", portugal: "🇵🇹", kenya: "🇰🇪", "south africa": "🇿🇦",
      japan: "🇯🇵", canada: "🇨🇦", ireland: "🇮🇪", "new zealand": "🇳🇿",
    };
    const flag = flagMap[formData.nationality.toLowerCase()] || "🌍";

    await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      flag,
      location: formData.location,
      sex: formData.sex || undefined,
      discipline: formData.discipline,
      category: formData.category,
      team: formData.team,
      experienceYears: formData.experienceYears,
      bio: formData.bio,
      weight: formData.weight,
      ftp: formData.ftp,
      fiveMinPower: formData.fiveMinPower,
      twentyMinPower: formData.twentyMinPower,
      maxPower: formData.maxPower,
      vo2max: formData.vo2max,
      compoundScore,
      ftpPerKg: ftpPerKg === "—" ? "0" : ftpPerKg,
      stravaUrl: formData.stravaUrl,
      stravaConnected: !!formData.stravaUrl,
      stravaWeeklyHours: undefined,
      stravaWeeklyTSS: undefined,
      stravaRecentDistance: undefined,
      stravaPowerVerified: false,
      instagramUrl: formData.instagramUrl,
      videoUrl: "",
    });

    // Notify admin of new athlete signup (fire-and-forget — never blocks registration)
    notifySignup({
      type       : "athlete",
      firstName  : formData.firstName,
      lastName   : formData.lastName,
      email      : formData.email,
      nationality: formData.nationality,
      location   : formData.location,
      discipline : formData.discipline,
      category   : formData.category,
    });

    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  };


  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-olive/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-navy mb-3">Welcome to AthleticLinq!</h1>
          <p className="text-earth mb-2">
            Your athlete profile has been created, {formData.firstName}.
          </p>
          {compoundScore > 0 && (
            <p className="text-coral font-semibold mb-6">
              Your Compound Score: {compoundScore} W²/kg
            </p>
          )}
          <p className="text-earth/60 text-sm mb-8">
            Your profile is live. Redirecting you to your dashboard now…
          </p>
          <div className="flex items-center justify-center gap-2 text-earth/50 text-sm">
            <svg className="w-4 h-4 animate-spin text-coral" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Taking you to your dashboard…
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
            Create Your Athlete Profile
          </h1>
          <p className="text-white/50 text-sm">
            Showcase your power, performance, and potential to scouts worldwide.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-8">
            {[
              { num: 1, label: "Personal" },
              { num: 2, label: "Cycling" },
              { num: 3, label: "Performance" },
              { num: 4, label: "Connect" },
            ].map(({ num, label }) => (
              <div key={num} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= num
                      ? "bg-coral text-white"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {step > num ? "✓" : num}
                </div>
                <span className={`text-xs hidden sm:inline ${step >= num ? "text-white" : "text-white/40"}`}>
                  {label}
                </span>
                {num < 4 && <div className={`flex-1 h-px ${step > num ? "bg-coral" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
              <h2 className="font-display text-xl text-navy mb-1">Personal Information</h2>
              <p className="text-earth text-sm mb-6">Tell us about yourself.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. Tadej"
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
                    placeholder="e.g. Pogačar"
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
                    placeholder="your@email.com"
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
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Nationality *</label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. Slovenia"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">City / Region</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => update("location", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. Ljubljana, Slovenia"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-earth mb-2 font-medium">Sex *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["male", "female", "prefer not to say"] as const).map((option) => (
                      <label
                        key={option}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors text-sm capitalize ${
                          formData.sex === option
                            ? "border-coral bg-coral/5 text-coral font-medium"
                            : "border-stone/40 text-earth hover:border-coral/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="sex"
                          value={option}
                          checked={formData.sex === option}
                          onChange={() => update("sex", option)}
                          className="sr-only"
                          required={!formData.sex}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-coral hover:bg-coral-light text-white font-medium px-8 py-2.5 rounded-full transition-colors text-sm"
                >
                  Next: Cycling Profile →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Cycling Profile */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
              <h2 className="font-display text-xl text-navy mb-1">Cycling Profile</h2>
              <p className="text-earth text-sm mb-6">Tell us about your riding.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Discipline *</label>
                  <select
                    required
                    value={formData.discipline}
                    onChange={(e) => update("discipline", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  >
                    <option value="">Select discipline</option>
                    <option value="Road">Road</option>
                    <option value="Track">Track</option>
                    <option value="CX">Cyclocross</option>
                    <option value="MTB">Mountain Bike</option>
                    <option value="Gravel">Gravel</option>
                    <option value="TT">Time Trial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  >
                    <option value="">Select category</option>
                    <option value="U17">U17 (Junior)</option>
                    <option value="U19">U19 (Junior)</option>
                    <option value="U23">U23 (Espoir)</option>
                    <option value="U25">U25</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Current Team</label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => update("team", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. Local cycling club or development team"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Years Racing</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => update("experienceYears", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 3"
                    min={0}
                    max={20}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Bio / About You</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30 resize-none"
                    placeholder="Tell scouts what makes you stand out. Your ambitions, strengths, race highlights..."
                    maxLength={500}
                  />
                  <p className="text-earth/50 text-xs mt-1">{formData.bio.length}/500 characters</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-earth hover:text-navy font-medium px-6 py-2.5 rounded-full transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-coral hover:bg-coral-light text-white font-medium px-8 py-2.5 rounded-full transition-colors text-sm"
                >
                  Next: Performance Data →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Performance Data */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
              <h2 className="font-display text-xl text-navy mb-1">Performance Data</h2>
              <p className="text-earth text-sm mb-6">
                Enter your power numbers. These are what scouts look at first.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Body Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    value={formData.weight}
                    onChange={(e) => update("weight", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 65"
                    min={30}
                    max={150}
                    step={0.1}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">FTP (Watts) *</label>
                  <input
                    type="number"
                    required
                    value={formData.ftp}
                    onChange={(e) => update("ftp", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 320"
                    min={50}
                    max={600}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">5-Minute Power (Watts) *</label>
                  <input
                    type="number"
                    required
                    value={formData.fiveMinPower}
                    onChange={(e) => update("fiveMinPower", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 380"
                    min={50}
                    max={700}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">20-Minute Power (Watts)</label>
                  <input
                    type="number"
                    value={formData.twentyMinPower}
                    onChange={(e) => update("twentyMinPower", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 340"
                    min={50}
                    max={600}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Max Sprint Power (Watts)</label>
                  <input
                    type="number"
                    value={formData.maxPower}
                    onChange={(e) => update("maxPower", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 1100"
                    min={100}
                    max={2500}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">VO2max (ml/kg/min)</label>
                  <input
                    type="number"
                    value={formData.vo2max}
                    onChange={(e) => update("vo2max", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                    placeholder="e.g. 75"
                    min={20}
                    max={100}
                    step={0.1}
                  />
                </div>
              </div>

              {/* Live Compound Score Preview */}
              {fiveMin > 0 && parseFloat(formData.weight) > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-navy-deep/5 border border-navy/10">
                  <p className="text-xs uppercase tracking-wider text-earth mb-3 font-medium">Your Live Metrics</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-coral">{compoundScore}</div>
                      <div className="text-[10px] uppercase tracking-wider text-earth">Compound Score (W²/kg)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-navy">{ftpPerKg}</div>
                      <div className="text-[10px] uppercase tracking-wider text-earth">FTP W/kg</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-navy">{formData.ftp || "—"}</div>
                      <div className="text-[10px] uppercase tracking-wider text-earth">FTP (Watts)</div>
                    </div>
                  </div>
                  <p className="text-earth/50 text-[10px] mt-3 text-center">
                    Compound Score = (5min Power)² ÷ Weight — Leo, Spragg, Wakefield & Swart methodology
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-earth hover:text-navy font-medium px-6 py-2.5 rounded-full transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-coral hover:bg-coral-light text-white font-medium px-8 py-2.5 rounded-full transition-colors text-sm"
                >
                  Next: Connect Accounts →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Connections */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Header card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
                <h2 className="font-display text-xl text-navy mb-1">Connect Your Accounts</h2>
                <p className="text-earth text-sm mb-1">
                  Link your training platforms so scouts can verify your data.
                </p>
                <p className="text-earth/50 text-xs">All connections are completely optional — you can add or update them anytime from your dashboard.</p>
              </div>

              {/* Strava */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone/40 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FC4C02]/10 flex items-center justify-center shadow-sm flex-shrink-0">
                    <svg className="w-6 h-6 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-navy font-semibold text-sm">Strava</h3>
                    <p className="text-earth/60 text-xs mt-0.5">Scouts can click through to verify your rides and activity history</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.stravaUrl}
                  onChange={(e) => update("stravaUrl", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-[#FC4C02]/20 bg-cream-warm/30"
                  placeholder="https://www.strava.com/athletes/12345678"
                />
                <p className="text-[11px] text-earth/50 mt-2">
                  Find your URL: open Strava → tap your profile photo → copy the URL from your browser&apos;s address bar.
                </p>
              </div>

              {/* Instagram */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone/40 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 flex items-center justify-center">
                    <span className="text-[#E1306C] font-bold text-sm">IG</span>
                  </div>
                  <div>
                    <h3 className="text-navy font-semibold text-sm">Instagram <span className="text-earth/40 font-normal text-xs ml-1">(Optional)</span></h3>
                    <p className="text-earth/60 text-xs">Show scouts your personality, race coverage &amp; content</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.instagramUrl}
                  onChange={(e) => update("instagramUrl", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                  placeholder="https://www.instagram.com/your-handle"
                />
                <p className="text-[11px] text-earth/50 mt-2">You can skip this now and add it later from your dashboard.</p>
              </div>

              {/* Video Upload */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone/40 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-navy font-semibold text-sm">Profile Video</h3>
                    <p className="text-earth/60 text-xs">A 30–90 sec clip of you riding massively boosts scout interest</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-stone/40 rounded-xl p-6 text-center bg-cream-warm/20">
                  <p className="text-earth/50 text-xs mb-3">Drag &amp; drop your video here, or</p>
                  <button type="button" className="text-coral text-sm font-medium hover:text-coral-light transition-colors">
                    Browse file (coming soon)
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone/40 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 rounded border-stone/40 accent-coral" id="terms" />
                  <label htmlFor="terms" className="text-earth/60 text-xs leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-coral hover:underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-coral hover:underline">Privacy Policy</a>.
                    I confirm I am at least 16 years old (or have parental consent if under 18).
                    I understand my performance data will be visible to verified scouts and teams on AthleticLinq.
                  </label>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-earth hover:text-navy font-medium px-6 py-2.5 rounded-full transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="bg-coral hover:bg-coral-light text-white font-medium px-10 py-2.5 rounded-full transition-colors text-sm shadow-sm"
                  >
                    Create My Profile →
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Already have account */}
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
