/**
 * Strava OAuth2 callback handler.
 *
 * After the athlete authorises on Strava, Strava redirects here with ?code=&state=<athleteId>.
 * We exchange the code for tokens, fetch their stats, then redirect back to the dashboard
 * with the Strava data encoded in the URL so the client can save it to localStorage + Supabase.
 * This avoids any server-side Supabase auth issues.
 */

const BASE_URL   = "https://athleticlinq.com";
const CLIENT_ID  = process.env.STRAVA_CLIENT_ID  ?? "";
const CLIENT_SEC = process.env.STRAVA_CLIENT_SECRET ?? "";
const SB_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

interface NetlifyEvent {
  queryStringParameters: Record<string, string> | null;
}

function redirect(path: string) {
  return { statusCode: 302, headers: { Location: `${BASE_URL}${path}` }, body: "" };
}

export const handler = async (event: NetlifyEvent) => {
  const params = event.queryStringParameters ?? {};
  const { code, state: athleteId, error } = params;

  if (error || !code || !athleteId) {
    return redirect(`/dashboard?strava=${error === "access_denied" ? "denied" : "error"}&reason=no-code`);
  }

  // ── 1. Exchange auth code for tokens ────────────────────────────────────────
  let token: Record<string, unknown>;
  try {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SEC,
        code,
        grant_type: "authorization_code",
      }),
    });
    token = await res.json();
  } catch (e) {
    console.error("[strava-callback] token fetch failed:", e);
    return redirect("/dashboard?strava=error&reason=token-fetch-failed");
  }

  if (!token.access_token) {
    console.error("[strava-callback] no access_token in response:", JSON.stringify(token));
    return redirect("/dashboard?strava=error&reason=token-exchange");
  }

  const access_token  = token.access_token  as string;
  const refresh_token = token.refresh_token as string;
  const expires_at    = token.expires_at    as number;
  const stravaAthlete = token.athlete       as { id: number };

  // ── 2. Fetch athlete stats (non-fatal if it fails) ──────────────────────────
  let stravaWeeklyHours: number | undefined;
  let stravaRecentDistance: number | undefined;
  let stravaWeeklyTSS: number | undefined;
  let stravaPowerVerified = false;
  let stravaFTPEstimate: number | undefined;
  let stravaBestMaxPower: number | undefined;
  let stravaWeeklyElevation: number | undefined;
  let stravaYTDDistance: number | undefined;
  let stravaYTDElevation: number | undefined;
  let stravaYTDHours: number | undefined;
  let stravaTotalSufferScore: number | undefined;

  try {
    const [statsRes, activitiesRes] = await Promise.all([
      fetch(`https://www.strava.com/api/v3/athletes/${stravaAthlete.id}/stats`, {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
      fetch("https://www.strava.com/api/v3/athlete/activities?per_page=30", {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
    ]);

    const stats   = await statsRes.json() as Record<string, unknown>;
    const rawActs = await activitiesRes.json();

    const recent = (stats.recent_ride_totals ?? {}) as Record<string, number>;
    const ytd    = (stats.ytd_ride_totals    ?? {}) as Record<string, number>;

    // Basic volume
    stravaWeeklyHours    = recent.moving_time    ? Math.round((recent.moving_time / 3600 / 4) * 10) / 10 : undefined;
    stravaRecentDistance = recent.distance        ? Math.round(recent.distance / 1000)                    : undefined;
    stravaWeeklyTSS      = recent.moving_time    ? Math.round((recent.moving_time / 3600) * 70)           : undefined;
    stravaWeeklyElevation = recent.elevation_gain ? Math.round(recent.elevation_gain / 4)                 : undefined;

    // Year-to-date totals
    stravaYTDDistance  = ytd.distance       ? Math.round(ytd.distance / 1000)                  : undefined;
    stravaYTDElevation = ytd.elevation_gain  ? Math.round(ytd.elevation_gain)                   : undefined;
    stravaYTDHours     = ytd.moving_time     ? Math.round((ytd.moving_time / 3600) * 10) / 10  : undefined;

    // Activity analysis
    interface StravaAct {
      device_watts?: boolean;
      weighted_average_watts?: number;
      max_watts?: number;
      moving_time?: number;
      suffer_score?: number;
    }
    const acts: StravaAct[] = Array.isArray(rawActs) ? rawActs as StravaAct[] : [];

    stravaPowerVerified = acts.some(a => a.device_watts === true);

    // Power rides: power meter + normalized power + at least 20 min
    const powerActs = acts.filter(a =>
      a.device_watts === true &&
      typeof a.weighted_average_watts === "number" &&
      a.weighted_average_watts > 0 &&
      typeof a.moving_time === "number" &&
      a.moving_time >= 1200
    );

    // FTP estimate: best NP adjusted by ride duration
    // 20-40 min effort × 0.93; 40-75 min × 0.97; 75+ min × 1.0
    const ftpCoeff = (sec: number) => {
      const h = sec / 3600;
      return h >= 1.25 ? 1.0 : h >= 0.67 ? 0.97 : 0.93;
    };
    if (powerActs.length > 0) {
      const best = Math.max(...powerActs.map(
        a => Math.round(a.weighted_average_watts! * ftpCoeff(a.moving_time!))
      ));
      stravaFTPEstimate = best > 0 ? best : undefined;
    }

    // Best peak power (1-second max, sprint/neuromuscular proxy)
    if (powerActs.length > 0) {
      const peak = Math.max(...powerActs.map(a => a.max_watts ?? 0));
      stravaBestMaxPower = peak > 0 ? peak : undefined;
    }

    // Training load: sum of suffer scores
    const sufferTotal = acts.reduce((s, a) => s + (a.suffer_score ?? 0), 0);
    stravaTotalSufferScore = sufferTotal > 0 ? sufferTotal : undefined;

  } catch (e) {
    console.error("[strava-callback] stats fetch failed (non-fatal):", e);
  }

  // ── 3. Build payload to pass back to dashboard ──────────────────────────────
  // The dashboard will receive this, call updateProfile(), and save to
  // localStorage + Supabase via the already-authenticated client-side session.
  const stravaData = {
    stravaConnected:       true,
    stravaUrl:             `https://www.strava.com/athletes/${stravaAthlete.id}`,
    stravaAthleteId:       stravaAthlete.id,
    stravaAccessToken:     access_token,
    stravaRefreshToken:    refresh_token,
    stravaTokenExpiresAt:  expires_at,
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
    stravaLastSynced:      new Date().toISOString(),
  };

  // ── 4. Best-effort Supabase update (server-side) ────────────────────────────
  // This may fail if the athlete signed up before Supabase was configured — that's
  // fine, the client-side updateProfile() call in the dashboard handles it instead.
  try {
    const getRes = await fetch(
      `${SB_URL}/rest/v1/athletes?id=eq.${athleteId}&select=profile`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const rows = await getRes.json();
    if (Array.isArray(rows) && rows.length > 0) {
      const updatedProfile = { ...rows[0].profile, ...stravaData };
      await fetch(`${SB_URL}/rest/v1/athletes?id=eq.${athleteId}`, {
        method: "PATCH",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ profile: updatedProfile }),
      });
    }
  } catch (e) {
    console.error("[strava-callback] Supabase update failed (non-fatal):", e);
  }

  // ── 5. Redirect to dashboard with Strava data in URL ───────────────────────
  const encoded = encodeURIComponent(JSON.stringify(stravaData));
  return redirect(`/dashboard?strava=connected&sd=${encoded}`);
};
