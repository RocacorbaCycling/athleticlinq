import Link from "next/link";
import { athletes } from "@/data/athletes";
import AthleteCard from "@/components/AthleteCard";

export default function ForScoutsPage() {
  const topAthletes = [...athletes]
    .sort((a, b) => b.compoundScore - a.compoundScore)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <section className="relative bg-navy-deep py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_25%]"
          style={{ backgroundImage: "url('/hero-discover.jpg')" }}
        />
        <div className="absolute inset-0 bg-navy-deep/70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-coral text-sm font-medium">
                For Teams, Scouts & Agents
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              Find your next
              <br />
              <span className="text-coral italic font-accent text-5xl sm:text-6xl lg:text-7xl">
                champion
              </span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mb-8 leading-relaxed">
              Access verified power data, compound scores, race histories,
              and profile videos for thousands of emerging cyclists worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/discover"
                className="bg-coral hover:bg-coral-light text-white font-medium px-8 py-3.5 rounded-full transition-colors text-center text-sm"
              >
                Browse Athletes
              </Link>
              <button className="border border-white/20 hover:border-white/40 text-white font-medium px-8 py-3.5 rounded-full transition-colors text-sm">
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl text-navy mb-3">
              Why scouts choose AthleticLinq
            </h2>
            <p className="text-earth text-lg max-w-2xl mx-auto">
              Stop relying on word of mouth. Data-driven scouting for the modern
              peloton.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Power Data",
                desc: "Every athlete's numbers are self-reported and backed by Strava activity history. Scouts can click through to verify rides directly.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: "Compound Score",
                desc: "Based on the Wakefield & Leo methodology: 5-min power \u00d7 W/kg (W\u00b2/kg). One number that captures both aerodynamic and climbing ability.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: "Profile Videos",
                desc: "See athletes in action. Short-form videos let you assess riding style, group dynamics, and personality before making contact.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-stone/30"
              >
                <div className="w-14 h-14 rounded-xl bg-navy-deep/5 flex items-center justify-center text-navy mb-5">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl text-navy mb-3">
                  {item.title}
                </h3>
                <p className="text-earth text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtering demo */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mb-4">
                Advanced filtering that finds exactly who you need
              </h2>
              <p className="text-earth text-lg leading-relaxed mb-6">
                Filter by W/kg, age, nationality, discipline, compound
                score, and more. Build shortlists and compare athletes
                side-by-side.
              </p>
              <ul className="space-y-3">
                {[
                  "Filter by power-to-weight ratio, FTP, sprint power",
                  "Age range (16-25) and category (Junior, U23)",
                  "Nationality and geographic region",
                  "Discipline: climber, sprinter, TT, classics, GC",
                  "Compound score thresholds",
                  "Strava connected vs. self-reported",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-warm-black"
                  >
                    <svg
                      className="w-4 h-4 text-coral flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock filter UI */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-coral"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-navy text-sm">
                    Smart Filters
                  </div>
                  <div className="text-xs text-earth">
                    3 filters active &middot; 12 results
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-cream-warm rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider text-earth mb-2">
                    W/kg Range
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-stone rounded-full overflow-hidden">
                      <div className="h-full bg-coral rounded-full" style={{ width: "75%" }} />
                    </div>
                    <span className="text-sm font-bold text-navy">5.0+</span>
                  </div>
                </div>

                <div className="bg-cream-warm rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider text-earth mb-2">
                    Age
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-navy text-white px-2.5 py-1 rounded-full">16-18</span>
                    <span className="text-xs bg-navy text-white px-2.5 py-1 rounded-full">19-21</span>
                    <span className="text-xs bg-stone text-earth px-2.5 py-1 rounded-full">22-25</span>
                  </div>
                </div>

                <div className="bg-cream-warm rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider text-earth mb-2">
                    Discipline
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-coral text-white px-2.5 py-1 rounded-full">Climber</span>
                    <span className="text-xs bg-stone text-earth px-2.5 py-1 rounded-full">Sprinter</span>
                    <span className="text-xs bg-stone text-earth px-2.5 py-1 rounded-full">TT</span>
                    <span className="text-xs bg-stone text-earth px-2.5 py-1 rounded-full">GC</span>
                  </div>
                </div>

                <div className="bg-cream-warm rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider text-earth mb-2">
                    Min Compound Score
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-stone rounded-full overflow-hidden">
                      <div className="h-full bg-olive rounded-full" style={{ width: "85%" }} />
                    </div>
                    <span className="text-sm font-bold text-navy">85+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Athletes Preview */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mb-2">
                Top Rated Athletes
              </h2>
              <p className="text-earth">
                Highest compound scores on the platform
              </p>
            </div>
            <Link
              href="/discover"
              className="hidden sm:inline-flex items-center gap-2 text-coral text-sm font-medium hover:gap-3 transition-all"
            >
              View all
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topAthletes.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl text-navy mb-3">
              Plans for every team
            </h2>
            <p className="text-earth text-lg max-w-2xl mx-auto">
              From individual scouts to WorldTour teams, we have a plan that
              fits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Scout",
                price: "Free",
                period: "",
                desc: "For individual scouts and agents",
                features: [
                  "Browse all athlete profiles",
                  "View compound scores",
                  "Basic filtering",
                  "5 shortlist spots",
                ],
                cta: "Get Started",
                featured: false,
              },
              {
                name: "Pro Scout",
                price: "\u20ac49",
                period: "/month",
                desc: "For serious scouts and small teams",
                features: [
                  "Everything in Scout",
                  "Advanced filtering & sorting",
                  "Unlimited shortlists",
                  "Direct athlete messaging",
                  "Full Strava & Instagram data access",
                  "Export reports",
                ],
                cta: "Start Free Trial",
                featured: true,
              },
              {
                name: "Team",
                price: "Custom",
                period: "",
                desc: "For professional teams and federations",
                features: [
                  "Everything in Pro Scout",
                  "Multi-user dashboard",
                  "API access",
                  "Custom compound score weights",
                  "Priority support",
                  "Bulk athlete comparison",
                ],
                cta: "Contact Sales",
                featured: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.featured
                    ? "bg-navy-deep text-white shadow-xl ring-2 ring-coral scale-105"
                    : "bg-white shadow-sm border border-stone/30"
                }`}
              >
                <h3
                  className={`font-display text-xl mb-1 ${
                    plan.featured ? "text-white" : "text-navy"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.featured ? "text-white/60" : "text-earth"
                  }`}
                >
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span
                    className={`text-4xl font-display ${
                      plan.featured ? "text-white" : "text-navy"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${
                        plan.featured ? "text-white/60" : "text-earth"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg
                        className={`w-4 h-4 flex-shrink-0 ${
                          plan.featured ? "text-coral" : "text-olive"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className={plan.featured ? "text-white/80" : ""}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-full text-sm font-medium transition-colors ${
                    plan.featured
                      ? "bg-coral hover:bg-coral-light text-white"
                      : "border border-navy/20 hover:border-navy/40 text-navy"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-navy-deep">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Ready to discover the next generation?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Join 120+ teams already scouting on AthleticLinq.
          </p>
          <Link
            href="/discover"
            className="bg-coral hover:bg-coral-light text-white font-medium px-10 py-4 rounded-full transition-colors inline-block text-sm"
          >
            Start Scouting Now
          </Link>
        </div>
      </section>
    </div>
  );
}
