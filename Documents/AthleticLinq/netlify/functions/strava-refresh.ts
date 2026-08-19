/**
 * Strava data refresh — called from the athlete dashboard "Sync" button.
 *
 * POST /.netlify/functions/strava-refresh
 * Body: {
 *   athleteId: string;
 *   // Client-side fallback tokens (from localStorage) so the sync works
 *   // even if the athlete's row doesn't exist in Supabase yet:
 *   accessToken?: string;
 *   refreshToken?: string;
 *   tokenExpiresAt?: number;
 *   stravaAthleteId?: number;
 * }
 *
 * Strategy:
 *  1. Try to read tokens from Supabase (preferred — always fresh).
 *  2. If Supabase lookup fails, fall back to client-provided tokens.
 *  3. Refresh the access token if expired.
 *  4. Fetch latest stats from Strava.
 *  5. Best-effort Supabase persist (non-fatal).
 *  6. Return fresh stats as JSON.
 */

const CLIENT_ID  = process.env.STRAVA_CLIENT_ID    ?? "";
const CLIENT_SEC = process.env.STRAVA_CLIENT_SECRET ?? "";
const SB_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "";
const SB_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

interface NetlifyEvent {
  httpMethod: string;
  queryStringParameters: Record<string, string> | null;
  body: string | null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

function json(statusCode: number, body: unknown) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

// ── Supabase helpers (best-effort — never throw to caller) ───────────────────

async function sbGet(athleteId: string): Promise<Record<string, unknown> | null> {
  try {
    const res  = await fetch(
      `${SB_URL}/rest/v1/athletes?id=eq.${athleteId}&select=profile`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0) return rows[0].profile as Record<string, unknown>;
  } catch { /* non-fatal */ }
  return null;
}

async function sbPatch(athleteId: string, profile: unknown) {
  try {
    await fetch(`${SB_URL}/rest/v1/athletes?id=eq.${athleteId}`, {
      method: "PATCH",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ profile }),
    });
  } catch { /* non-fatal */ }
}

// ── FTP coefficient based on ride duration ───────────────────────────────────
const ftpCoeff = (sec: number) => {
  const h = sec / 3600;
  return h >= 1.25 ? 1.0 : h >= 0.67 ? 0.97 : 0.93;
};

