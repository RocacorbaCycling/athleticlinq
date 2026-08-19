"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAthleteById, type Athlete } from "@/data/athletes";
import { supabase } from "@/lib/supabase";
import { useAuth, isScout, type AthleteProfile } from "@/context/AuthContext";
import CompoundScore from "@/components/CompoundScore";
import PowerStats from "@/components/PowerStats";
import PowerGate from "@/components/PowerGate";
import AthleteProfileActions from "@/components/AthleteProfileActions";
import VideoPlayer from "@/components/VideoPlayer";
import { buildPowerCurve } from "@/lib/powerCurve";

// ── Convert registered AthleteProfile → display Athlete ──────────────────────
// NOTE: numeric fields (ftp, weight, etc.) are stored as strings in Supabase
// because the signup form submits them as strings. Always parse with Number().
function profileToAthlete(p: AthleteProfile): Athlete {
  const num = (v: unknown) => {
    const n = parseFloat(String(v ?? ""));
    return isNaN(n) ? 0 : n;
  };

  const fiveMin = num(p.fiveMinPower);
  const wt = num(p.weight) || 70;
  const dob = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
  const birthYear = dob && !isNaN(dob.getTime()) ? dob.getFullYear() : 0;
  const age = birthYear ? new Date().getFullYear() - birthYear : 0;

  return {
    id: p.id,
    firstName: p.firstName || "",
    lastName: p.lastName || "",
    age,
    nationality: p.nationality || "",
    flag: p.flag || "🏳️",
    location: p.location || "",
    category: p.category || "",
    discipline: p.discipline || "",
    team: p.team || undefined,
    bio: p.bio || "",
    profileImage: p.profileImage || "",
    videoUrl: p.videoUrl || undefined,
    ftp: num(p.ftp),
    ftpPerKg: num(p.ftpPerKg),
    weight: wt,
    vo2max: p.vo2max ? num(p.vo2max) : undefined,
    maxPower: num(p.maxPower),
    fiveMinPower: fiveMin,
    twentyMinPower: num(p.twentyMinPower),
    compoundScore: num(p.compoundScore),
    stravaConnected: !!p.stravaConnected,
    stravaUrl: p.stravaUrl || undefined,
    stravaWeeklyHours: p.stravaWeeklyHours ? num(p.stravaWeeklyHours) : undefined,
    stravaWeeklyTSS: p.stravaWeeklyTSS ? num(p.stravaWeeklyTSS) : undefined,
    stravaRecentDistance: p.stravaRecentDistance ? num(p.stravaRecentDistance) : undefined,
    stravaPowerVerified: !!p.stravaPowerVerified,
    stravaFTPEstimate: p.stravaFTPEstimate ? num(p.stravaFTPEstimate) : undefined,
    stravaBestMaxPower: p.stravaBestMaxPower ? num(p.stravaBestMaxPower) : undefined,
    stravaWeeklyElevation: p.stravaWeeklyElevation ? num(p.stravaWeeklyElevation) : undefined,
    stravaYTDDistance: p.stravaYTDDistance ? num(p.stravaYTDDistance) : undefined,
    stravaYTDElevation: p.stravaYTDElevation ? num(p.stravaYTDElevation) : undefined,
    stravaYTDHours: p.stravaYTDHours ? num(p.stravaYTDHours) : undefined,
    stravaTotalSufferScore: p.stravaTotalSufferScore ? num(p.stravaTotalSufferScore) : undefined,
    sex: p.sex,
    labResultsUrl: p.labResultsUrl,
    labResultsFileName: p.labResultsFileName,
    followers: 0,
    verified: p.verified,
    palmares: [],
    tags: [],
  };
}

type PageState = "checking" | "loading" | "found" | "athlete-not-found" | "generic-404";

