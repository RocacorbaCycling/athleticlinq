export interface LabExtractedData {
  vo2max?: number;
  ltWatts1?: number;
  ltWatts2?: number;
  ltHr1?: number;
  ltHr2?: number;
  ftpLab?: number;
  maxHr?: number;
  powerAtVo2max?: number;
  vLamax?: number;
  testDate?: string;
  labName?: string;
  notes?: string;
  extractedAt?: string;
}

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
  labExtractedData?: LabExtractedData;

  // Social
  followers: number;
  verified: boolean;
  palmares: string[];
  tags: string[];

  // ProCyclingStats
  procyclingstatsUrl?: string;
  pcsResults?: Array<{ year: string; race: string; position: number; category: string; raceUrl: string }>;
  pcsLastSync?: string;
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
  // No demo athletes — all profiles are real registered accounts from Supabase
  // (previously contained 8 example profiles, removed to show only live signups)
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
