"use client";

import { useState, useEffect, useMemo } from "react";
import { AthleteProfile, ScoutProfile } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const USERS_KEY   = "athleticlinq_users";
const SCOUTS_KEY  = "athleticlinq_scouts";
const SESSION_KEY = "athleticlinq_session";
const ADMIN_PASSWORD = "athletic2025admin";

type AdminTab = "overview" | "athletes" | "scouts" | "analytics";

// ── helpers ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "navy" }: {
  label: string; value: string | number; sub?: string;
  color?: "navy" | "coral" | "olive" | "earth" | "amber";
}) {
  const bg = {
    navy:  "bg-navy-deep text-white",
    coral: "bg-coral text-white",
    olive: "bg-olive text-white",
    earth: "bg-earth/20 text-warm-black",
    amber: "bg-amber-500 text-white",
  }[color];
  return (
    <div className={`rounded-2xl p-5 ${bg}`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false);
  const [pwInput,     setPwInput]     = useState("");
  const [pwError,     setPwError]     = useState(false);
  const [athletes,    setAthletes]    = useState<AthleteProfile[]>([]);
  const [scouts,      setScouts]      = useState<ScoutProfile[]>([]);
  const [tab,         setTab]         = useState<AdminTab>("overview");
  const [selectedAth, setSelectedAth] = useState<AthleteProfile | null>(null);
  const [selectedScout, setSelectedScout] = useState<ScoutProfile | null>(null);
  const [searchAth,   setSearchAth]   = useState("");
  const [searchSco,   setSearchSco]   = useState("");
  const [verifyFlash, setVerifyFlash] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [dataSource,  setDataSource]  = useState<"supabase" | "local" | null>(null);

  // ── Load data — Supabase first, localStorage fallback ───────────────────────
  const fetchData = async () => {
    setLoading(true);
    let loaded = false;

    if (supabase) {
      try {
        const [athRes, scoutRes] = await Promise.all([
          supabase.from("athletes").select("profile, verified"),
          supabase.from("scouts").select("profile, verified"),
        ]);

        // data !== null means the query ran (even if it returned [])
        if (athRes.data !== null && scoutRes.data !== null) {
          setAthletes(athRes.data.map((r) => ({ ...r.profile, verified: r.verified } as AthleteProfile)));
          setScouts(scoutRes.data.map((r) => ({ ...r.profile, verified: r.verified } as ScoutProfile)));
          setDataSource("supabase");
          loaded = true;
        }
        // If data IS null, Supabase returned an error (e.g. RLS denied the read)
        // — fall through to the localStorage fallback below
      } catch {
        // Network error — fall through to localStorage
      }
    }

    // Fallback: localStorage (works on the device that originally registered users,
    // or as a safety net when Supabase is unreachable / RLS blocks reads)
    if (!loaded) {
      try {
        const a = localStorage.getItem(USERS_KEY);
        const s = localStorage.getItem(SCOUTS_KEY);
        if (a) setAthletes(JSON.parse(a));
        if (s) setScouts(JSON.parse(s));
        setDataSource("local");
      } catch {}
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  // ── Persist helpers ─────────────────────────────────────────────────────────
  function saveAthletes(updated: AthleteProfile[]) {
    setAthletes(updated);
    // Update session key on this device so verify is reflected immediately
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (session) {
        const match = updated.find((u) => u.id === session.id);
        if (match) localStorage.setItem(SESSION_KEY, JSON.stringify(match));
      }
    } catch {}
    // Only write to localStorage user list when Supabase is not configured
    if (!supabase) {
      try { localStorage.setItem(USERS_KEY, JSON.stringify(updated)); } catch {}
    }
  }

  function saveScouts(updated: ScoutProfile[]) {
    setScouts(updated);
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (session?.type === "scout") {
        const match = updated.find((s) => s.id === session.id);
        if (match) localStorage.setItem(SESSION_KEY, JSON.stringify(match));
      }
    } catch {}
    if (!supabase) {
      try { localStorage.setItem(SCOUTS_KEY, JSON.stringify(updated)); } catch {}
    }
  }

  // ── Verify actions ──────────────────────────────────────────────────────────
  async function verifyAthlete(id: string, verified: boolean) {
    if (supabase) await supabase.from("athletes").update({ verified }).eq("id", id);
    const updated = athletes.map((u) => u.id === id ? { ...u, verified } : u);
    saveAthletes(updated);
    if (selectedAth?.id === id) setSelectedAth((p) => p ? { ...p, verified } : p);
    setVerifyFlash(id);
    setTimeout(() => setVerifyFlash(null), 2000);
  }

  async function verifyScout(id: string, verified: boolean) {
    if (supabase) await supabase.from("scouts").update({ verified }).eq("id", id);
    const updated = scouts.map((s) => s.id === id ? { ...s, verified } : s);
    saveScouts(updated);
    if (selectedScout?.id === id) setSelectedScout((p) => p ? { ...p, verified } : p);
    setVerifyFlash(id);
    setTimeout(() => setVerifyFlash(null), 2000);
  }

  async function deleteAthlete(id: string) {
    if (!confirm("Remove this athlete account?")) return;
    if (supabase) await supabase.from("athletes").delete().eq("id", id);
    saveAthletes(athletes.filter((u) => u.id !== id));
    setSelectedAth(null);
  }

  async function deleteScout(id: string) {
    if (!confirm("Remove this scout account?")) return;
    if (supabase) await supabase.from("scouts").delete().eq("id", id);
    saveScouts(scouts.filter((s) => s.id !== id));
    setSelectedScout(null);
  }

  // ── Derived data ─────────────────────────────────────────────────────────────
  const pendingAthletes = athletes.filter((u) => !u.verified);
  const pendingScouts   = scouts.filter((s) => !s.verified);

  const filteredAthletes = useMemo(() => {
    return athletes
      .filter((u) => !searchAth || `${u.firstName} ${u.lastName} ${u.email} ${u.discipline}`.toLowerCase().includes(searchAth.toLowerCase()))
      .sort((a, b) => Number(a.verified) - Number(b.verified) || b.createdAt.localeCompare(a.createdAt));
  }, [athletes, searchAth]);

  const filteredScouts = useMemo(() => {
    return scouts
      .filter((s) => !searchSco || `${s.firstName} ${s.lastName} ${s.email} ${s.organization}`.toLowerCase().includes(searchSco.toLowerCase()))
      .sort((a, b) => Number(a.verified) - Number(b.verified) || b.createdAt.localeCompare(a.createdAt));
  }, [scouts, searchSco]);

  const analytics = useMemo(() => {
    const verifiedAth  = athletes.filter((u) => u.verified).length;
    const verifiedSco  = scouts.filter((s) => s.verified).length;
    const stravaConn   = athletes.filter((u) => u.stravaConnected).length;
    const avgCompound  = athletes.length
      ? Math.round(athletes.reduce((s, u) => s + (u.compoundScore || 0), 0) / athletes.length)
      : 0;
    const categories   = athletes.reduce<Record<string,number>>((acc, u) => { acc[u.category] = (acc[u.category]||0)+1; return acc; }, {});

    const now = Date.now();
    const daily: Record<string,number> = {};
    for (let i = 13; i >= 0; i--) {
      daily[new Date(now - i*86400000).toISOString().slice(0,10)] = 0;
    }
    [...athletes, ...scouts].forEach((u) => {
      const d = u.createdAt?.slice(0,10);
      if (d && d in daily) daily[d]++;
    });

    return { verifiedAth, verifiedSco, stravaConn, avgCompound, categories, daily };
  }, [athletes, scouts]);

  // ── Login ────────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-navy-deep flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral/20 mb-4">
              <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
            <p className="text-white/40 text-sm">AthleticLinq Control Panel</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (pwInput === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); } else { setPwError(true); setPwInput(""); } }} className="space-y-4">
            <div>
              <input type="password" placeholder="Admin password" value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                autoComplete="current-password"
                name="password"
                className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/30 border outline-none focus:ring-2 focus:ring-coral/40 ${pwError ? "border-coral/70" : "border-white/20"}`} />
              {pwError && <p className="text-coral text-xs mt-1.5">Incorrect password. Try again.</p>}
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 transition-colors">
              Enter Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone/20">
      {/* Top bar */}
      <div className="bg-navy-deep text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-coral/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm">AthleticLinq Admin</div>
            <div className="text-white/40 text-xs">Control Panel</div>
          </div>
        </div>
        {/* Pending badges in top bar */}
        <div className="flex items-center gap-3">
          {(pendingAthletes.length > 0 || pendingScouts.length > 0) && (
            <div className="flex items-center gap-2">
              {pendingAthletes.length > 0 && (
                <button onClick={() => { setTab("athletes"); }} className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-amber-600 transition-colors">
                  {pendingAthletes.length} athlete{pendingAthletes.length !== 1 ? "s" : ""} pending
                </button>
              )}
              {pendingScouts.length > 0 && (
                <button onClick={() => { setTab("scouts"); }} className="bg-coral text-white text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-coral/90 transition-colors">
                  {pendingScouts.length} scout{pendingScouts.length !== 1 ? "s" : ""} pending
                </button>
              )}
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-white/40 hover:text-white text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
            title="Reload data from database"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button onClick={() => setAuthed(false)} className="text-white/40 hover:text-white text-xs transition-colors">Sign out</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-4 max-w-sm border border-stone/30">
          {(["overview","athletes","scouts","analytics"] as AdminTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-colors relative ${tab === t ? "bg-navy-deep text-white" : "text-earth hover:text-warm-black"}`}>
              {t}
              {t === "athletes" && pendingAthletes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {pendingAthletes.length}
                </span>
              )}
              {t === "scouts" && pendingScouts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral text-white text-[9px] flex items-center justify-center font-bold">
                  {pendingScouts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Data source status banner ──────────────────────────────────── */}
        {loading && (
          <div className="mb-6 flex items-center gap-2 text-earth text-xs">
            <svg className="w-3.5 h-3.5 animate-spin text-coral" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading data…
          </div>
        )}
        {!loading && dataSource === "supabase" && (
          <div className="mb-6 flex items-center gap-2 bg-olive/10 border border-olive/20 rounded-xl px-4 py-2.5 text-xs text-olive">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Connected to Supabase — showing all registered users across all devices
          </div>
        )}
        {!loading && dataSource === "local" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Showing data from this device only
            </div>
            <p className="text-amber-700 leading-relaxed">
              The Supabase database returned no results — this is usually caused by a missing Row Level Security policy.
              Go to <strong>Supabase → Table Editor → athletes → Policies</strong> and add a SELECT policy with condition <code className="bg-amber-100 px-1 rounded">true</code> for the <strong>anon</strong> role. Do the same for the <strong>scouts</strong> table.
              Then hit <strong>Refresh</strong> above.
            </p>
          </div>
        )}

        {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Athletes" value={athletes.length} color="navy" />
              <StatCard label="Scouts" value={scouts.length} color="olive" />
              <StatCard label="Pending Athletes" value={pendingAthletes.length} sub="need verification" color="amber" />
              <StatCard label="Pending Scouts" value={pendingScouts.length} sub="need verification" color="coral" />
            </div>

            {/* ── Action needed section ── */}
            {(pendingAthletes.length > 0 || pendingScouts.length > 0) && (
              <div className="bg-white rounded-2xl border border-stone/30 p-6">
                <h2 className="font-semibold text-warm-black mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Action Required — Pending Verifications
                </h2>
                <p className="text-earth text-xs mb-5">Click <strong>Verify &amp; Activate</strong> to approve an account. This grants them full platform access.</p>

                <div className="space-y-3">
                  {[...pendingAthletes.map((u) => ({ ...u, _kind: "athlete" as const })),
                    ...pendingScouts.map((s) => ({ ...s, _kind: "scout" as const }))].map((person) => (
                    <div key={person.id}
                      className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-800 shrink-0">
                        {person.firstName[0]}{person.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-warm-black text-sm">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="text-earth text-xs truncate">
                          {person.email}
                          {person._kind === "athlete"
                            ? ` · ${(person as AthleteProfile).discipline || "Athlete"} · ${(person as AthleteProfile).category || ""}`
                            : ` · ${(person as ScoutProfile).role} · ${(person as ScoutProfile).organization}`}
                        </div>
                        <div className="text-earth/60 text-xs mt-0.5">
                          Registered {new Date(person.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium capitalize">
                          {person._kind}
                        </span>
                        {verifyFlash === person.id ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-olive bg-olive/10 border border-olive/30 px-3 py-2 rounded-full">
                            <CheckIcon /> Verified!
                          </span>
                        ) : (
                          <button
                            onClick={() => person._kind === "athlete"
                              ? verifyAthlete(person.id, true)
                              : verifyScout(person.id, true)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-olive hover:bg-olive/90 px-4 py-2 rounded-full transition-colors shadow-sm"
                          >
                            <CheckIcon /> Verify &amp; Activate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingAthletes.length === 0 && pendingScouts.length === 0 && (
              <div className="bg-olive/10 border border-olive/20 rounded-2xl p-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-olive/20 flex items-center justify-center">
                  <CheckIcon />
                </div>
                <div>
                  <div className="font-semibold text-olive text-sm">All accounts verified</div>
                  <div className="text-earth/70 text-xs">No pending verifications at this time.</div>
                </div>
              </div>
            )}

            {/* Recent signups */}
            {[...athletes, ...scouts].length > 0 && (
              <div className="bg-white rounded-2xl border border-stone/30 p-6">
                <h2 className="font-semibold text-warm-black mb-4">Recent Sign-ups</h2>
                <div className="space-y-3">
                  {[...athletes.map((u) => ({ ...u, _kind: "athlete" as const })),
                    ...scouts.map((s) => ({ ...s, _kind: "scout" as const }))]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .slice(0, 6)
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-navy-deep/10 flex items-center justify-center text-xs font-bold text-navy-deep">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-warm-black">{p.firstName} {p.lastName}</div>
                            <div className="text-xs text-earth capitalize">
                              {p._kind === "scout"
                                ? `${(p as ScoutProfile).role} · ${(p as ScoutProfile).organization}`
                                : `${(p as AthleteProfile).discipline || "Athlete"}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.verified ? "bg-olive/20 text-olive" : "bg-amber-100 text-amber-700"}`}>
                            {p.verified ? "Verified" : "Pending"}
                          </span>
                          <span className="text-xs text-earth/50">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ATHLETES tab ────────────────────────────────────────────────── */}
        {tab === "athletes" && (
          <div className="space-y-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search athletes..." value={searchAth}
                onChange={(e) => setSearchAth(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30" />
            </div>

            <div className="text-sm text-earth">{filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} — pending shown first</div>

            {filteredAthletes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone/30 p-12 text-center text-earth">
                {athletes.length === 0 ? "No athletes have registered yet." : "No results match your search."}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone/20 text-earth text-xs uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-4 py-3">Athlete</th>
                        <th className="text-left px-4 py-3">Discipline</th>
                        <th className="text-right px-4 py-3">Compound</th>
                        <th className="text-right px-4 py-3">FTP</th>
                        <th className="text-center px-4 py-3">Status</th>
                        <th className="text-center px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone/20">
                      {filteredAthletes.map((u) => (
                        <tr key={u.id}
                          className={`hover:bg-stone/10 cursor-pointer transition-colors ${!u.verified ? "bg-amber-50/50" : ""}`}
                          onClick={() => setSelectedAth(u)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${!u.verified ? "bg-amber-100 text-amber-800" : "bg-navy-deep/10 text-navy-deep"}`}>
                                {u.firstName[0]}{u.lastName[0]}
                              </div>
                              <div>
                                <div className="font-medium text-warm-black">{u.firstName} {u.lastName}</div>
                                <div className="text-earth/70 text-xs">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-earth text-xs">{u.discipline || "—"}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-coral text-sm">
                            {u.compoundScore ? u.compoundScore.toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-warm-black text-sm">{u.ftp ? `${u.ftp}W` : "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.verified ? "bg-olive/20 text-olive" : "bg-amber-100 text-amber-700"}`}>
                              {u.verified ? "✓ Verified" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {verifyFlash === u.id ? (
                                <span className="text-xs text-olive font-semibold">Done ✓</span>
                              ) : (
                                <button
                                  onClick={() => verifyAthlete(u.id, !u.verified)}
                                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${u.verified ? "bg-earth/20 text-earth hover:bg-earth/30" : "bg-olive text-white hover:bg-olive/90"}`}
                                >
                                  {u.verified ? "Unverify" : "✓ Verify"}
                                </button>
                              )}
                              <button
                                onClick={() => deleteAthlete(u.id)}
                                className="text-xs px-2 py-1.5 rounded-full bg-coral/10 text-coral hover:bg-coral/20 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCOUTS tab ──────────────────────────────────────────────────── */}
        {tab === "scouts" && (
          <div className="space-y-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search scouts..." value={searchSco}
                onChange={(e) => setSearchSco(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30" />
            </div>

            <div className="text-sm text-earth">{filteredScouts.length} scout{filteredScouts.length !== 1 ? "s" : ""} — pending shown first</div>

            {filteredScouts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone/30 p-12 text-center text-earth">
                {scouts.length === 0 ? "No scouts have applied yet." : "No results match your search."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScouts.map((s) => (
                  <div key={s.id}
                    className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-shadow ${!s.verified ? "border-amber-200" : "border-stone/20"}`}
                    onClick={() => setSelectedScout(s)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${!s.verified ? "bg-amber-100 text-amber-800" : "bg-navy-deep/10 text-navy-deep"}`}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-warm-black">{s.firstName} {s.lastName}</div>
                          <div className="text-earth text-sm">{s.role} · {s.organization}</div>
                          <div className="text-earth/60 text-xs mt-0.5">{s.email} · {s.country}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs bg-navy-deep/10 text-navy-deep px-2 py-0.5 rounded-full">{s.orgType}</span>
                            {s.disciplines.slice(0,3).map((d) => (
                              <span key={d} className="text-xs bg-stone/30 text-earth px-2 py-0.5 rounded-full">{d}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.verified ? "bg-olive/20 text-olive" : "bg-amber-100 text-amber-700"}`}>
                          {s.verified ? "✓ Verified" : "Pending"}
                        </span>
                        {verifyFlash === s.id ? (
                          <span className="text-xs text-olive font-semibold">Activated ✓</span>
                        ) : (
                          <button
                            onClick={() => verifyScout(s.id, !s.verified)}
                            className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-colors ${s.verified ? "bg-earth/20 text-earth hover:bg-earth/30" : "bg-olive text-white hover:bg-olive/90"}`}
                          >
                            {s.verified ? "Revoke Access" : "✓ Verify & Grant Access"}
                          </button>
                        )}
                        <button
                          onClick={() => deleteScout(s.id)}
                          className="text-xs text-coral hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS tab ───────────────────────────────────────────────── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Athletes" value={athletes.length} color="navy" />
              <StatCard label="Total Scouts" value={scouts.length} color="olive" />
              <StatCard label="Avg Compound Score" value={analytics.avgCompound || "—"} sub="W²/kg" color="coral" />
              <StatCard label="Pending Reviews" value={pendingAthletes.length + pendingScouts.length} color="amber" />
            </div>

            {/* 14-day signups */}
            <div className="bg-white rounded-2xl border border-stone/30 p-6">
              <h2 className="font-semibold text-warm-black mb-4">Sign-ups (Last 14 Days)</h2>
              <div className="flex items-end gap-1.5 h-28">
                {Object.entries(analytics.daily).map(([day, count]) => {
                  const max = Math.max(...Object.values(analytics.daily), 1);
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count}`}>
                      <div className="w-full flex flex-col justify-end" style={{ height: 88 }}>
                        <div className="w-full rounded-t-sm bg-coral/70" style={{ height: `${Math.max((count/max)*100, count > 0 ? 8 : 2)}%` }} />
                      </div>
                      {count > 0 && <div className="text-xs text-earth">{count}</div>}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-earth/50">
                <span>{Object.keys(analytics.daily)[0]}</span>
                <span>Today</span>
              </div>
            </div>

            {/* Category breakdown */}
            {Object.keys(analytics.categories).length > 0 && (
              <div className="bg-white rounded-2xl border border-stone/30 p-6">
                <h2 className="font-semibold text-warm-black mb-4">Athlete Categories</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.categories).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="text-sm text-warm-black w-20">{cat}</div>
                      <div className="flex-1 h-2 bg-stone/30 rounded-full overflow-hidden">
                        <div className="h-full bg-coral rounded-full" style={{ width: `${(count/athletes.length)*100}%` }} />
                      </div>
                      <div className="text-sm text-earth w-6 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration stats */}
            <div className="bg-white rounded-2xl border border-stone/30 p-6">
              <h2 className="font-semibold text-warm-black mb-4">Data Integrations</h2>
              <div className="space-y-4">
                {[
                  { label: "Strava Connected", count: analytics.stravaConn, total: athletes.length, color: "bg-orange-400" },
                  { label: "Athletes Verified", count: analytics.verifiedAth, total: athletes.length, color: "bg-olive" },
                  { label: "Scouts Verified", count: analytics.verifiedSco, total: scouts.length, color: "bg-coral" },
                ].map(({ label, count, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-warm-black">{label}</span>
                      <span className="text-earth">{count} / {total}</span>
                    </div>
                    <div className="h-2 bg-stone/30 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: total > 0 ? `${(count/total)*100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Athlete detail drawer ── */}
      {selectedAth && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40" onClick={() => setSelectedAth(null)}>
          <div className="w-full max-w-md h-full bg-white overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-warm-black text-lg">Athlete Profile</h2>
              <button onClick={() => setSelectedAth(null)} className="w-8 h-8 rounded-full hover:bg-stone/20 flex items-center justify-center text-earth">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-stone/10">
              <div className="w-14 h-14 rounded-full bg-navy-deep/10 flex items-center justify-center text-lg font-bold text-navy-deep">
                {selectedAth.firstName[0]}{selectedAth.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="font-bold text-warm-black">{selectedAth.flag} {selectedAth.firstName} {selectedAth.lastName}</div>
                <div className="text-earth text-sm">{selectedAth.email}</div>
                <div className="flex gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedAth.verified ? "bg-olive/20 text-olive" : "bg-amber-100 text-amber-700"}`}>
                    {selectedAth.verified ? "✓ Verified" : "Pending"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-navy-deep/10 text-navy-deep">{selectedAth.category}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {[
                ["Location", selectedAth.location],
                ["Nationality", selectedAth.nationality],
                ["Discipline", selectedAth.discipline],
                ["Team", selectedAth.team],
                ["FTP", selectedAth.ftp ? `${selectedAth.ftp} W` : "—"],
                ["FTP/kg", selectedAth.ftpPerKg ? `${selectedAth.ftpPerKg} W/kg` : "—"],
                ["Compound Score", selectedAth.compoundScore ? `${selectedAth.compoundScore.toLocaleString()} W²/kg` : "—"],
                ["5-min Power", selectedAth.fiveMinPower ? `${selectedAth.fiveMinPower} W` : "—"],
                ["Weight", selectedAth.weight ? `${selectedAth.weight} kg` : "—"],
                ["Strava", selectedAth.stravaConnected ? "Connected" : "Not connected"],
                ["Registered", new Date(selectedAth.createdAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between gap-3 py-1.5 border-b border-stone/10 last:border-0">
                  <span className="text-earth text-xs shrink-0">{label}</span>
                  <span className="text-warm-black text-xs text-right font-medium break-all">{value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-stone/20">
              <button
                onClick={() => verifyAthlete(selectedAth.id, !selectedAth.verified)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${selectedAth.verified ? "bg-earth/20 text-earth hover:bg-earth/30" : "bg-olive text-white hover:bg-olive/90"}`}
              >
                {selectedAth.verified ? "Remove Verification" : "✓ Verify & Activate"}
              </button>
              <button
                onClick={() => deleteAthlete(selectedAth.id)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-coral/10 text-coral hover:bg-coral/20 transition-colors"
              >
                Remove Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Scout detail drawer ── */}
      {selectedScout && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40" onClick={() => setSelectedScout(null)}>
          <div className="w-full max-w-md h-full bg-white overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-warm-black text-lg">Scout Profile</h2>
              <button onClick={() => setSelectedScout(null)} className="w-8 h-8 rounded-full hover:bg-stone/20 flex items-center justify-center text-earth">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-stone/10">
              <div className="w-14 h-14 rounded-full bg-navy-deep/10 flex items-center justify-center text-lg font-bold text-navy-deep">
                {selectedScout.firstName[0]}{selectedScout.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="font-bold text-warm-black">{selectedScout.firstName} {selectedScout.lastName}</div>
                <div className="text-earth text-sm">{selectedScout.email}</div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${selectedScout.verified ? "bg-olive/20 text-olive" : "bg-amber-100 text-amber-700"}`}>
                  {selectedScout.verified ? "✓ Verified" : "Pending Verification"}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-sm mb-6">
              {[
                ["Role", selectedScout.role],
                ["Organization", selectedScout.organization],
                ["Org Type", selectedScout.orgType],
                ["Country", selectedScout.country],
                ["Website", selectedScout.website],
                ["Phone", selectedScout.phone],
                ["LinkedIn", selectedScout.linkedIn],
                ["Disciplines", selectedScout.disciplines.join(", ") || "—"],
                ["Categories", selectedScout.categories.join(", ") || "—"],
                ["Regions", selectedScout.regions.join(", ") || "—"],
                ["Registered", new Date(selectedScout.createdAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between gap-3 py-1.5 border-b border-stone/10 last:border-0">
                  <span className="text-earth text-xs shrink-0">{label}</span>
                  <span className="text-warm-black text-xs text-right font-medium break-all">{value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-5 border-t border-stone/20">
              <button
                onClick={() => verifyScout(selectedScout.id, !selectedScout.verified)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${selectedScout.verified ? "bg-earth/20 text-earth hover:bg-earth/30" : "bg-olive text-white hover:bg-olive/90"}`}
              >
                {selectedScout.verified ? "Revoke Access" : "✓ Verify & Grant Access"}
              </button>
              <button
                onClick={() => deleteScout(selectedScout.id)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-coral/10 text-coral hover:bg-coral/20 transition-colors"
              >
                Remove Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
