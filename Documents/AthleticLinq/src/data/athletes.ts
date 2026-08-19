export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  flag: string;
  location: string;
  category: string;
  discipline: string;
  team?: string;
  bio: string;
  profileImage: string;
  videoUrl?: string;
  videoThumbnail?: string;

  // Power & Performance
  ftp: number; // Functional Threshold Power (watts)
  ftpPerKg: number; // W/kg
  weight: number; // kg
  vo2max?: number;
  maxPower: number; // peak sprint watts
  fiveMinPower: number; // 5-min Mean Maximal Power
  twentyMinPower: number; // 20-min power

  // Compound Score (W²/kg) = 5min Power × (5min Power / Weight)
  // Based on Leo, Spragg, Wakefield & Swart methodology
  // Captures both absolute power (aerodynamic drag) and relative power (gravity)
  compoundScore: number;

  // Strava — basic
  stravaConnected: boolean;
  stravaUrl?: string;
  stravaWeeklyHours?: number;      // avg weekly training hours (from recent 4-wk totals)
  stravaWeeklyTSS?: number;        // estimated weekly TSS (moving_time × 70 / 3600)
  stravaRecentDistance?: number;   // 4-week distance in km
  stravaPowerVerified?: boolean;   // has power meter data (device_watts)
  // Strava — enhanced metrics (from OAuth + activity analysis)
  stravaFTPEstimate?: number;      // estimated FTP from best NP on training rides (W)
  stravaBestMaxPower?: number;     // highest peak power recorded (sprint proxy, W)
  stravaWeeklyElevation?: number;  // avg weekly elevation gain (m)
  stravaYTDDistance?: number;      // year-to-date distance (km)
  stravaYTDElevation?: number;     // year-to-date elevation (m)
  stravaYTDHours?: number;         // year-to-date hours
  stravaTotalSufferScore?: number; // sum of suffer scores over last 30 activities

  // Demographics
  sex?: string; // "male" | "female" | "prefer not to say"

  // Lab results
  labResultsUrl?: string;
  labResultsFileName?: string;

  // Social
  followers: number;
  verified: boolean;
  palmares: string[];
  tags: string[];
}

/**
 * Calculate Compound Score (W²/kg)
 * Formula: 5min MMP × (5min MMP / body mass)
 * Equivalent to: (5min Power)² / Weight
 * Source: Leo, Spragg, Wakefield & Swart (Journal of Science and Cycling)
 */
export function calculateCompoundScore(
  fiveMinPower: number,
  weight: number
): number {
  return Math.round(fiveMinPower * (fiveMinPower / weight));
}

