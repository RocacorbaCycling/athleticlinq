"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-navy-deep">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-[center_35%] opacity-30"
          style={{ backgroundImage: "url('/hero-home.jpg')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/60 via-navy-deep/40 to-navy-deep" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #c83c5a 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative z-10 w-full max-w-4xl text-center py-32">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 bg-coral/15 border border-coral/30 rounded-full px-5 py-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse shrink-0" />
            <span className="text-coral text-xs font-semibold uppercase tracking-widest">Now Live</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.08] mb-6">
            Where cycling talent
            <br />
            meets{" "}
            <span className="text-coral italic font-accent text-6xl sm:text-7xl lg:text-8xl">
              opportunity
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-white/55 text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light">
            The global platform connecting talented cyclists with professional teams, scouts, and agents — wherever in the world they are.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup/athlete"
              className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 rounded-full transition-colors text-sm w-full sm:w-auto text-center"
            >
              Create Athlete Profile →
            </Link>
            <Link
              href="/discover"
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-colors text-sm w-full sm:w-auto text-center"
            >
              Discover Athletes
            </Link>
          </div>

          {/* Feature strip */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-16">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                label: "Power Profiles",
                desc: "FTP, W/kg & compound scores",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                label: "Profile Videos",
                desc: "Showcase your riding style",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                ),
                label: "Global Network",
                desc: "Scouts from around the world",
              },
            ].map((f) => (
              <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center mx-auto mb-3 text-coral">
                  {f.icon}
                </div>
                <div className="text-white text-xs font-semibold mb-1">{f.label}</div>
                <div className="text-white/35 text-[11px] leading-snug">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-cream py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-coral text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-display text-3xl sm:text-4xl text-navy mb-4">Simple. Transparent. Global.</h2>
            <p className="text-earth max-w-lg mx-auto text-sm leading-relaxed">
              Whether you&apos;re a rider looking for your breakthrough or a scout searching for the next generation of talent — AthleticLinq makes the connection.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {/* Athletes */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone/30">
              <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-navy mb-2">For Athletes</h3>
              <p className="text-earth text-sm mb-6 leading-relaxed">Build your profile once and get discovered by scouts from UCI WorldTour teams, development squads, and agencies around the world.</p>
              <ol className="space-y-3 text-sm text-earth">
                {[
                  "Create your free profile with power data, video & bio",
                  "Your compound score ranks you against riders globally",
                  "Scouts find you — no chasing required",
                  "See which scouts have viewed your profile",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-coral/10 text-coral text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link href="/signup/athlete"
                className="mt-8 inline-flex items-center gap-2 bg-coral text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-coral/90 transition-colors">
                Create Profile — Free
              </Link>
            </div>

            {/* Scouts */}
            <div className="bg-navy-deep rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-white mb-2">For Scouts & Teams</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">Filter hundreds of athletes by power output, compound score, age, discipline and region. Find riders you&apos;d never have found any other way.</p>
              <ol className="space-y-3 text-sm text-white/70">
                {[
                  "Apply for a verified scout account",
                  "Access full power data, compound scores & video",
                  "Filter by W/kg, age category, discipline & region",
                  "Send shortlist invitations and make contact directly",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-coral text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link href="/signup/scout"
                className="mt-8 inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors">
                Apply for Scout Access
              </Link>
            </div>

            {/* Parents & Guardians */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone/30 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-navy/8 flex items-center justify-center mb-6 border border-stone/20">
                <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-navy mb-2">For Parents & Guardians</h3>
              <p className="text-earth text-sm mb-6 leading-relaxed">Your junior rider&apos;s career starts young. Create a linked guardian account so you stay in control of every scout approach — nothing happens without your approval.</p>
              <ol className="space-y-3 text-sm text-earth">
                {[
                  "Link to your child's athlete profile",
                  "All scout invitations route through you first",
                  "Approve or decline every approach on their behalf",
                  "Full visibility — see who's watching their profile",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-navy/8 text-navy text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-stone/30">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link href="/signup/parent"
                className="mt-8 inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-navy/90 transition-colors">
                Create Guardian Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPOUND SCORE ─────────────────────────────────────────────────── */}
      <section className="bg-navy-deep py-24 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #c83c5a 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-coral text-xs font-semibold uppercase tracking-widest mb-3">Our Metric</p>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-5 leading-tight">
                The Compound Score — a single number that says everything
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                We combine 5-minute peak power with power-to-weight ratio to produce one objective ranking score. No subjectivity. No politics. Just data.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 font-mono text-sm">
                <p className="text-white/40 mb-1 text-xs">Formula</p>
                <p className="text-coral text-base">5-min Power (W) × W/kg</p>
                <p className="text-white/30 text-xs mt-2">= W²/kg  ·  the Compound Score</p>
              </div>
              <Link href="/compound-score"
                className="inline-flex items-center gap-2 text-coral hover:text-coral/80 text-sm font-semibold transition-colors">
                Calculate your score →
              </Link>
            </div>

            {/* Score tiers visual — benchmarks: Leo, Spragg, Wakefield & Swart (2022) */}
            <div className="space-y-3">
              {[
                { label: "WorldTour", range: "3,450+", pct: 100, color: "bg-coral", sub: "GC contender ~3,500" },
                { label: "Professional", range: "2,700–3,449", pct: 78, color: "bg-coral/80", sub: "U23 Pro mean ~3,000" },
                { label: "Elite", range: "1,900–2,699", pct: 54, color: "bg-coral/55", sub: "Continental / Cat 1" },
                { label: "Competitive", range: "1,200–1,899", pct: 34, color: "bg-coral/35", sub: "Club racer / Cat 2–3" },
                { label: "Recreational", range: "< 1,200", pct: 16, color: "bg-white/20", sub: "Fitness cyclist" },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center gap-4">
                  <div className="w-28 text-right shrink-0">
                    <p className="text-white text-xs font-medium">{tier.label}</p>
                    <p className="text-white/30 text-[10px]">{tier.range}</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div className={`${tier.color} h-2 rounded-full transition-all`} style={{ width: `${tier.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────────────── */}
      <section className="bg-cream-warm py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-coral text-xs font-semibold uppercase tracking-widest mb-4">Our Mission</p>
          <h2 className="font-display text-3xl sm:text-4xl text-navy mb-6 leading-tight">
            Talent has no postcode
          </h2>
          <p className="text-earth text-base leading-relaxed mb-4">
            The next Egan Bernal grew up at altitude in Colombia. The next Biniam Girmay rode on roads no scout had ever visited. AthleticLinq exists to make sure talent like that is never overlooked because of geography.
          </p>
          <p className="text-earth/70 text-sm leading-relaxed mb-10">
            Athletes always join free. We keep it that way deliberately — because limiting access by income means limiting what the sport can become.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup/athlete"
              className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-sm">
              Join as an Athlete — Free
            </Link>
            <Link href="/pricing"
              className="text-navy hover:text-coral font-semibold text-sm transition-colors">
              Scout & Team pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative bg-navy-deep py-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/hero-discover.jpg')" }}
        />
        <div className="absolute inset-0 bg-navy-deep/60" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-5">
            Ready to find your next signing?
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Browse verified athlete profiles with full power data, compound scores, race history, and highlight videos — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/discover"
              className="bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-4 rounded-full transition-colors text-sm w-full sm:w-auto text-center">
              Browse Athletes →
            </Link>
            <Link href="/for-scouts"
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-colors text-sm w-full sm:w-auto text-center">
              Learn More
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
