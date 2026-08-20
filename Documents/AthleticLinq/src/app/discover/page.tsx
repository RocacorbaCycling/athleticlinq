"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { athletes, Athlete } from "@/data/athletes";
import { AthleteProfile, useAuth, isScout, isAthlete } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import AthleteCard from "@/components/AthleteCard";
import VideoCard from "@/components/VideoCard";

type ViewMode = "grid" | "video";
type SortOption = "score" | "ftp" | "wpkg" | "age";

const USERS_KEY = "athleticlinq_users";
const PREVIEW_COUNT = 4; // guests see this many athletes before lock

// ── Continent mapping — demonyms AND country names ────────────────────────────
const CONTINENT_MAP: Record<string, string> = {
  // Africa — demonyms
  algerian: "Africa", angolan: "Africa", beninese: "Africa", botswanan: "Africa",
  burkinabe: "Africa", burundian: "Africa", cameroonian: "Africa", "cape verdean": "Africa",
  chadian: "Africa", comorian: "Africa", congolese: "Africa", djiboutian: "Africa",
  egyptian: "Africa", "equatorial guinean": "Africa", eritrean: "Africa", ethiopian: "Africa",
  gabonese: "Africa", gambian: "Africa", ghanaian: "Africa", guinean: "Africa",
  ivorian: "Africa", kenyan: "Africa", lesothan: "Africa", liberian: "Africa",
  libyan: "Africa", malagasy: "Africa", malawian: "Africa", malian: "Africa",
  mauritanian: "Africa", mauritian: "Africa", moroccan: "Africa", mozambican: "Africa",
  namibian: "Africa", nigerien: "Africa", nigerian: "Africa", rwandan: "Africa",
  senegalese: "Africa", "sierra leonean": "Africa", somali: "Africa", "south african": "Africa",
  "south sudanese": "Africa", sudanese: "Africa", swazi: "Africa", tanzanian: "Africa",
  togolese: "Africa", tunisian: "Africa", ugandan: "Africa", zambian: "Africa",
  zimbabwean: "Africa",
  // Africa — country names
  algeria: "Africa", angola: "Africa", benin: "Africa", botswana: "Africa",
  "burkina faso": "Africa", burundi: "Africa", cameroon: "Africa", "cape verde": "Africa",
  chad: "Africa", comoros: "Africa", congo: "Africa", djibouti: "Africa",
  egypt: "Africa", eritrea: "Africa", ethiopia: "Africa", gabon: "Africa",
  gambia: "Africa", ghana: "Africa", guinea: "Africa", kenya: "Africa",
  lesotho: "Africa", liberia: "Africa", libya: "Africa", madagascar: "Africa",
  malawi: "Africa", mali: "Africa", mauritania: "Africa", mauritius: "Africa",
  morocco: "Africa", mozambique: "Africa", namibia: "Africa", niger: "Africa",
  nigeria: "Africa", rwanda: "Africa", senegal: "Africa", "sierra leone": "Africa",
  somalia: "Africa", "south africa": "Africa", "south sudan": "Africa", sudan: "Africa",
  eswatini: "Africa", swaziland: "Africa", tanzania: "Africa", togo: "Africa",
  tunisia: "Africa", uganda: "Africa", zambia: "Africa", zimbabwe: "Africa",
  "ivory coast": "Africa", "côte d'ivoire": "Africa",
  // South America — demonyms
  argentine: "South America", argentinian: "South America", bolivian: "South America",
  brazilian: "South America", chilean: "South America", colombian: "South America",
  ecuadorian: "South America", guyanese: "South America", paraguayan: "South America",
  peruvian: "South America", surinamese: "South America", uruguayan: "South America",
  venezuelan: "South America",
  // South America — country names
  argentina: "South America", bolivia: "South America", brazil: "South America",
  chile: "South America", colombia: "South America", ecuador: "South America",
  guyana: "South America", paraguay: "South America", peru: "South America",
  suriname: "South America", uruguay: "South America", venezuela: "South America",
  // North / Central America / Caribbean — demonyms
  american: "North America", canadian: "North America", mexican: "North America",
  guatemalan: "North America", belizean: "North America", honduran: "North America",
  salvadoran: "North America", nicaraguan: "North America", "costa rican": "North America",
  panamanian: "North America", cuban: "North America", dominican: "North America",
  haitian: "North America", jamaican: "North America", "puerto rican": "North America",
  trinidadian: "North America",
  // North / Central America / Caribbean — country names
  "united states": "North America", usa: "North America", canada: "North America",
  mexico: "North America", guatemala: "North America", belize: "North America",
  honduras: "North America", "el salvador": "North America", nicaragua: "North America",
  "costa rica": "North America", panama: "North America", cuba: "North America",
  "dominican republic": "North America", haiti: "North America", jamaica: "North America",
  "trinidad and tobago": "North America", "puerto rico": "North America",
  // Europe — demonyms
  albanian: "Europe", andorran: "Europe", armenian: "Europe", austrian: "Europe",
  azerbaijani: "Europe", belarusian: "Europe", belgian: "Europe", bosnian: "Europe",
  bulgarian: "Europe", croatian: "Europe", cypriot: "Europe", czech: "Europe",
  danish: "Europe", dutch: "Europe", estonian: "Europe", finnish: "Europe",
  french: "Europe", georgian: "Europe", german: "Europe", greek: "Europe",
  hungarian: "Europe", icelandic: "Europe", irish: "Europe", italian: "Europe",
  kazakh: "Europe", kosovar: "Europe", latvian: "Europe", lithuanian: "Europe",
  luxembourgish: "Europe", macedonian: "Europe", maltese: "Europe", moldovan: "Europe",
  monacan: "Europe", montenegrin: "Europe", norwegian: "Europe", polish: "Europe",
  portuguese: "Europe", romanian: "Europe", russian: "Europe", serbian: "Europe",
  slovak: "Europe", slovenian: "Europe", spanish: "Europe", swedish: "Europe",
  swiss: "Europe", turkish: "Europe", ukrainian: "Europe", british: "Europe",
  english: "Europe", scottish: "Europe", welsh: "Europe", "northern irish": "Europe",
  // Europe — country names
  albania: "Europe", andorra: "Europe", armenia: "Europe", austria: "Europe",
  azerbaijan: "Europe", belarus: "Europe", belgium: "Europe", "bosnia and herzegovina": "Europe",
  bulgaria: "Europe", croatia: "Europe", cyprus: "Europe", "czech republic": "Europe",
  czechia: "Europe", denmark: "Europe", "netherlands": "Europe", estonia: "Europe",
  finland: "Europe", france: "Europe", georgia: "Europe", germany: "Europe",
  greece: "Europe", hungary: "Europe", iceland: "Europe", ireland: "Europe",
  italy: "Europe", kosovo: "Europe", latvia: "Europe", liechtenstein: "Europe",
  lithuania: "Europe", luxembourg: "Europe", "north macedonia": "Europe", malta: "Europe",
  moldova: "Europe", monaco: "Europe", montenegro: "Europe", norway: "Europe",
  poland: "Europe", portugal: "Europe", romania: "Europe", russia: "Europe",
  "san marino": "Europe", serbia: "Europe", slovakia: "Europe", slovenia: "Europe",
  spain: "Europe", sweden: "Europe", switzerland: "Europe", turkey: "Europe",
  ukraine: "Europe", "united kingdom": "Europe", uk: "Europe", england: "Europe",
  scotland: "Europe", wales: "Europe",
  // Asia — demonyms
  afghan: "Asia", bahraini: "Asia", bangladeshi: "Asia", bhutanese: "Asia",
  bruneian: "Asia", burmese: "Asia", cambodian: "Asia", chinese: "Asia",
  emirati: "Asia", filipino: "Asia", indian: "Asia", indonesian: "Asia",
  iranian: "Asia", iraqi: "Asia", israeli: "Asia", japanese: "Asia",
  jordanian: "Asia", kuwaiti: "Asia", kyrgyz: "Asia", laotian: "Asia",
  lebanese: "Asia", malaysian: "Asia", maldivian: "Asia", mongolian: "Asia",
  nepalese: "Asia", nepali: "Asia", omani: "Asia", pakistani: "Asia",
  palestinian: "Asia", qatari: "Asia", saudi: "Asia", singaporean: "Asia",
  "south korean": "Asia", "sri lankan": "Asia", syrian: "Asia", taiwanese: "Asia",
  tajik: "Asia", thai: "Asia", timorese: "Asia", turkmen: "Asia",
  uzbek: "Asia", vietnamese: "Asia", yemeni: "Asia",
  // Asia — country names
  afghanistan: "Asia", bahrain: "Asia", bangladesh: "Asia", bhutan: "Asia",
  brunei: "Asia", myanmar: "Asia", cambodia: "Asia", china: "Asia",
  "united arab emirates": "Asia", uae: "Asia", philippines: "Asia", india: "Asia",
  indonesia: "Asia", iran: "Asia", iraq: "Asia", israel: "Asia", japan: "Asia",
  jordan: "Asia", kuwait: "Asia", kyrgyzstan: "Asia", laos: "Asia",
  lebanon: "Asia", malaysia: "Asia", maldives: "Asia", mongolia: "Asia",
  nepal: "Asia", oman: "Asia", pakistan: "Asia", palestine: "Asia",
  qatar: "Asia", "saudi arabia": "Asia", singapore: "Asia", "south korea": "Asia",
  "sri lanka": "Asia", syria: "Asia", taiwan: "Asia", tajikistan: "Asia",
  thailand: "Asia", "timor-leste": "Asia", turkmenistan: "Asia",
  uzbekistan: "Asia", vietnam: "Asia", yemen: "Asia",
  // Oceania — demonyms
  australian: "Oceania", "new zealander": "Oceania", fijian: "Oceania",
  samoan: "Oceania", tongan: "Oceania",
  // Oceania — country names
  australia: "Oceania", "new zealand": "Oceania", fiji: "Oceania",
  "papua new guinea": "Oceania", samoa: "Oceania", tonga: "Oceania",
};