export const athletes: Athlete[] = [
  {
    id: "1",
    firstName: "Marco",
    lastName: "Pellegrini",
    age: 19,
    nationality: "Italy",
    flag: "\ud83c\uddee\ud83c\uddf9",
    location: "Bergamo, Italy",
    category: "U23",
    discipline: "Road - Climber",
    team: "Team Lombardia Development",
    bio: "Pure climber from the foothills of the Italian Alps. 2025 U23 Italian Hill Climb champion. Dreaming of the Giro.",
    profileImage: "/athletes/marco.jpg",
    videoThumbnail: "/thumbnails/marco.jpg",
    ftp: 340,
    ftpPerKg: 5.67,
    weight: 60,
    vo2max: 78,
    maxPower: 1020,
    fiveMinPower: 380,
    twentyMinPower: 350,
    // 380 × (380/60) = 380 × 6.33 = 2407
    compoundScore: 2407,
    stravaConnected: true,
    stravaUrl: "https://www.strava.com/athletes/mpellegrini",
    stravaWeeklyHours: 18,
    stravaWeeklyTSS: 680,
    stravaRecentDistance: 1240,
    stravaPowerVerified: true,
    followers: 2840,
    verified: true,
    palmares: [
      "1st - U23 Italian Hill Climb Championship 2025",
      "3rd - Baby Giro Stage 4 2025",
      "1st - Trofeo Piva 2024",
    ],
    tags: ["climber", "grand-tour", "lightweight"],
  },
  {
    id: "2",
    firstName: "Astrid",
    lastName: "Andersen",
    age: 17,
    nationality: "Denmark",
    flag: "\ud83c\udde9\ud83c\uddf0",
    location: "Aarhus, Denmark",
    category: "Junior",
    discipline: "Road - Time Trial",
    team: "Danish Cycling Federation",
    bio: "Junior TT specialist with exceptional aerobic capacity. European Junior TT silver medalist. The next great Dane on two wheels.",
    profileImage: "/athletes/astrid.jpg",
    videoThumbnail: "/thumbnails/astrid.jpg",
    ftp: 285,
    ftpPerKg: 4.75,
    weight: 60,
    vo2max: 72,
    maxPower: 890,
    fiveMinPower: 310,
    twentyMinPower: 295,
    // 310 × (310/60) = 310 × 5.17 = 1602
    compoundScore: 1602,
    stravaConnected: false,
    followers: 1560,
    verified: true,
    palmares: [
      "2nd - European Junior TT Championship 2025",
      "1st - Danish Junior TT Championship 2025",
      "1st - Nordic Junior Road Race 2024",
    ],
    tags: ["time-trial", "tt-specialist", "aerobic"],
  },
  {
    id: "3",
    firstName: "Santiago",
    lastName: "Morales",
    age: 20,
    nationality: "Colombia",
    flag: "\ud83c\udde8\ud83c\uddf4",
    location: "Tunja, Boyac\u00e1, Colombia",
    category: "U23",
    discipline: "Road - Climber/GC",
    bio: "Born at altitude, built for the mountains. Vuelta de la Juventud stage winner. Following in the footsteps of Bernal and Quintana.",
    profileImage: "/athletes/santiago.jpg",
    videoThumbnail: "/thumbnails/santiago.jpg",
    ftp: 355,
    ftpPerKg: 5.85,
    weight: 61,
    vo2max: 82,
    maxPower: 980,
    fiveMinPower: 395,
    twentyMinPower: 368,
    // 395 × (395/61) = 395 × 6.48 = 2558
    compoundScore: 2558,
    stravaConnected: true,
    stravaUrl: "https://www.strava.com/athletes/smorales",
    stravaWeeklyHours: 22,
    stravaWeeklyTSS: 750,
    stravaRecentDistance: 1480,
    stravaPowerVerified: true,
    followers: 4200,
    verified: true,
    palmares: [
      "1st - Vuelta de la Juventud Stage 3 2025",
      "2nd GC - Vuelta de la Juventud 2025",
      "1st - Clasica de Boyac\u00e1 2024",
      "National U23 Road Champion 2024",
    ],
    tags: ["climber", "gc-contender", "altitude", "grand-tour"],
  },
  {
    id: "4",
    firstName: "Lena",
    lastName: "Hofmann",
    age: 18,
    nationality: "Germany",
    flag: "\ud83c\udde9\ud83c\uddea",
    location: "Stuttgart, Germany",
    category: "U23",
    discipline: "Road - Sprinter",
    team: "CERATIZIT Development",
    bio: "Explosive sprinter with a track background. Junior track omnium national champion transitioning to road. Raw power meets tactical intelligence.",
    profileImage: "/athletes/lena.jpg",
    videoThumbnail: "/thumbnails/lena.jpg",
    ftp: 270,
    ftpPerKg: 4.22,
    weight: 64,
    vo2max: 65,
    maxPower: 1380,
    fiveMinPower: 290,
    twentyMinPower: 278,
    // 290 × (290/64) = 290 × 4.53 = 1314
    compoundScore: 1314,
    stravaConnected: true,
    stravaUrl: "https://www.strava.com/athletes/lhofmann",
    stravaWeeklyHours: 14,
    stravaWeeklyTSS: 520,
    stravaRecentDistance: 960,
    stravaPowerVerified: true,
    followers: 3100,
    verified: false,
    palmares: [
      "1st - German Junior Track Omnium 2025",
      "2nd - German Junior Road Race 2025",
      "3rd - Healthy Ageing Tour Juniors 2024",
    ],
    tags: ["sprinter", "track", "explosive-power"],
  },
  {
    id: "5",
    firstName: "Takumi",
    lastName: "Nakamura",
    age: 21,
    nationality: "Japan",
    flag: "\ud83c\uddef\ud83c\uddf5",
    location: "Utsunomiya, Japan",
    category: "U23",
    discipline: "Road - All-rounder",
    team: "Shimano Racing Development",
    bio: "Versatile all-rounder with strong climbing and TT abilities. Asia Tour U23 series winner. Aiming for a WorldTour contract.",
    profileImage: "/athletes/takumi.jpg",
    videoThumbnail: "/thumbnails/takumi.jpg",
    ftp: 330,
    ftpPerKg: 5.23,
    weight: 63,
    vo2max: 75,
    maxPower: 1150,
    fiveMinPower: 365,
    twentyMinPower: 342,
    // 365 × (365/63) = 365 × 5.79 = 2115
    compoundScore: 2115,
    stravaConnected: true,
    stravaUrl: "https://www.strava.com/athletes/tnakamura",
    stravaWeeklyHours: 16,
    stravaWeeklyTSS: 620,
    stravaRecentDistance: 1100,
    stravaPowerVerified: true,
    followers: 1890,
    verified: true,
    palmares: [
      "1st GC - Asia Tour U23 Series 2025",
      "2nd - Tour de Hokkaido 2025",
      "1st - Japan Cup U23 2024",
    ],
    tags: ["all-rounder", "gc-contender", "versatile"],
  },
  {
    id: "6",
    firstName: "Emile",
    lastName: "Dubois",
    age: 16,
    nationality: "France",
    flag: "\ud83c\uddeb\ud83c\uddf7",
    location: "Nice, France",
    category: "Junior",
    discipline: "Road - Climber",
    bio: "The youngest sensation in French cycling. Already posting W/kg numbers that turn heads. Training on the cols above Nice since age 12.",
    profileImage: "/athletes/emile.jpg",
    videoThumbnail: "/thumbnails/emile.jpg",
    ftp: 290,
    ftpPerKg: 5.27,
    weight: 55,
    vo2max: 74,
    maxPower: 850,
    fiveMinPower: 320,
    twentyMinPower: 300,
    // 320 × (320/55) = 320 × 5.82 = 1862
    compoundScore: 1862,
    stravaConnected: false,
    followers: 5600,
    verified: true,
    palmares: [
      "1st - French Junior Hill Climb Championship 2025",
      "1st GC - Ronde des Vall\u00e9es 2025",
      "2nd - Ain\u00e9 Junior Classic 2024",
    ],
    tags: ["climber", "prodigy", "lightweight", "grand-tour"],
  },
  {
    id: "7",
    firstName: "Olivia",
    lastName: "van der Berg",
    age: 19,
    nationality: "Netherlands",
    flag: "\ud83c\uddf3\ud83c\uddf1",
    location: "Utrecht, Netherlands",
    category: "U23",
    discipline: "Road - Classics/Puncheur",
    team: "SD Worx Development",
    bio: "Dutch puncheur with an incredible kick. Born to race the Ardennes classics. Already training with the senior squad on weekends.",
    profileImage: "/athletes/olivia.jpg",
    videoThumbnail: "/thumbnails/olivia.jpg",
    ftp: 295,
    ftpPerKg: 4.92,
    weight: 60,
    vo2max: 70,
    maxPower: 1200,
    fiveMinPower: 340,
    twentyMinPower: 305,
    // 340 × (340/60) = 340 × 5.67 = 1927
    compoundScore: 1927,
    stravaConnected: true,
    stravaUrl: "https://www.strava.com/athletes/ovdberg",
    stravaWeeklyHours: 15,
    stravaWeeklyTSS: 590,
    stravaRecentDistance: 1050,
    stravaPowerVerified: true,
    followers: 2200,
    verified: false,
    palmares: [
      "1st - Omloop Het Nieuwsblad U23 Women 2025",
      "3rd - Fl\u00e8che Wallonne U23 2025",
      "1st - Dutch U23 Road Race 2024",
    ],
    tags: ["puncheur", "classics", "one-day-races"],
  },
  {
    id: "8",
    firstName: "Ethan",
    lastName: "Williams",
    age: 22,
    nationality: "Australia",
    flag: "\ud83c\udde6\ud83c\uddfa",
    location: "Adelaide, Australia",
    category: "U23",
    discipline: "Road - Sprinter/Rouleur",
    team: "ARA Pro Racing Sunshine Coast",
    bio: "Powerful rouleur who can sprint from a small group. NRS winner looking to make the jump to Europe. Trained by former WorldTour pros.",
    profileImage: "/athletes/ethan.jpg",
    videoThumbnail: "/thumbnails/ethan.jpg",
    ftp: 360,
    ftpPerKg: 4.80,
    weight: 75,
    vo2max: 71,
    maxPower: 1520,
    fiveMinPower: 370,
    twentyMinPower: 372,
    // 370 × (370/75) = 370 × 4.93 = 1825
    compoundScore: 1825,
    stravaConnected: true,
    stravaUrl: "https://www.strava.com/athletes/ewilliams",
    stravaWeeklyHours: 20,
    stravaWeeklyTSS: 710,
    stravaRecentDistance: 1320,
    stravaPowerVerified: true,
    followers: 1400,
    verified: true,
    palmares: [
      "1st - Tour of Tasmania Stage 2 2025",
      "2nd GC - NRS Series 2025",
      "1st - Adelaide Tour criterium 2024",
    ],
    tags: ["sprinter", "rouleur", "power", "breakaway"],
  },
];

