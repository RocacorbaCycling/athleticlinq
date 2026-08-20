"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, isAthlete } from "@/context/AuthContext";

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const athleteFeatures = [
  { text: "Full performance profile (FTP, W/kg, compound score)", free: true, pro: true },
  { text: "Profile video upload", free: true, pro: true },
  { text: "Strava & Instagram integration", free: true, pro: true },
  { text: "Discoverable by all verified scouts globally", free: true, pro: true },
  { text: "Compound score & tier ranking", free: true, pro: true },
  { text: "Scout view count (\"3 scouts viewed this month\")", free: true, pro: true },
  { text: "See exactly which scouts viewed your profile", free: false, pro: true },
  { text: "Profile highlighted in scout search results", free: false, pro: true },
  { text: "Instant notification when a scout views you", free: false, pro: true },
  { text: "Priority verification badge", free: false, pro: true },
];

const scoutFeatures = [
  { text: "Full power data & compound scores", pro: true, team: true, agency: true },
  { text: "Contact athletes directly", pro: true, team: true, agency: true },
  { text: "Athlete shortlists", pro: true, team: true, agency: true },
  { text: "Advanced filters (W/kg, age, region, discipline)", pro: true, team: true, agency: true },
  { text: "Seats", pro: "1 seat", team: "5 seats", agency: "Unlimited" },
  { text: "Export talent pool as CSV", pro: false, team: true, agency: true },
  { text: "Branded scout profile visible to athletes", pro: false, team: true, agency: true },
  { text: "Multi-sport talent pipeline reports", pro: false, team: false, agency: true },
  { text: "National federation / white-label licence", pro: false, team: false, agency: true },
  { text: "Dedicated account manager", pro: false, team: false, agency: true },
];

