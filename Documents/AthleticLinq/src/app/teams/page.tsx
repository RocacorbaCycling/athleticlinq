"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Team {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  organization: string;
  orgType: string;
  country: string;
  website?: string;
  disciplines: string[];
  categories: string[];
  regions: string[];
  verified: boolean;
}

const ORG_TYPE_LABELS: Record<string, string> = {
  "worldtour-team": "WorldTour Team",
  "pro-conti": "Pro Continental",
  "continental": "Continental Team",
  "national-federation": "National Federation",
  "development-squad": "Development Squad",
  "academy": "Academy",
  "agent": "Agent / Agency",
  "other": "Organisation",
};

const DISCIPLINE_FILTERS = [
  "All",
  "Road",
  "Track",
  "MTB",
  "Gravel",
  "Cyclocross",
  "Time Trial",
];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("scouts")
        .select("id, profile, verified")
        .eq("verified", true);

      if (data) {
        setTeams(
          data.map((row) => ({
            id: row.id,
            verified: row.verified,
            ...row.profile,
          }))
        );
      }
      setLoading(false);
    }
    fetchTeams();
  }, []);

  const filtered = teams.filter((t) => {
    const matchesSearch =
      !search ||
      t.organization.toLowerCase().includes(search.toLowerCase()) ||
      t.country.toLowerCase().includes(search.toLowerCase());
    const matchesDiscipline =
      filter === "All" ||
      t.disciplines?.some((d) =>
        d.toLowerCase().includes(filter.toLowerCase())
      );
    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="min-h-screen bg-stone/10">
      {/* Header */}
      <div className="bg-navy-deep relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #c83c5a 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/"
              className="text-white/40 hover:text-white/70 text-sm transition-colors flex items-center gap-1.5"
            >
              Home
            </Link>
            <span className="text-white/20 text-sm">·</span>
            <span className="text-white/60 text-sm">Teams & Scouts</span>
          </div>
          <p className="text-coral text-xs font-semibold uppercase tracking-widest mb-3">
            Team Directory
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">
            Verified teams & scouts
          </h1>
          <p className="text-white/50 text-sm max-w-xl leading-relaxed">
            Every organisation on this list is verified by the AthleticLinq
            team. Riders — explore who&apos;s actively recruiting in your
            discipline, region, and category.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone/20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search team or country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 w-full sm:w-auto px-4 py-2 rounded-full border border-stone/40 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {DISCIPLINE_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === d
                    ? "bg-coral text-white"
                    : "bg-stone/20 text-earth hover:bg-stone/40"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center text-earth/50 text-sm py-20">
            Loading teams…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-earth/50 text-sm mb-2">No verified teams yet</p>
            <p className="text-earth/30 text-xs">
              Scouts are verified on a rolling basis — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl border border-stone/30 shadow-sm p-5 hover:shadow-md hover:border-coral/20 transition-all"
              >
                {/* Logo placeholder + verified badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-deep/5 border border-stone/20 flex items-center justify-center">
                    <span className="text-navy-deep font-display text-lg font-bold">
                      {team.organization?.[0] ?? "?"}
                    </span>
                  </div>
                  <span className="bg-olive/10 text-olive text-[10px] font-semibold px-2 py-0.5 rounded-full border border-olive/20 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                    Verified
                  </span>
                </div>

                <h3 className="font-display text-base text-navy-deep mb-0.5 leading-snug">
                  {team.organization}
                </h3>
                <p className="text-earth/60 text-xs mb-3">
                  {ORG_TYPE_LABELS[team.orgType] ?? team.orgType} · {team.country}
                </p>

                {/* Disciplines */}
                {team.disciplines?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {team.disciplines.slice(0, 4).map((d) => (
                      <span
                        key={d}
                        className="text-[10px] uppercase tracking-wider text-coral bg-coral/8 px-2 py-0.5 rounded-full"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {/* Categories */}
                {team.categories?.length > 0 && (
                  <p className="text-earth/50 text-xs mb-4">
                    Looking for:{" "}
                    <span className="text-warm-black font-medium">
                      {team.categories.join(", ")}
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-stone/10">
                  <Link
                    href="/discover"
                    className="flex-1 text-center text-xs font-semibold text-coral hover:text-coral/80 transition-colors"
                  >
                    View athletes they scout
                  </Link>
                  {team.website && (
                    <a
                      href={team.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-earth/40 hover:text-earth/70 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA for scouts */}
        <div className="mt-12 bg-navy-deep rounded-2xl p-8 text-center">
          <p className="text-white/50 text-sm mb-4">
            Are you a scout or team not listed here?
          </p>
          <Link
            href="/signup/scout"
            className="inline-block bg-coral hover:bg-coral/90 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Apply for Scout Access →
          </Link>
        </div>
      </div>
    </div>
  );
}
