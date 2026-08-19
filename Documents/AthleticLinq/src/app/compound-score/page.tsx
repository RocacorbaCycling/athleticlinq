"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ── Men's tier definitions ────────────────────────────────────────────────────
// Benchmarks: Leo, Spragg, Wakefield & Swart (2022), Journal of Science and Cycling.
// WorldTour GC (Pogačar / Vingegaard level): ~3,400–3,500 W²/kg
// U23 professional mean: ~3,000 W²/kg  (range 2,760–3,230)
// Strong amateur / Cat 1: ~1,750 W²/kg
// Competitive club / Cat 2–3: ~1,100 W²/kg

const TIERS_MEN = [
  {
    min: 3450,
    max: Infinity,
    label: "WorldTour",
    sublabel: "GC contender level",
    color: "text-coral",
    bg: "bg-coral",
    bgLight: "bg-coral/10",
    border: "border-coral/30",
    bar: "bg-coral",
    desc: "WorldTour GC contender level. Research by Leo et al. (2022) places the best riders in the world at 3,400–3,500 W²/kg. Scores above 3,450 represent genuine professional potential at the absolute highest level of the sport.",
  },
  {
    min: 2700,
    max: 3449,
    label: "Professional",
    sublabel: "ProTeam / U23 Pro",
    color: "text-olive",
    bg: "bg-olive",
    bgLight: "bg-olive/10",
    border: "border-olive/30",
    bar: "bg-olive",
    desc: "ProTeam and U23 professional level. The mean compound score for U23 professional riders is approximately 3,000 W²/kg. Scouts actively recruit at this level — your profile on AthleticLinq will attract serious attention.",
  },
  {
    min: 1900,
    max: 2699,
    label: "Elite",
    sublabel: "Continental / Cat 1",
    color: "text-navy",
    bg: "bg-navy-deep",
    bgLight: "bg-navy-deep/8",
    border: "border-navy-deep/20",
    bar: "bg-navy-deep",
    desc: "Continental team and Cat 1 amateur level. Strong numbers with clear upside. A targeted training block on 5-minute efforts or weight optimisation could push you into the Professional tier. Worth having a profile on AthleticLinq.",
  },
  {
    min: 1200,
    max: 1899,
    label: "Competitive",
    sublabel: "Club racer / Cat 2–3",
    color: "text-earth",
    bg: "bg-earth",
    bgLight: "bg-earth/10",
    border: "border-earth/30",
    bar: "bg-earth",
    desc: "Competitive club-racing level. You're training well and racing hard. Focus on building your aerobic base and 5-minute power — riders at this level who commit to structured training can reach Elite tier within a season or two.",
  },
  {
    min: 0,
    max: 1199,
    label: "Recreational",
    sublabel: "Keep training",
    color: "text-stone",
    bg: "bg-stone",
    bgLight: "bg-stone/20",
    border: "border-stone/30",
    bar: "bg-stone",
    desc: "Every elite rider started here. Consistent training, structured intervals, and good recovery will move your compound score significantly within a season. Build your aerobic base first — the power-to-weight ratio will follow.",
  },
] as const;

// ── Women's tier definitions ──────────────────────────────────────────────────
// Reference anchor: a top-5 women's rider in the world produces a 5-min power
// of 350 W at 50 kg → Compound Score = 350 × (350 / 50) = 2,450 W²/kg.
// This is one of the highest recorded women's 5-min compound scores globally,
// representing the ceiling of WorldTour women's racing performance.
//
// Tier boundaries are calibrated downward from that anchor, using the same
// physiological ratios observed in the Leo et al. (2022) men's data.