const faqs = [
  {
    q: "Will athletes from developing countries ever have to pay?",
    a: "No — never. Every athlete on the planet can create a complete profile, be fully discoverable by scouts, and appear in search results at no cost, forever. AthleticLinq is built on the belief that talent has no postcode. The platform's revenue comes entirely from the scouts and teams who are searching for that talent.",
  },
  {
    q: "Why do scouts pay and athletes don't?",
    a: "Scouts and teams derive direct commercial value from the platform — they find their next signing, reduce recruitment costs, and gain a global talent edge. Athletes gain opportunity. Charging athletes would reduce the talent pool, which makes the platform less valuable for scouts. Both sides win when athletes join for free.",
  },
  {
    q: "What does 'Scout Pro' include exactly?",
    a: "Scout Pro gives you full access to every athlete's power data, W/kg figures, compound scores, profile videos, and Strava activity history. You can contact any athlete directly, build shortlists, and filter the entire database by discipline, age, region, weight, and performance metrics.",
  },
  {
    q: "Is there a free trial for scouts?",
    a: "Yes — every new scout account starts with a 7-day free trial, no credit card required. You get full access to all Scout Pro features from the moment you sign up.",
  },
  {
    q: "Can a national federation use AthleticLinq?",
    a: "Yes — the Agency & Federation tier is designed for governing bodies, multi-nation academies, and large management companies. This includes custom onboarding, data export, talent pipeline reporting, and optional white-labelling. Contact us to discuss.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes, you can cancel at any time from your dashboard — no minimum term, no cancellation fees. You'll retain access until the end of your current billing period.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { user } = useAuth();
  const athleteLoggedIn = isAthlete(user);

  async function handleAthleteUpgrade() {
    if (!athleteLoggedIn || !user) {
      window.location.href = "/signup/athlete";
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userType: "athlete", email: user.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      window.location.href = "/dashboard";
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone/10">

      {/* ── Hero ── */}
      <div className="relative bg-navy-deep overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-[center_35%] opacity-20"
          style={{ backgroundImage: "url('/hero-discover.jpg')" }} />
        <div className="absolute inset-0 bg-navy-deep/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-olive/15 border border-olive/30 rounded-full px-5 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-olive animate-pulse shrink-0" />
            <span className="text-olive text-xs font-semibold uppercase tracking-widest">Live — scouts get 7 days free</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">
            Simple, fair pricing
          </h1>
          <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">
            Athletes are always free — no matter where in the world they come from. Scouts and teams pay for access to the talent pool.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">

        {/* ── Athletes section ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-navy-deep mb-3">For Athletes</h2>
            <p className="text-earth text-base max-w-xl mx-auto leading-relaxed">
              Your profile is your CV. We never charge you to be discovered — the platform only works if the world's best undiscovered talent can be found on it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-stone/30 shadow-sm p-8">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-widest text-earth/60 font-semibold mb-2">Athlete</div>
                <div className="font-display text-5xl text-navy-deep mb-1">Free</div>
                <div className="text-earth/60 text-sm">Forever. No credit card.</div>
              </div>
              <ul className="space-y-3 mb-8">
                {athleteFeatures.map((f) => (
                  <li key={f.text} className={`flex items-start gap-3 text-sm ${f.free ? "text-warm-black" : "text-earth/35 line-through"}`}>
                    <span className={`shrink-0 mt-0.5 ${f.free ? "text-olive" : "text-stone/40"}`}>
                      {f.free ? <CheckIcon /> : <CrossIcon />}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link href="/signup/athlete"
                className="block w-full text-center bg-navy-deep hover:bg-navy-deep/90 text-white font-semibold py-3 rounded-full transition-colors text-sm">
                Create Free Profile
              </Link>
            </div>

            {/* Athlete Pro */}
            <div className="bg-coral rounded-2xl shadow-lg p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-2">Athlete Pro</div>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="font-display text-5xl text-white">€3.99</span>
                    <span className="text-white/60 text-sm mb-2">/month</span>
                  </div>
                  <div className="text-white/60 text-sm">Optional — never required to be discovered</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {athleteFeatures.map((f) => (
                    <li key={f.text} className={`flex items-start gap-3 text-sm ${f.pro ? "text-white" : "text-white/30 line-through"}`}>
                      <span className={`shrink-0 mt-0.5 ${f.pro ? "text-white" : "text-white/25"}`}>
                        {f.pro ? <CheckIcon /> : <CrossIcon />}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  className="block w-full text-center bg-white text-coral font-semibold py-3 rounded-full transition-colors text-sm hover:bg-white/90 disabled:opacity-60"
                  onClick={handleAthleteUpgrade}
                  disabled={checkingOut}
                >
                  {checkingOut ? "Loading…" : athleteLoggedIn ? "Upgrade to Pro" : "Get Athlete Pro →"}
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility note */}
          <div className="mt-8 max-w-3xl mx-auto bg-olive/8 border border-olive/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-olive/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <div>
              <p className="text-olive font-semibold text-sm mb-1">Our commitment to global access</p>
              <p className="text-earth text-sm leading-relaxed">
                Some of the most talented cyclists in the world come from Colombia, Ethiopia, Kenya, Eritrea, and across Southeast Asia — regions where professional scouting rarely reaches. AthleticLinq exists to change that. Every athlete, everywhere, is fully discoverable for free. The Athlete Pro tier is an optional extra for those who want additional visibility tools — it never affects a rider&apos;s chance of being found.
              </p>
            </div>
          </div>
        </section>

        {/* ── Scouts section ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-navy-deep mb-3">For Scouts &amp; Teams</h2>
            <p className="text-earth text-base max-w-xl mx-auto leading-relaxed">
              Full access to the world&apos;s most data-rich cycling talent database. Filter by power, W/kg, discipline, region, and age — then contact athletes directly.
            </p>
            <div className="inline-flex items-center gap-2 bg-olive/10 border border-olive/25 rounded-full px-4 py-2 mt-4">
              <svg className="w-3.5 h-3.5 text-olive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-earth text-xs font-medium">
                New scouts get a <strong>7-day free trial</strong> — no credit card required.
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Scout Pro */}
            <div className="bg-white rounded-2xl border-2 border-coral/20 shadow-sm p-7 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-coral text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
                  Most popular
                </span>
              </div>
              <div className="mb-6 pt-3">
                <div className="text-xs uppercase tracking-widest text-earth/60 font-semibold mb-2">Scout Pro</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-4xl text-navy-deep">€9.99</span>
                  <span className="text-earth/60 text-sm mb-1">/month</span>
                </div>
                <div className="text-earth/50 text-xs">Individual scout or talent manager · 7-day free trial</div>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm">
                {scoutFeatures.map((f) => {
                  const val = f.pro;
                  const isString = typeof val === "string";
                  return (
                    <li key={f.text} className={`flex items-start gap-2.5 ${val ? "text-warm-black" : "text-earth/30 line-through"}`}>
                      <span className={`shrink-0 mt-0.5 ${val ? "text-coral" : "text-stone/30"}`}>
                        {val ? <CheckIcon /> : <CrossIcon />}
                      </span>
                      <span>{isString ? `${f.text}: ${val}` : f.text}</span>
                    </li>
                  );
                })}
              </ul>
              <Link href="/signup/scout"
                className="block w-full text-center bg-coral hover:bg-coral/90 text-white font-semibold py-3 rounded-full transition-colors text-sm">
                Apply as Scout
              </Link>
            </div>

            {/* Team */}
            <div className="bg-navy-deep rounded-2xl shadow-lg p-7">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-widest text-white/50 font-semibold mb-2">Team Manager</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display text-4xl text-white">£99</span>
                  <span className="text-white/50 text-sm mb-1">/month</span>
                </div>
                <div className="text-white/40 text-xs">Continental to WorldTour teams</div>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm">
                {scoutFeatures.map((f) => {
                  const val = f.team;
                  const isString = typeof val === "string";
                  return (
                    <li key={f.text} className={`flex items-start gap-2.5 ${val ? "text-white" : "text-white/25 line-through"}`}>
                      <span className={`shrink-0 mt-0.5 ${val ? "text-olive" : "text-white/20"}`}>
                        {val ? <CheckIcon /> : <CrossIcon />}
                      </span>
                      <span>{isString ? `${f.text}: ${val}` : f.text}</span>
                    </li>
                  );
                })}
              </ul>
              <a href="mailto:hello@athleticlinq.com?subject=AthleticLinq Team Plan"
                className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-full transition-colors text-sm">
                Contact Us
              </a>
            </div>

            {/* Agency */}
            <div className="bg-white rounded-2xl border border-stone/30 shadow-sm p-7">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-widest text-earth/60 font-semibold mb-2">Agency &amp; Federation</div>
                <div className="font-display text-4xl text-navy-deep mb-1">Custom</div>
                <div className="text-earth/50 text-xs">Federations, agencies &amp; large organisations</div>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm">
                {scoutFeatures.map((f) => {
                  const val = f.agency;
                  const isString = typeof val === "string";
                  return (
                    <li key={f.text} className={`flex items-start gap-2.5 ${val ? "text-warm-black" : "text-earth/30 line-through"}`}>
                      <span className={`shrink-0 mt-0.5 ${val ? "text-navy-deep" : "text-stone/30"}`}>
                        {val ? <CheckIcon /> : <CrossIcon />}
                      </span>
                      <span>{isString ? `${f.text}: ${val}` : f.text}</span>
                    </li>
                  );
                })}
              </ul>
              <a href="mailto:hello@athleticlinq.com?subject=AthleticLinq Agency%2FFederation"
                className="block w-full text-center bg-navy-deep hover:bg-navy-deep/90 text-white font-semibold py-3 rounded-full transition-colors text-sm">
                Get in Touch
              </a>
            </div>
          </div>
        </section>

        {/* ── Mission statement ── */}
        <section className="relative bg-navy-deep rounded-3xl overflow-hidden px-8 sm:px-14 py-14 text-center">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "radial-gradient(circle, #c83c5a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <svg className="w-10 h-10 text-coral mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Talent has no postcode
            </h2>
            <p className="text-white/55 text-base leading-relaxed mb-6">
              The next Egan Bernal, Nairo Quintana, or Biniam Girmay might be training on a dirt road right now with no scout ever likely to pass through. AthleticLinq puts them in the same room — digitally — as every WorldTour team on the planet. That only works if they can join for free.
            </p>
            <p className="text-white/35 text-sm">
              All revenue comes from scouts and teams who gain commercial value from the platform.
              Athletes — everywhere, always — are free to be discovered.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <h2 className="font-display text-3xl text-navy-deep text-center mb-8">Frequently asked questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone/20 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-navy-deep text-sm leading-snug">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-earth/50 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-earth text-sm leading-relaxed border-t border-stone/10 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="text-center pb-6">
          <h2 className="font-display text-2xl text-navy-deep mb-3">Ready to get started?</h2>
          <p className="text-earth text-sm mb-6">Athletes join free. Scouts get 7 days free, no card needed.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup/athlete"
              className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm">
              Join as Athlete — Free
            </Link>
            <Link href="/signup/scout"
              className="bg-navy-deep hover:bg-navy-deep/90 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm">
              Apply as Scout
            </Link>
            <a href="mailto:hello@athleticlinq.com"
              className="border border-stone/40 hover:border-navy-deep/30 text-earth font-semibold px-8 py-3 rounded-full transition-colors text-sm">
              Talk to us
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