export function getAthleteById(id: string): Athlete | undefined {
  return athletes.find((a) => a.id === id);
}

/**
 * Compound Score tier labels based on U23 research thresholds
 * >3110 W²/kg = podium/win predictive in U23 pro racing
 * These tiers are calibrated for development-age athletes (16-25)
 */
export function getCompoundScoreLabel(score: number): string {
  if (score >= 2500) return "Exceptional";
  if (score >= 2000) return "Elite";
  if (score >= 1600) return "Advanced";
  if (score >= 1200) return "Developing";
  return "Emerging";
}

export function getCompoundScoreColor(score: number): string {
  if (score >= 2500) return "#c83c5a";
  if (score >= 2000) return "#5a6b4a";
  if (score >= 1600) return "#1a2744";
  if (score >= 1200) return "#8c7b6b";
  return "#e5ddd3";
}

export interface UCILevel {
  label: string;
  short: string;
  color: string;
  bg: string;
}

/**
 * Maps compound score + age category to an approximate UCI competition level.
 * Thresholds calibrated against Leo, Spragg, Wakefield & Swart (2022) data.
 */
export function getUCILevel(score: number, category?: string): UCILevel {
  const cat = (category || "").toLowerCase();

  if (cat.includes("junior")) {
    if (score >= 1800) return { label: "Junior Elite",  short: "JNR Elite", color: "#c83c5a", bg: "#fdf0f3" };
    if (score >= 1300) return { label: "Junior Adv.",   short: "JNR Adv",   color: "#1a2744", bg: "#ebf0fa" };
    return               { label: "Junior",             short: "Junior",    color: "#6b7c93", bg: "#f0f2f7" };
  }

  if (score >= 3000) return { label: "WorldTour",     short: "WT",          color: "#c83c5a", bg: "#fdf0f3" };
  if (score >= 2500) return { label: "Pro Team",       short: "Pro",         color: "#9b4f00", bg: "#fff3e0" };
  if (score >= 2000) return { label: "Continental",    short: "Conti",       color: "#1a6b3a", bg: "#e8f5ef" };
  if (score >= 1500) return { label: "Nat. Elite",     short: "Nat.",        color: "#1a2744", bg: "#ebf0fa" };
  if (score >= 1200) return { label: "Cat 1 / Club",   short: "Cat 1",       color: "#6b7c93", bg: "#f0f2f7" };
  return               { label: "Amateur",             short: "Ama.",        color: "#8c7b6b", bg: "#f5f0eb" };
}