const TIERS_WOMEN = [
  {
    min: 2200,
    max: Infinity,
    label: "WorldTour",
    sublabel: "World's best level",
    color: "text-coral",
    bg: "bg-coral",
    bgLight: "bg-coral/10",
    border: "border-coral/30",
    bar: "bg-coral",
    desc: "World-class women's road racing level. A top-5 women's 5-minute power in the world produces a compound score of ~2,450 W²/kg. Scores above 2,200 represent genuine WorldTour potential — the very upper echelon of women's professional cycling.",
  },
  {
    min: 1700,
    max: 2199,
    label: "Professional",
    sublabel: "WorldTour / Pro level",
    color: "text-olive",
    bg: "bg-olive",
    bgLight: "bg-olive/10",
    border: "border-olive/30",
    bar: "bg-olive",
    desc: "Women's WorldTour and top professional team level. A strong, competitive WorldTour rider — the kind of athlete scouts are actively looking for. Your profile on AthleticLinq is likely to attract serious interest from professional teams.",
  },
  {
    min: 1200,
    max: 1699,
    label: "Elite",
    sublabel: "Continental / top amateur",
    color: "text-navy",
    bg: "bg-navy-deep",
    bgLight: "bg-navy-deep/8",
    border: "border-navy-deep/20",
    bar: "bg-navy-deep",
    desc: "Women's continental team and top amateur level. Strong numbers with clear upside. Targeted work on 5-minute power and race-weight optimisation could move you toward Professional tier. Worth building your AthleticLinq profile now.",
  },
  {
    min: 750,
    max: 1199,
    label: "Competitive",
    sublabel: "Club racer / cat racer",
    color: "text-earth",
    bg: "bg-earth",
    bgLight: "bg-earth/10",
    border: "border-earth/30",
    bar: "bg-earth",
    desc: "Competitive club-racing level. You're training seriously and racing well. Build your aerobic base, add structured 5-minute intervals, and commit to consistent training — riders at this level regularly move up a tier within a season.",
  },
  {
    min: 0,
    max: 749,
    label: "Recreational",
    sublabel: "Keep training",
    color: "text-stone",
    bg: "bg-stone",
    bgLight: "bg-stone/20",
    border: "border-stone/30",
    bar: "bg-stone",
    desc: "Every elite rider started here. Consistent training, structured intervals, and good recovery will move your compound score significantly within a season. Build your aerobic base first — the power-to-weight ratio will follow.",
  },
] as const;

// Bar scale — different for each sex
const BAR_MAX_MEN   = 4300;
const BAR_MAX_WOMEN = 3000;

function getTier(score: number, sex: "men" | "women") {
  const tiers = sex === "women" ? TIERS_WOMEN : TIERS_MEN;
  return tiers.find((t) => score >= t.min && score <= t.max) ?? tiers[tiers.length - 1];
}

function scoreToBarPct(score: number, barMax: number) {
  return Math.min(100, Math.round((score / barMax) * 100));
}