const CONTINENTS = ["all", "Africa", "Asia", "Europe", "North America", "South America", "Oceania"] as const;
type Continent = typeof CONTINENTS[number];

function getContinent(nationality: string): string {
  const key = nationality.trim().toLowerCase();
  return CONTINENT_MAP[key] ?? "Other";
}

/** Map a registered AthleteProfile (strings) to the Athlete shape (numbers) */
function profileToAthlete(p: AthleteProfile): Athlete {
  const ftp = parseFloat(p.ftp) || 0;
  const weight = parseFloat(p.weight) || 70;
  const fiveMin = parseFloat(p.fiveMinPower) || 0;
  const twentyMin = parseFloat(p.twentyMinPower) || 0;
  const maxPow = parseFloat(p.maxPower) || 0;
  const vo2 = parseFloat(p.vo2max);
  const ftpPerKg = parseFloat(p.ftpPerKg) || (weight > 0 ? ftp / weight : 0);

  const tags: string[] = [];
  const disc = p.discipline.toLowerCase();
  if (disc.includes("climb")) tags.push("climber");
  if (disc.includes("sprint")) tags.push("sprinter");
  if (disc.includes("time") || disc.includes("tt")) tags.push("time-trial");
  if (disc.includes("all")) tags.push("all-rounder");
  if (disc.includes("classic") || disc.includes("punch")) tags.push("classics");
  if (disc.includes("track")) tags.push("track");
  if (disc.includes("mtb") || disc.includes("mountain")) tags.push("mtb");
  if (disc.includes("gravel")) tags.push("gravel");
  if (tags.length === 0) tags.push("road");

  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    age: p.dateOfBirth
      ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 20,
    nationality: p.nationality,
    flag: p.flag || "🏳️",
    location: p.location,
    category: p.category,
    discipline: p.discipline,
    team: p.team || undefined,
    bio: p.bio,
    profileImage: p.profileImage || "/athletes/default.jpg",
    videoUrl: p.videoUrl || undefined,
    ftp,
    ftpPerKg: parseFloat(ftpPerKg.toFixed(2)),
    weight,
    vo2max: isNaN(vo2) || !p.vo2max ? undefined : vo2,
    maxPower: maxPow,
    fiveMinPower: fiveMin,
    twentyMinPower: twentyMin,
    compoundScore: p.compoundScore || Math.round(fiveMin * (fiveMin / weight)),
    stravaConnected: p.stravaConnected,
    stravaUrl: p.stravaUrl || undefined,
    stravaWeeklyHours: p.stravaWeeklyHours,
    stravaWeeklyTSS: p.stravaWeeklyTSS,
    stravaRecentDistance: p.stravaRecentDistance,
    stravaPowerVerified: p.stravaPowerVerified,
    sex: p.sex || undefined,
    followers: 0,
    verified: p.verified,
    palmares: [],
    tags,
  };
}