// ── Handler ──────────────────────────────────────────────────────────────────
export const handler = async (event: NetlifyEvent) => {
  // Support both GET (legacy) and POST
  let athleteId: string | undefined;
  let clientAccessToken: string | undefined;
  let clientRefreshToken: string | undefined;
  let clientTokenExpiresAt: number | undefined;
  let clientStravaAthleteId: number | undefined;

  if (event.httpMethod === "POST" && event.body) {
    try {
      const parsed = JSON.parse(event.body);
      athleteId            = parsed.athleteId;
      clientAccessToken    = parsed.accessToken;
      clientRefreshToken   = parsed.refreshToken;
      clientTokenExpiresAt = parsed.tokenExpiresAt;
      clientStravaAthleteId = parsed.stravaAthleteId;
    } catch {
      return json(400, { error: "Invalid JSON body" });
    }
  } else {
    athleteId = (event.queryStringParameters ?? {}).athleteId;
  }

  if (!athleteId) return json(400, { error: "Missing athleteId" });

  // ── 1. Get tokens — Supabase first, client fallback ─────────────────────────
  const profile = await sbGet(athleteId);

  // Merge: Supabase wins for any field it has, client values fill the gaps
  let accessToken:    string = (profile?.stravaAccessToken  as string)  || clientAccessToken    || "";
  let refreshToken:   string = (profile?.stravaRefreshToken as string)  || clientRefreshToken   || "";
  let expiresAt:      number = (profile?.stravaTokenExpiresAt as number) ?? clientTokenExpiresAt ?? 0;
  const stravaAthleteId: number = (profile?.stravaAthleteId as number) ?? clientStravaAthleteId ?? 0;

  if (!accessToken || !refreshToken) {
    return json(400, { error: "Strava not connected via OAuth — please reconnect." });
  }
  if (!stravaAthleteId) {
    return json(400, { error: "Missing Strava athlete ID — please reconnect." });
  }

  try {
    // ── 2. Refresh access token if expired (5-min buffer) ─────────────────────
    if (Date.now() / 1000 >= expiresAt - 300) {
      const refreshRes  = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SEC,
          grant_type:    "refresh_token",
          refresh_token: refreshToken,
        }),
      });
      const refreshData = await refreshRes.json();
      if (refreshData.access_token) {
        accessToken  = refreshData.access_token;
        refreshToken = refreshData.refresh_token;
        expiresAt    = refreshData.expires_at;
      } else {
        console.error("[strava-refresh] token refresh failed:", JSON.stringify(refreshData));
        // Continue with the existing token — it may still be valid
      }
    }

    // ── 3. Fetch fresh stats ───────────────────────────────────────────────────
    const [statsRes, activitiesRes] = await Promise.all([
      fetch(`https://www.strava.com/api/v3/athletes/${stravaAthleteId}/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://www.strava.com/api/v3/athlete/activities?per_page=30", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const stats   = await statsRes.json();
    const rawActs = await activitiesRes.json();

    if (!statsRes.ok) {
      console.error("[strava-refresh] stats API error:", JSON.stringify(stats));
      return json(502, { error: "Strava API error — please try again." });
    }

    const recent = stats.recent_ride_totals ?? {};
    const ytd    = stats.ytd_ride_totals    ?? {};

    // Basic volume
    const stravaWeeklyHours     = recent.moving_time    ? Math.round((recent.moving_time / 3600 / 4) * 10) / 10 : undefined;
    const stravaRecentDistance  = recent.distance        ? Math.round(recent.distance / 1000)                    : undefined;
    const stravaWeeklyTSS       = recent.moving_time    ? Math.round((recent.moving_time / 3600) * 70)           : undefined;
    const stravaWeeklyElevation = recent.elevation_gain  ? Math.round(recent.elevation_gain / 4)                 : undefined;

    // Year-to-date totals
    const stravaYTDDistance  = ytd.distance       ? Math.round(ytd.distance / 1000)                 : undefined;
    const stravaYTDElevation = ytd.elevation_gain  ? Math.round(ytd.elevation_gain)                  : undefined;
    const stravaYTDHours     = ytd.moving_time     ? Math.round((ytd.moving_time / 3600) * 10) / 10 : undefined;

    // Activity analysis
    interface StravaAct {
      device_watts?: boolean;
      weighted_average_watts?: number;
      max_watts?: number;
      moving_time?: number;
      suffer_score?: number;
    }
    const acts: StravaAct[] = Array.isArray(rawActs) ? rawActs as StravaAct[] : [];

    const stravaPowerVerified = acts.some(a => a.device_watts === true);

    const powerActs = acts.filter(a =>
      a.device_watts === true &&
      typeof a.weighted_average_watts === "number" &&
      a.weighted_average_watts > 0 &&
      typeof a.moving_time === "number" &&
      a.moving_time >= 1200
    );

    let stravaFTPEstimate: number | undefined;
    if (powerActs.length > 0) {
      const best = Math.max(...powerActs.map(
        a => Math.round(a.weighted_average_watts! * ftpCoeff(a.moving_time!))
      ));
      stravaFTPEstimate = best > 0 ? best : undefined;
    }

    let stravaBestMaxPower: number | undefined;
    if (powerActs.length > 0) {
      const peak = Math.max(...powerActs.map(a => a.max_watts ?? 0));
      stravaBestMaxPower = peak > 0 ? peak : undefined;
    }

    const sufferTotal = acts.reduce((s, a) => s + (a.suffer_score ?? 0), 0);
    const stravaTotalSufferScore: number | undefined = sufferTotal > 0 ? sufferTotal : undefined;

    const stravaLastSynced = new Date().toISOString();

    // ── 4. Best-effort Supabase persist ───────────────────────────────────────
    const updatedProfile = {
      ...(profile ?? {}),
      stravaAccessToken:     accessToken,
      stravaRefreshToken:    refreshToken,
      stravaTokenExpiresAt:  expiresAt,
      stravaAthleteId,
      stravaConnected:       true,
      stravaWeeklyHours,
      stravaWeeklyTSS,
      stravaRecentDistance,
      stravaPowerVerified,
      stravaFTPEstimate,
      stravaBestMaxPower,
      stravaWeeklyElevation,
      stravaYTDDistance,
      stravaYTDElevation,
      stravaYTDHours,
      stravaTotalSufferScore,
      stravaLastSynced,
    };
    await sbPatch(athleteId, updatedProfile);

    // ── 5. Return fresh data ──────────────────────────────────────────────────
    return json(200, {
      stravaWeeklyHours,
      stravaWeeklyTSS,
      stravaRecentDistance,
      stravaPowerVerified,
      stravaFTPEstimate,
      stravaBestMaxPower,
      stravaWeeklyElevation,
      stravaYTDDistance,
      stravaYTDElevation,
      stravaYTDHours,
      stravaTotalSufferScore,
      stravaLastSynced,
      // Return refreshed token state so dashboard can update localStorage
      stravaAccessToken:    accessToken,
      stravaRefreshToken:   refreshToken,
      stravaTokenExpiresAt: expiresAt,
    });
  } catch (err) {
    console.error("[strava-refresh] error:", err);
    return json(500, { error: "Internal server error — please try again." });
  }
};