export default function NotFound() {
  const { user } = useAuth();
  const isVerifiedScout = isScout(user) && user.verified;
  const [pageState, setPageState] = useState<PageState>("checking");
  const [athlete, setAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    // Match /athletes/<id> exactly (trailing slash optional)
    const match = path.match(/^\/athletes\/([^/]+)\/?$/);

    if (!match) {
      setPageState("generic-404");
      return;
    }

    const id = decodeURIComponent(match[1]);
    setPageState("loading");

    async function fetchAthlete() {
      // 1. Static demo athletes (IDs "1"–"8")
      const staticAthlete = getAthleteById(id);
      if (staticAthlete) {
        setAthlete(staticAthlete);
        setPageState("found");
        return;
      }

      // 2. Supabase — strip sensitive fields before storing in client state
      if (supabase) {
        const { data } = await supabase
          .from("athletes")
          .select("profile, verified")
          .eq("id", id)
          .single();
        if (data) {
          // Never expose password or raw email to the browser's React state.
          // The Athlete display type has no password field, but we scrub it
          // here defensively so it never enters memory via the spread.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          // Strip sensitive fields before they enter React state — scouts only
          // see the display-safe subset. Cast via unknown because we deliberately
          // omit required auth-only fields (password, email).
          const raw = data.profile as Record<string, unknown>;
          delete raw.password;
          delete raw.email;
          setAthlete(profileToAthlete({ ...(raw as unknown as AthleteProfile), verified: data.verified }));
          setPageState("found");
          return;
        }
      }

      // 3. localStorage fallback — also scrub sensitive fields
      try {
        const stored: AthleteProfile[] = JSON.parse(
          localStorage.getItem("athleticlinq_users") || "[]"
        );
        const found = stored.find((u) => u.id === id);
        if (found) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const raw = { ...found } as Record<string, unknown>;
          delete raw.password;
          delete raw.email;
          setAthlete(profileToAthlete(raw as unknown as AthleteProfile));
          setPageState("found");
          return;
        }
      } catch {}

      setPageState("athlete-not-found");
    }

    fetchAthlete();
  }, []);

  // Track scout profile views — fires when a verified scout views this profile
  useEffect(() => {
    if (!isVerifiedScout || !athlete || !supabase) return;
    const scoutUser = user as import("@/context/AuthContext").ScoutProfile;
    supabase.from("profile_views").upsert({
      athlete_id: athlete.id,
      scout_id: scoutUser.id,
      scout_first_name: scoutUser.firstName,
      scout_last_name: scoutUser.lastName,
      scout_organization: scoutUser.organization,
      scout_role: scoutUser.role,
      last_viewed_at: new Date().toISOString(),
    }, { onConflict: "athlete_id,scout_id" }).then(() => {});
  }, [isVerifiedScout, athlete, user]);

  // ── Loading / checking spinner ──────────────────────────────────────────────
  if (pageState === "checking" || pageState === "loading") {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-coral/20 border-t-coral rounded-full animate-spin mx-auto mb-4" />
          <p className="text-earth text-sm">Loading athlete profile…</p>
        </div>
      </div>
    );
  }

  // ── Generic 404 ─────────────────────────────────────────────────────────────
  if (pageState === "generic-404") {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-display text-8xl text-navy mb-4">404</h1>
          <p className="text-earth text-lg mb-8">This page could not be found.</p>
          <Link
            href="/"
            className="bg-coral text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-coral-light transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Athlete not found ───────────────────────────────────────────────────────
  if (pageState === "athlete-not-found" || !athlete) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-display text-4xl text-navy mb-4">Athlete Not Found</h1>
          <p className="text-earth mb-8">
            This athlete profile doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/discover"
            className="bg-coral text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-coral-light transition-colors"
          >
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  // ── Full athlete profile ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Banner */}
      <div className="relative bg-navy-deep pt-8 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_25%]"
          style={{ backgroundImage: "url('/hero-discover.jpg')" }}
        />
        <div className="absolute inset-0 bg-navy-deep/70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Discover
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Profile image / initials */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-navy via-charcoal to-navy-deep overflow-hidden relative group">
                {athlete.videoUrl ? (
                  /* ── Real video ── */
                  <VideoPlayer url={athlete.videoUrl} />
                ) : athlete.profileImage ? (
                  /* ── Profile photo (no video) ── */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={athlete.profileImage}
                    alt={`${athlete.firstName} ${athlete.lastName}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  /* ── No photo or video — initials placeholder ── */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-9xl font-display text-white/10">
                      {athlete.firstName[0]}
                      {athlete.lastName[0]}
                    </span>
                  </div>
                )}
                {/* Play button — only shown when there's no video yet */}
                {!athlete.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-coral/80 flex items-center justify-center backdrop-blur-sm group-hover:bg-coral transition-colors cursor-pointer group-hover:scale-110 duration-300">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="text-white/50 text-xs bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    {athlete.videoUrl ? "Profile Video" : "No video yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{athlete.flag}</span>
                    {athlete.verified && (
                      <span className="bg-coral/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                    <span className="bg-white/10 text-white/70 text-xs font-medium px-2.5 py-1 rounded-full">
                      {athlete.category}
                    </span>
                  </div>
                  <h1 className="font-display text-4xl sm:text-5xl text-white mb-1">
                    {athlete.firstName} {athlete.lastName}
                  </h1>
                  <div className="text-white/50 text-sm flex flex-wrap items-center gap-2">
                    <span>
                      {athlete.age > 0 ? `${athlete.age} years old · ` : ""}{athlete.location}
                    </span>
                  </div>
                  <div className="text-coral font-medium text-sm mt-2">{athlete.discipline}</div>
                  {athlete.team && (
                    <div className="text-white/40 text-sm mt-1">{athlete.team}</div>
                  )}
                </div>

                <PowerGate inline>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <CompoundScore score={athlete.compoundScore} size="lg" />
                  </div>
                </PowerGate>
              </div>

              <p className="text-white/60 text-sm leading-relaxed mt-6 max-w-2xl">{athlete.bio}</p>

              <div className="flex flex-wrap gap-3 mt-6">
                <AthleteProfileActions
                  athleteId={athlete.id}
                  athleteFirstName={athlete.firstName}
                  athleteLastName={athlete.lastName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Power Numbers — scouts only */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
              <h2 className="font-display text-xl text-navy mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Power Numbers
              </h2>
              <PowerGate>
                <PowerStats athlete={athlete} />
              </PowerGate>
            </div>

            {/* Power Duration Curve */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
              <h2 className="font-display text-xl text-navy mb-1">Power Duration Curve</h2>
              {athlete.stravaPowerVerified && (
                <p className="text-[11px] text-[#FC4C02] mb-4">Anchored on Strava-verified power data</p>
              )}
              {!athlete.stravaPowerVerified && <div className="mb-4" />}
              <div className="bg-cream-warm rounded-xl p-4">
                <div className="flex items-end gap-1.5 h-40">
                  {buildPowerCurve(
                    (athlete.stravaBestMaxPower || athlete.maxPower) ?? 0,
                    athlete.fiveMinPower ?? 0,
                    athlete.twentyMinPower ?? 0,
                    (athlete.stravaFTPEstimate || athlete.ftp) ?? 0,
                  ).map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-navy to-coral transition-all hover:from-coral hover:to-coral-light cursor-pointer"
                        style={{ height: `${bar.pct}%` }}
                        title={`${bar.dur}: ~${bar.watts}W`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-earth px-1">
                  <span>5s</span><span>30s</span><span>2m</span>
                  <span>10m</span><span>30m</span><span>120m</span>
                </div>
              </div>
            </div>

            {/* Strava Training Data — scouts only */}
            {athlete.stravaConnected && (
              <PowerGate>
                <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
                  <h2 className="font-display text-xl text-navy mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Strava Training Data
                  </h2>

                  {/* Power from Strava */}
                  {athlete.stravaPowerVerified && (athlete.stravaFTPEstimate || athlete.stravaBestMaxPower) && (
                    <div className="mb-5">
                      <div className="text-[10px] uppercase tracking-wider text-earth font-semibold mb-2">
                        Power — Strava Verified
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        {athlete.stravaFTPEstimate && (
                          <div className="bg-[#FC4C02]/5 border border-[#FC4C02]/20 rounded-xl p-3 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-earth mb-1">Est. FTP</div>
                            <div className="text-navy font-bold text-xl">~{athlete.stravaFTPEstimate}W</div>
                          </div>
                        )}
                        {athlete.stravaBestMaxPower && (
                          <div className="bg-cream-warm rounded-xl p-3 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-earth mb-1">Peak Power</div>
                            <div className="text-navy font-bold text-xl">{athlete.stravaBestMaxPower}W</div>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-earth/50 leading-relaxed">
                        FTP estimated from best normalized power in last 30 activities. Peak is highest 1-second watt recorded.
                      </p>
                    </div>
                  )}

                  {/* Year to date */}
                  {(athlete.stravaYTDDistance || athlete.stravaYTDElevation || athlete.stravaYTDHours) && (
                    <div className="mb-5">
                      <div className="text-[10px] uppercase tracking-wider text-earth font-semibold mb-2">Year to Date</div>
                      <div className="grid grid-cols-3 gap-3">
                        {athlete.stravaYTDDistance && (
                          <div className="bg-cream-warm rounded-xl p-3 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-earth mb-1">Distance</div>
                            <div className="text-navy font-bold text-base">{athlete.stravaYTDDistance.toLocaleString()}</div>
                            <div className="text-earth text-[10px]">km</div>
                          </div>
                        )}
                        {athlete.stravaYTDElevation && (
                          <div className="bg-cream-warm rounded-xl p-3 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-earth mb-1">Elevation</div>
                            <div className="text-navy font-bold text-base">{athlete.stravaYTDElevation.toLocaleString()}</div>
                            <div className="text-earth text-[10px]">m</div>
                          </div>
                        )}
                        {athlete.stravaYTDHours && (
                          <div className="bg-cream-warm rounded-xl p-3 text-center">
                            <div className="text-[10px] uppercase tracking-wider text-earth mb-1">Hours</div>
                            <div className="text-navy font-bold text-base">{athlete.stravaYTDHours}</div>
                            <div className="text-earth text-[10px]">hrs</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Training load */}
                  {athlete.stravaTotalSufferScore && (
                    <div className="flex items-center justify-between bg-cream-warm rounded-xl px-4 py-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-earth">30-day Training Load</div>
                        <div className="text-[10px] text-earth/50">Sum of suffer scores</div>
                      </div>
                      <div className="text-navy font-bold text-xl">{athlete.stravaTotalSufferScore.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </PowerGate>
            )}

            {/* Palmares */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
              <h2 className="font-display text-xl text-navy mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Palmar&egrave;s
              </h2>
              {athlete.palmares.length > 0 ? (
                <ul className="space-y-3">
                  {athlete.palmares.map((result, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          result.startsWith("1st")
                            ? "bg-coral/10 text-coral"
                            : result.startsWith("2nd")
                            ? "bg-navy/10 text-navy"
                            : "bg-stone text-earth"
                        }`}
                      >
                        {result.startsWith("1st") ? "1" : result.startsWith("2nd") ? "2" : "3"}
                      </div>
                      <span className="text-warm-black">{result}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-earth/60 text-sm">No results added yet.</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Strava */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
              <h2 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Strava
              </h2>
              {athlete.stravaConnected ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#FC4C02]" />
                    <span className="text-[#FC4C02] text-xs font-medium">
                      Connected{athlete.stravaPowerVerified ? " · Power Verified ✓" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Hrs/Wk",  val: athlete.stravaWeeklyHours   != null ? `${athlete.stravaWeeklyHours}` : null },
                      { label: "4-wk km", val: athlete.stravaRecentDistance != null ? `${athlete.stravaRecentDistance}` : null },
                      { label: "Elev/Wk", val: athlete.stravaWeeklyElevation != null ? `${athlete.stravaWeeklyElevation.toLocaleString()}m` : null },
                    ].map(({ label, val }) => val && (
                      <div key={label} className="bg-cream-warm rounded-xl p-2.5 text-center">
                        <div className="text-[9px] uppercase tracking-wider text-earth mb-1">{label}</div>
                        <div className="text-navy font-bold text-base">{val}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-earth/50 mb-3">
                    Full power & training load data visible to scouts ↑
                  </p>
                  {athlete.stravaUrl && (
                    <a
                      href={athlete.stravaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-earth hover:text-navy transition-colors"
                    >
                      View on Strava →
                    </a>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-earth text-sm mb-2">Not connected</div>
                  <p className="text-earth/60 text-xs">
                    This athlete hasn&apos;t linked their Strava account yet
                  </p>
                </div>
              )}
            </div>

            {/* Lab Results */}
            {athlete.labResultsUrl && (
              <PowerGate>
                <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
                  <h2 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Lab Results
                  </h2>
                  <div className="flex items-center gap-3 p-3 bg-olive/5 border border-olive/20 rounded-xl mb-3">
                    <div className="w-9 h-9 rounded-lg bg-olive/15 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-warm-black text-xs font-semibold truncate">
                        {athlete.labResultsFileName ?? "Lab Results"}
                      </p>
                      <p className="text-earth/50 text-[10px]">Certified physiological test</p>
                    </div>
                  </div>
                  <a
                    href={athlete.labResultsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-olive hover:bg-olive/90 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Lab Results
                  </a>
                </div>
              </PowerGate>
            )}

            {/* Tags */}
            {athlete.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
                <h2 className="font-display text-lg text-navy mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {athlete.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs uppercase tracking-wider text-earth bg-cream-warm px-3 py-1.5 rounded-full border border-stone/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone/30 p-6">
              <h2 className="font-display text-lg text-navy mb-4">Details</h2>
              <dl className="space-y-3 text-sm">
                {athlete.age > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Age</dt>
                    <dd className="text-warm-black font-medium">{athlete.age}</dd>
                  </div>
                )}
                {athlete.nationality && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Nationality</dt>
                    <dd className="text-warm-black font-medium">
                      {athlete.flag} {athlete.nationality}
                    </dd>
                  </div>
                )}
                {athlete.location && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Location</dt>
                    <dd className="text-warm-black font-medium">{athlete.location}</dd>
                  </div>
                )}
                {athlete.category && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Category</dt>
                    <dd className="text-warm-black font-medium">{athlete.category}</dd>
                  </div>
                )}
                {athlete.team && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Team</dt>
                    <dd className="text-warm-black font-medium">{athlete.team}</dd>
                  </div>
                )}
                {athlete.sex && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Sex</dt>
                    <dd className="text-warm-black font-medium capitalize">{athlete.sex}</dd>
                  </div>
                )}
                {athlete.weight > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-earth">Weight</dt>
                    <dd className="text-warm-black font-medium">{athlete.weight} kg</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Scout CTA */}
            <div className="bg-navy-deep rounded-2xl p-6 text-center">
              <h3 className="font-display text-lg text-white mb-2">
                Interested in this athlete?
              </h3>
              <p className="text-white/50 text-xs mb-4">
                Get full access to power data, training history, and direct messaging
              </p>
              <AthleteProfileActions
                athleteId={athlete.id}
                athleteFirstName={athlete.firstName}
                athleteLastName={athlete.lastName}
                variant="sidebar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