// ── Locked card shown to guests ───────────────────────────────────────────────
function LockedCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone/30 bg-white">
      <div className="relative aspect-[4/5] bg-gradient-to-br from-stone/30 to-stone/50 overflow-hidden">
        {/* Blurred silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-stone/40" />
        </div>
        <div className="absolute inset-0 backdrop-blur-sm bg-white/40 flex flex-col items-center justify-center gap-3 p-4">
          <div className="w-12 h-12 rounded-full bg-navy-deep/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-navy-deep/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-navy-deep/70 text-xs font-semibold text-center">Sign up to unlock</p>
        </div>
      </div>
      <div className="p-3 text-center">
        <Link
          href="/signup/athlete"
          className="block text-xs font-semibold text-coral hover:underline"
        >
          Join AthleticLinq →
        </Link>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // ── Draft filter state (what the controls show) ───────────────────────────
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [filterCategory, setFilterCategory]   = useState("all");
  const [filterMinWpkg, setFilterMinWpkg]     = useState(0);
  const [filterSex, setFilterSex]             = useState<"all" | "male" | "female">("all");
  const [filterContinent, setFilterContinent] = useState<Continent>("all");

  // ── Applied filter state (what drives results — set by Search button) ─────
  const [applied, setApplied] = useState({
    search:     "",
    discipline: "all",
    category:   "all",
    minWpkg:    0,
    sex:        "all" as "all" | "male" | "female",
    continent:  "all" as Continent,
  });

  // ── Sort is live (presentation only — no button needed) ───────────────────
  const [sortBy, setSortBy] = useState<SortOption>("score");

  const [registeredAthletes, setRegisteredAthletes] = useState<Athlete[]>([]);

  // Derived: are there pending (unapplied) filter changes?
  const hasPendingChanges =
    searchQuery          !== applied.search     ||
    filterDiscipline     !== applied.discipline ||
    filterCategory       !== applied.category   ||
    filterMinWpkg        !== applied.minWpkg    ||
    filterSex            !== applied.sex        ||
    filterContinent      !== applied.continent;

  // Derived: are any filters currently active?
  const hasActiveFilters =
    applied.search !== "" || applied.discipline !== "all" ||
    applied.category !== "all" || applied.minWpkg > 0 ||
    applied.sex !== "all" || applied.continent !== "all";

  function handleSearch() {
    setApplied({
      search:     searchQuery,
      discipline: filterDiscipline,
      category:   filterCategory,
      minWpkg:    filterMinWpkg,
      sex:        filterSex,
      continent:  filterContinent,
    });
  }

  function handleReset() {
    setSearchQuery(""); setFilterDiscipline("all"); setFilterCategory("all");
    setFilterMinWpkg(0); setFilterSex("all"); setFilterContinent("all");
    setApplied({ search: "", discipline: "all", category: "all", minWpkg: 0, sex: "all", continent: "all" });
  }

  // Access levels
  const isLoggedIn = !!user;
  const isPendingScout = isScout(user) && !user.verified;
  const isVerifiedScout = isScout(user) && user.verified;
  const isAthleteUser = isAthlete(user);
  // Athletes can browse all cards but cannot see power data — scouts only
  const canBrowse = isLoggedIn; // any logged-in user sees all cards
  const showPower = isVerifiedScout; // only verified scouts see power numbers
  const hasFullAccess = isVerifiedScout; // kept for filter/sort UI gating

  useEffect(() => {
    (async () => {
      if (supabase) {
        const { data } = await supabase.from("athletes").select("profile, verified");
        if (data && data.length > 0) {
          const mapped = data
            .map((r) => ({ ...r.profile, verified: r.verified } as AthleteProfile))
            .filter((p) => p.firstName && p.lastName)
            .map(profileToAthlete);
          setRegisteredAthletes(mapped);
          return;
        }
      }
      // localStorage fallback
      try {
        const stored = localStorage.getItem(USERS_KEY);
        if (stored) {
          const profiles: AthleteProfile[] = JSON.parse(stored);
          const mapped = profiles.filter((p) => p.firstName && p.lastName).map(profileToAthlete);
          setRegisteredAthletes(mapped);
        }
      } catch {}
    })();
  }, []);

  const allAthletes = useMemo(() => {
    const registeredIds = new Set(registeredAthletes.map((a) => a.id));
    const staticFiltered = athletes.filter((a) => !registeredIds.has(a.id));
    return [...registeredAthletes, ...staticFiltered];
  }, [registeredAthletes]);

  const disciplines = useMemo(
    () => ["all", ...new Set(allAthletes.map((a) => a.discipline))],
    [allAthletes]
  );
  const categories = useMemo(
    () => ["all", ...new Set(allAthletes.map((a) => a.category))],
    [allAthletes]
  );

  const filtered = useMemo(() => {
    let result = allAthletes.filter((a) => {
      const matchesSearch =
        !applied.search ||
        `${a.firstName} ${a.lastName} ${a.nationality} ${a.discipline}`
          .toLowerCase()
          .includes(applied.search.toLowerCase());
      const matchesDiscipline = applied.discipline === "all" || a.discipline === applied.discipline;
      const matchesCategory   = applied.category   === "all" || a.category   === applied.category;
      const matchesWpkg       = a.ftpPerKg >= applied.minWpkg;
      const matchesSex        = applied.sex === "all" || !a.sex || a.sex === applied.sex;
      const matchesContinent  = applied.continent === "all" || getContinent(a.nationality) === applied.continent;
      return matchesSearch && matchesDiscipline && matchesCategory && matchesWpkg && matchesSex && matchesContinent;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "score": return b.compoundScore - a.compoundScore;
        case "ftp":   return b.ftp - a.ftp;
        case "wpkg":  return b.ftpPerKg - a.ftpPerKg;
        case "age":   return a.age - b.age;
        default:      return 0;
      }
    });

    return result;
  }, [allAthletes, applied, sortBy]);

  const registeredCount = registeredAthletes.length;

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <div className="relative bg-navy-deep pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-[center_25%]" style={{ backgroundImage: "url('/hero-discover.jpg')" }} />
        <div className="absolute inset-0 bg-navy-deep/70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
            Discover Athletes
          </h1>
          <p className="text-white/50 text-sm">
            Browse {allAthletes.length} athletes from around the world
            {registeredCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-coral/20 text-coral text-xs px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                {registeredCount} new sign-up{registeredCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Pending scout banner */}
      {isPendingScout && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-800 text-sm">
              <strong>Verification pending.</strong> You can preview athlete profiles. Full performance data and contact details will be unlocked once your account is verified.
            </p>
            <Link href="/dashboard" className="ml-auto shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">
              Check status →
            </Link>
          </div>
        </div>
      )}

      {/* Athlete power-lock notice */}
      {isAthleteUser && (
        <div className="bg-navy-deep/5 border-b border-navy-deep/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-navy-deep/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-navy-deep/60 text-sm">
              <strong className="text-navy-deep/80">Power data is private.</strong> FTP, W/kg, and performance metrics are only visible to verified scouts — not to other athletes.
            </p>
          </div>
        </div>
      )}

      {/* Guest sign-up banner */}
      {!isLoggedIn && (
        <div className="bg-navy-deep/5 border-b border-stone/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3 justify-between">
            <p className="text-warm-black/70 text-sm">
              <strong className="text-navy-deep">Preview mode</strong> — Sign up to see all {allAthletes.length} athletes, power data, and contact details.
            </p>
            <div className="flex gap-2">
              <Link href="/signup/athlete" className="text-xs font-semibold bg-coral text-white px-4 py-1.5 rounded-full hover:bg-coral/90 transition-colors">
                Join as Athlete
              </Link>
              <Link href="/signup/scout" className="text-xs font-semibold bg-navy-deep text-white px-4 py-1.5 rounded-full hover:bg-navy-deep/90 transition-colors">
                Join as Scout
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="sticky top-16 z-40 bg-cream/95 backdrop-blur-md border-b border-stone/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Search input */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Name, country, discipline…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50"
              />
            </div>

            {/* Discipline */}
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30"
            >
              {disciplines.map((d) => (
                <option key={d} value={d}>{d === "all" ? "All Disciplines" : d}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
              ))}
            </select>

            {/* Continent */}
            <select
              value={filterContinent}
              onChange={(e) => setFilterContinent(e.target.value as Continent)}
              className="px-3 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30"
            >
              {CONTINENTS.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Continents" : c}</option>
              ))}
            </select>

            {/* Sex toggle */}
            <div className="flex bg-white rounded-xl border border-stone/40 overflow-hidden">
              {(["all", "male", "female"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSex(s)}
                  className={`px-3 py-2.5 text-xs font-semibold capitalize transition-colors ${
                    filterSex === s ? "bg-navy-deep text-white" : "text-earth hover:text-warm-black"
                  }`}
                >
                  {s === "all" ? "All" : s === "male" ? "♂ Men" : "♀ Women"}
                </button>
              ))}
            </div>

            {/* Min W/kg — scouts only */}
            {hasFullAccess && (
              <div className="flex items-center gap-2 bg-white border border-stone/40 rounded-xl px-3 py-2.5">
                <label className="text-xs text-earth whitespace-nowrap">Min W/kg</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="7"
                  value={filterMinWpkg || ""}
                  onChange={(e) => setFilterMinWpkg(parseFloat(e.target.value) || 0)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="0"
                  className="w-14 text-sm text-warm-black focus:outline-none text-right bg-transparent"
                />
              </div>
            )}

            {/* ── Search button ─────────────────────────────────────────── */}
            <button
              onClick={handleSearch}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                hasPendingChanges
                  ? "bg-coral text-white shadow-md shadow-coral/30 hover:bg-coral/90 scale-[1.02]"
                  : "bg-navy-deep text-white hover:bg-navy-deep/90"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
              {hasPendingChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              )}
            </button>

            {/* Reset — only when filters are active */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="px-3 py-2.5 rounded-xl text-sm text-earth hover:text-coral border border-stone/40 bg-white transition-colors"
                title="Clear all filters"
              >
                ✕ Reset
              </button>
            )}

            {/* Sort (live — no button needed) */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 rounded-xl bg-white border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 ml-auto"
            >
              <option value="score">↕ Compound Score</option>
              {hasFullAccess && <option value="wpkg">↕ W/kg</option>}
              {hasFullAccess && <option value="ftp">↕ FTP</option>}
              <option value="age">↕ Youngest</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-white rounded-xl border border-stone/40 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2.5 text-sm transition-colors ${viewMode === "grid" ? "bg-navy-deep text-white" : "text-earth hover:text-warm-black"}`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("video")}
                className={`px-3 py-2.5 text-sm transition-colors ${viewMode === "video" ? "bg-navy-deep text-white" : "text-earth hover:text-warm-black"}`}
                title="Video view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active filter summary chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-stone/20">
              <span className="text-[10px] uppercase tracking-wider text-earth/50 font-semibold">Filters:</span>
              {applied.search && (
                <span className="inline-flex items-center gap-1 text-xs bg-coral/10 text-coral px-2.5 py-1 rounded-full font-medium">
                  "{applied.search}"
                  <button onClick={() => { setSearchQuery(""); setApplied(p => ({ ...p, search: "" })); }} className="hover:text-coral/60">×</button>
                </span>
              )}
              {applied.discipline !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-navy-deep/10 text-navy-deep px-2.5 py-1 rounded-full font-medium">
                  {applied.discipline}
                  <button onClick={() => { setFilterDiscipline("all"); setApplied(p => ({ ...p, discipline: "all" })); }} className="hover:opacity-60">×</button>
                </span>
              )}
              {applied.category !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-navy-deep/10 text-navy-deep px-2.5 py-1 rounded-full font-medium">
                  {applied.category}
                  <button onClick={() => { setFilterCategory("all"); setApplied(p => ({ ...p, category: "all" })); }} className="hover:opacity-60">×</button>
                </span>
              )}
              {applied.sex !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-navy-deep/10 text-navy-deep px-2.5 py-1 rounded-full font-medium">
                  {applied.sex === "male" ? "♂ Men" : "♀ Women"}
                  <button onClick={() => { setFilterSex("all"); setApplied(p => ({ ...p, sex: "all" })); }} className="hover:opacity-60">×</button>
                </span>
              )}
              {applied.minWpkg > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-navy-deep/10 text-navy-deep px-2.5 py-1 rounded-full font-medium">
                  ≥ {applied.minWpkg} W/kg
                  <button onClick={() => { setFilterMinWpkg(0); setApplied(p => ({ ...p, minWpkg: 0 })); }} className="hover:opacity-60">×</button>
                </span>
              )}
              {applied.continent !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-navy-deep/10 text-navy-deep px-2.5 py-1 rounded-full font-medium">
                  {applied.continent}
                  <button onClick={() => { setFilterContinent("all"); setApplied(p => ({ ...p, continent: "all" })); }} className="hover:opacity-60">×</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-earth">
            {canBrowse
              ? `${filtered.length} athlete${filtered.length !== 1 ? "s" : ""} found`
              : `Showing ${Math.min(PREVIEW_COUNT, filtered.length)} of ${filtered.length} athletes`}
          </div>
          {registeredCount > 0 && canBrowse && (
            <div className="flex items-center gap-1.5 text-xs text-earth/70">
              <span className="w-2 h-2 rounded-full bg-coral/60" />
              Registered members appear first
            </div>
          )}
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((athlete, index) => {
              // Guests: show PREVIEW_COUNT real cards, rest locked
              if (!isLoggedIn && index >= PREVIEW_COUNT) {
                return <LockedCard key={`locked-${index}`} />;
              }
              // All logged-in users see the card; showPower controls the stats strip
              return <AthleteCard key={athlete.id} athlete={athlete} showPower={showPower} />;
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((athlete, index) => {
              if (!isLoggedIn && index >= PREVIEW_COUNT) {
                return <LockedCard key={`locked-${index}`} />;
              }
              return <VideoCard key={athlete.id} athlete={athlete} />;
            })}
          </div>
        )}

        {/* Guest unlock CTA at the bottom */}
        {!isLoggedIn && filtered.length > PREVIEW_COUNT && (
          <div className="mt-8 rounded-2xl bg-navy-deep/5 border border-navy-deep/10 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-navy-deep/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-navy-deep/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-display text-xl text-navy-deep mb-1">
              {filtered.length - PREVIEW_COUNT} more athlete{filtered.length - PREVIEW_COUNT !== 1 ? "s" : ""} hidden
            </h3>
            <p className="text-earth text-sm mb-5">
              Create a free account to see all athletes, power data, compound scores, and contact details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup/athlete" className="bg-coral text-white font-semibold px-6 py-2.5 rounded-full hover:bg-coral/90 transition-colors text-sm">
                Join as Athlete — Free
              </Link>
              <Link href="/signup/scout" className="bg-navy-deep text-white font-semibold px-6 py-2.5 rounded-full hover:bg-navy-deep/90 transition-colors text-sm">
                Apply as Scout / Team
              </Link>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-earth text-lg mb-2">No athletes found</div>
            <p className="text-earth/60 text-sm">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