// ── Number input helper ──────────────────────────────────────────────────────
function NumInput({
  label,
  unit,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-earth font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-14 rounded-xl border border-stone/40 text-warm-black text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50 bg-white placeholder:text-earth/40"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-earth/50 text-sm font-medium pointer-events-none">
          {unit}
        </span>
      </div>
      {hint && <p className="text-earth/50 text-xs mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CompoundScoreCalculator() {
  const [sex, setSex]       = useState<"men" | "women">("men");
  const [fiveMin, setFiveMin] = useState("");
  const [weight, setWeight]   = useState("");
  const [ftp, setFtp]         = useState("");

  const fiveMinNum = parseFloat(fiveMin) || 0;
  const weightNum  = parseFloat(weight)  || 0;
  const ftpNum     = parseFloat(ftp)     || 0;

  const hasEnough = fiveMinNum > 0 && weightNum > 0;
  const BAR_MAX   = sex === "women" ? BAR_MAX_WOMEN : BAR_MAX_MEN;

  const results = useMemo(() => {
    if (!hasEnough) return null;
    const fiveMinPerKg  = fiveMinNum / weightNum;
    const compoundScore = Math.round(fiveMinNum * fiveMinPerKg);
    const ftpPerKg      = ftpNum > 0 ? ftpNum / weightNum : null;
    const tier          = getTier(compoundScore, sex);
    const barPct        = scoreToBarPct(compoundScore, BAR_MAX);
    return { compoundScore, fiveMinPerKg, ftpPerKg, tier, barPct };
  }, [fiveMinNum, weightNum, ftpNum, hasEnough, sex, BAR_MAX]);

  // Tick labels for the progress bar
  const tickLabels = sex === "women"
    ? ["0", "750", "1,200", "1,700", "2,200", "3,000 WT+"]
    : ["0", "1,200", "1,900", "2,700", "3,450", "4,300 WT+"];

  // Tier band widths for the coloured bar
  const tierBands = sex === "women"
    ? [
        { pct: (750  / BAR_MAX_WOMEN) * 100, cls: "bg-stone/30" },
        { pct: ((1200 - 750)  / BAR_MAX_WOMEN) * 100, cls: "bg-earth/25" },
        { pct: ((1700 - 1200) / BAR_MAX_WOMEN) * 100, cls: "bg-navy-deep/20" },
        { pct: ((2200 - 1700) / BAR_MAX_WOMEN) * 100, cls: "bg-olive/25" },
      ]
    : [
        { pct: (1200 / BAR_MAX_MEN) * 100, cls: "bg-stone/30" },
        { pct: ((1900 - 1200) / BAR_MAX_MEN) * 100, cls: "bg-earth/25" },
        { pct: ((2700 - 1900) / BAR_MAX_MEN) * 100, cls: "bg-navy-deep/20" },
        { pct: ((3450 - 2700) / BAR_MAX_MEN) * 100, cls: "bg-olive/25" },
      ];

  const tiers = sex === "women" ? TIERS_WOMEN : TIERS_MEN;

  // Reference benchmarks for the sidebar and empty state
  const benchmarks = sex === "women"
    ? {
        rows: [
          { label: "World's best 5-min power (top 5)", value: "~2,450", tier: TIERS_WOMEN[0] },
          { label: "WorldTour women's regular", value: "~1,700–2,000", tier: TIERS_WOMEN[1] },
          { label: "Continental / top amateur", value: "~1,200–1,500", tier: TIERS_WOMEN[2] },
          { label: "Competitive club", value: "~750–1,100", tier: TIERS_WOMEN[3] },
        ],
        emptyCards: [
          { name: "World's best 5-min (top 5)", score: "~2,450", tier: TIERS_WOMEN[0] },
          { name: "WorldTour women's regular", score: "~1,850", tier: TIERS_WOMEN[1] },
          { name: "Continental / top amateur", score: "~1,350", tier: TIERS_WOMEN[2] },
          { name: "Competitive club", score: "~900", tier: TIERS_WOMEN[3] },
        ],
        note: "Women's benchmark anchored on a top-5 world 5-min power of 350 W at 50 kg = 2,450 W²/kg.",
      }
    : {
        rows: [
          { label: "WorldTour GC contenders", value: "~3,400–3,500", tier: TIERS_MEN[0] },
          { label: "U23 professional (mean)", value: "~3,000", tier: TIERS_MEN[1] },
          { label: "Continental / Cat 1", value: "~1,750–2,000", tier: TIERS_MEN[2] },
          { label: "Competitive club", value: "~1,100–1,400", tier: TIERS_MEN[3] },
        ],
        emptyCards: [
          { name: "WorldTour GC (Pogačar level)", score: "~3,500", tier: TIERS_MEN[0] },
          { name: "U23 Pro (mean)", score: "~3,000", tier: TIERS_MEN[1] },
          { name: "Continental / Elite", score: "~1,750", tier: TIERS_MEN[2] },
          { name: "Competitive club", score: "~1,200", tier: TIERS_MEN[3] },
        ],
        note: "Source: Leo, Spragg, Wakefield & Swart (2022), Journal of Science and Cycling; WattKG.com 144-pro database.",
      };

  return (
    <div className="min-h-screen bg-stone/10">

      {/* ── Hero ── */}
      <div className="relative bg-navy-deep overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-[center_35%] opacity-20"
          style={{ backgroundImage: "url('/hero-discover.jpg')" }} />
        <div className="absolute inset-0 bg-navy-deep/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <div className="inline-flex items-center gap-2 bg-coral/15 border border-coral/25 rounded-full px-4 py-1.5 mb-5">
            <svg className="w-3.5 h-3.5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-coral text-xs font-semibold uppercase tracking-wider">Free Tool</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-3">
            Compound Score Calculator
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl leading-relaxed">
            Find out where you rank against professional benchmarks — from recreational through to WorldTour level — using the peer-reviewed Leo &amp; Spragg methodology.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Inputs ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sex toggle */}
            <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-6 space-y-5">
              <div>
                <p className="block text-xs uppercase tracking-wider text-earth font-medium mb-3">
                  Category
                </p>
                <div className="flex rounded-xl overflow-hidden border border-stone/30">
                  <button
                    onClick={() => setSex("men")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      sex === "men"
                        ? "bg-navy-deep text-white"
                        : "bg-white text-earth hover:bg-stone/20"
                    }`}
                  >
                    Men
                  </button>
                  <button
                    onClick={() => setSex("women")}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l border-stone/30 ${
                      sex === "women"
                        ? "bg-navy-deep text-white"
                        : "bg-white text-earth hover:bg-stone/20"
                    }`}
                  >
                    Women
                  </button>
                </div>
              </div>

              <NumInput
                label="5-Minute Best Power"
                unit="W"
                value={fiveMin}
                onChange={setFiveMin}
                placeholder={sex === "women" ? "e.g. 280" : "e.g. 340"}
                hint="Your highest average power held for exactly 5 minutes — from a race, test, or hard training effort."
              />

              <NumInput
                label="Body Weight"
                unit="kg"
                value={weight}
                onChange={setWeight}
                placeholder={sex === "women" ? "e.g. 54" : "e.g. 68"}
                hint="Use your weight on race day, lightly clothed."
              />

              <div className="border-t border-stone/20 pt-5">
                <p className="text-[11px] uppercase tracking-wider text-earth/60 font-medium mb-4">
                  Optional — for extra insights
                </p>
                <NumInput
                  label="FTP"
                  unit="W"
                  value={ftp}
                  onChange={setFtp}
                  placeholder={sex === "women" ? "e.g. 235" : "e.g. 280"}
                  hint="Functional Threshold Power. Your estimated 1-hour best power, or 95% of your 20-min power test."
                />
              </div>
            </div>

            {/* Formula explainer */}
            <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-6">
              <h3 className="font-display text-base text-navy-deep mb-3">How it&apos;s calculated</h3>
              <div className="bg-cream-warm rounded-xl p-4 text-center mb-4">
                <p className="text-earth/60 text-xs uppercase tracking-wider mb-2">Formula</p>
                <p className="text-navy-deep font-mono text-sm font-semibold">
                  5-min Power (W) × 5-min W/kg
                </p>
                <p className="text-earth/50 text-xs mt-1">= W² / kg</p>
              </div>
              <p className="text-earth text-xs leading-relaxed mb-3">
                Published by <strong>Leo, Spragg, Wakefield &amp; Swart (2022)</strong> in the <em>Journal of Science and Cycling</em>, the compound score is the single metric with the highest predictive capacity for professional race success — outperforming FTP, absolute power, and W/kg individually.
              </p>
              <p className="text-earth text-xs leading-relaxed">
                It captures both aerodynamic ability (absolute watts) and climbing ability (W/kg) simultaneously — the two physical demands that decide races. The same formula applies equally to men and women.
              </p>
            </div>

            {/* Research benchmarks sidebar */}
            <div className="bg-navy-deep/5 border border-navy-deep/10 rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-earth/50 font-medium mb-2">
                {sex === "women" ? "Women's Benchmarks" : "Research Benchmarks"}
              </p>
              <div className="space-y-2 text-xs text-earth/70">
                {benchmarks.rows.map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span>{row.label}</span>
                    <span className={`font-mono font-bold ${row.tier.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              {sex === "women" && (
                <div className="mt-3 pt-3 border-t border-navy-deep/10">
                  <p className="text-[10px] text-earth/50 leading-relaxed">
                    <span className="font-semibold text-coral">Reference anchor:</span> A top-5 women&apos;s 5-min power globally — 350 W at 50 kg — yields a compound score of <span className="font-bold text-coral">2,450 W²/kg</span>.
                  </p>
                </div>
              )}
              <p className="text-[10px] text-earth/40 mt-3 leading-relaxed">
                {sex === "women"
                  ? "Men's benchmarks: Leo, Spragg, Wakefield & Swart (2022), Journal of Science and Cycling. Women's thresholds calibrated from observed WorldTour performance data."
                  : "Source: Leo, Spragg, Wakefield & Swart (2022), Journal of Science and Cycling; WattKG.com 144-pro database."}
              </p>
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div className="lg:col-span-3 space-y-5">
            {results ? (
              <>
                {/* Score card */}
                <div className={`bg-white rounded-2xl border-2 ${results.tier.border} shadow-sm p-8`}>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-earth/60 text-xs uppercase tracking-wider mb-1">Your Compound Score</p>
                      <div className={`font-display text-7xl font-bold ${results.tier.color} leading-none`}>
                        {results.compoundScore.toLocaleString()}
                      </div>
                      <p className="text-earth/50 text-sm mt-1">W² / kg</p>
                    </div>
                    <div className={`${results.tier.bgLight} ${results.tier.border} border rounded-2xl px-5 py-3 text-center shrink-0`}>
                      <div className={`font-display text-xl font-bold ${results.tier.color}`}>
                        {results.tier.label}
                      </div>
                      <div className="text-earth/60 text-[11px] mt-0.5">{results.tier.sublabel}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-earth/40 mb-1.5">
                      {tickLabels.map((t) => <span key={t}>{t}</span>)}
                    </div>
                    <div className="h-3 rounded-full bg-stone/20 relative overflow-hidden">
                      {/* Tier bands */}
                      <div className="absolute inset-0 flex">
                        {tierBands.map((b, i) => (
                          <div key={i} className={b.cls} style={{ width: `${b.pct}%` }} />
                        ))}
                        <div className="bg-coral/25 flex-1" />
                      </div>
                      {/* Score marker */}
                      <div
                        className={`absolute top-0 bottom-0 w-1 ${results.tier.bar} rounded-full shadow-sm`}
                        style={{ left: `${results.barPct}%`, transform: "translateX(-50%)" }}
                      />
                    </div>
                    {/* Your position label */}
                    <div className="relative mt-1" style={{ paddingLeft: `${Math.min(results.barPct, 88)}%` }}>
                      <span className={`text-[10px] font-semibold ${results.tier.color} whitespace-nowrap`}>↑ You</span>
                    </div>
                  </div>

                  <p className="text-earth text-sm leading-relaxed mt-5 pt-5 border-t border-stone/15">
                    {results.tier.desc}
                  </p>
                </div>

                {/* Metric breakdown */}
                <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-6">
                  <h3 className="font-display text-base text-navy-deep mb-4">Metric Breakdown</h3>
                  <div className={`grid ${results.ftpPerKg ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"} gap-3`}>
                    <div className="bg-cream-warm rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-earth mb-1">5-min Power</p>
                      <p className="text-navy-deep font-bold text-xl">{fiveMinNum}W</p>
                    </div>
                    <div className="bg-cream-warm rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-earth mb-1">5-min W/kg</p>
                      <p className="text-navy-deep font-bold text-xl">{results.fiveMinPerKg.toFixed(2)}</p>
                    </div>
                    <div className="bg-cream-warm rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-earth mb-1">Weight</p>
                      <p className="text-navy-deep font-bold text-xl">{weightNum}kg</p>
                    </div>
                    {results.ftpPerKg && (
                      <div className="bg-cream-warm rounded-xl p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-earth mb-1">FTP W/kg</p>
                        <p className="text-navy-deep font-bold text-xl">{results.ftpPerKg.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tier ladder */}
                <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-6">
                  <h3 className="font-display text-base text-navy-deep mb-1">How you compare</h3>
                  <p className="text-earth/50 text-xs mb-4">
                    {sex === "women"
                      ? "Women's benchmarks — anchored on a top-5 world 5-min power of 350 W at 50 kg"
                      : "Based on Leo, Spragg, Wakefield & Swart (2022)"}
                  </p>
                  <div className="space-y-2">
                    {[...tiers].reverse().map((t) => {
                      const isYou = results.tier.label === t.label;
                      const rangeLabel = t.max === Infinity
                        ? `${t.min.toLocaleString()}+`
                        : `${t.min.toLocaleString()}–${t.max.toLocaleString()}`;
                      return (
                        <div
                          key={t.label}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                            isYou ? `${t.bgLight} border ${t.border}` : "bg-stone/5"
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.bg}`} />
                          <span className={`font-semibold text-sm flex-1 ${isYou ? t.color : "text-earth/70"}`}>
                            {t.label}
                          </span>
                          <span className="text-earth/50 text-xs font-mono">{rangeLabel}</span>
                          <span className="text-earth/40 text-[11px] flex-1 text-right hidden sm:block">{t.sublabel}</span>
                          {isYou && (
                            <span className={`text-[10px] font-bold ${t.color} uppercase tracking-wide`}>← You</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-navy-deep rounded-2xl p-6 text-center">
                  <p className="text-white font-display text-lg mb-1">Save your score to your profile</p>
                  <p className="text-white/50 text-sm mb-5 leading-relaxed">
                    Create an AthleticLinq profile so scouts can find you based on your compound score.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/signup/athlete"
                      className="bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
                    >
                      Create Athlete Profile
                    </Link>
                    <Link
                      href="/login"
                      className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
                    >
                      Log In to Save
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* ── Empty state ── */
              <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-coral/8 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-coral/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-navy-deep mb-2">Enter your numbers</h3>
                <p className="text-earth text-sm leading-relaxed max-w-xs mx-auto">
                  Add your 5-minute power and body weight to calculate your compound score and see where you rank.
                </p>

                {/* Real-world reference scores */}
                <div className="mt-8 grid grid-cols-2 gap-3 text-left">
                  {benchmarks.emptyCards.map((ex) => (
                    <div key={ex.name} className={`${ex.tier.bgLight} border ${ex.tier.border} rounded-xl px-3 py-2.5`}>
                      <div className={`text-xs font-bold ${ex.tier.color}`}>{ex.score}</div>
                      <div className="text-earth/60 text-[11px] mt-0.5">{ex.name}</div>
                    </div>
                  ))}
                </div>

                {sex === "women" && (
                  <div className="mt-4 bg-coral/5 border border-coral/15 rounded-xl px-4 py-3">
                    <p className="text-[11px] text-earth/60 leading-relaxed">
                      <span className="font-semibold text-coral">Women&apos;s reference:</span> A top-5 world 5-min power — 350 W at 50 kg — produces a compound score of{" "}
                      <span className="font-bold text-coral">2,450 W²/kg</span>, used to calibrate these benchmarks.
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-earth/35 mt-4">
                  {sex === "women"
                    ? "Men's research: Leo et al. (2022), Journal of Science and Cycling. Women's tiers calibrated from observed professional performance data."
                    : "Source: Leo et al. (2022), Journal of Science and Cycling"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
