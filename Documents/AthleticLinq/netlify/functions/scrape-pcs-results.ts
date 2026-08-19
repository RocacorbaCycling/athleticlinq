/**
 * scrape-pcs-results — Fetch a rider's best results from ProCyclingStats.com
 *
 * POST /.netlify/functions/scrape-pcs-results
 * Body: { pcsUrl: string }  e.g. https://www.procyclingstats.com/rider/tadej-pogacar
 *
 * Returns { results: PcsResult[], error?: string }
 */

export type PcsResult = {
  year: string;
  race: string;
  position: number;
  category: string;
  raceUrl: string;
};

import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let pcsUrl: string;
  try {
    ({ pcsUrl } = JSON.parse(event.body ?? "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid body", results: [] }) };
  }

  if (!pcsUrl || !pcsUrl.includes("procyclingstats.com/rider/")) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "URL must be a procyclingstats.com/rider/… page", results: [] }),
    };
  }

  // Normalise — drop query strings
  const cleanUrl = pcsUrl.split("?")[0].replace(/\/$/, "");

  try {
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: `PCS returned HTTP ${res.status}`, results: [] }),
      };
    }

    const html = await res.text();

    if (html.includes("cf-browser-verification") || html.includes("Just a moment")) {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: "PCS is protected by Cloudflare — results must be added manually", results: [] }),
      };
    }

    const results = parsePcsResults(html);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: "Scraping failed — results must be added manually", results: [] }),
    };
  }
};

// ── HTML parser ───────────────────────────────────────────────────────────────

const CATEGORY_RANK: Record<string, number> = {
  "2.UWT": 1, "1.UWT": 2, "2.Pro": 3, "1.Pro": 4,
  "2.HC": 5,  "1.HC": 6,  "2.1": 7,  "1.1": 8,
  "2.2": 9,   "1.2": 10,  CN: 11, CC: 12,
};

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parsePcsResults(html: string): PcsResult[] {
  const results: PcsResult[] = [];
  const seen = new Set<string>();

  // PCS race links follow the pattern /race/<slug>/<year>/...
  const raceLinkRe = /<a\s[^>]*href="(\/race\/([^/"]+)\/(20\d{2})[^"]*)"[^>]*>([^<]{3,})<\/a>/gi;

  let m: RegExpExecArray | null;
  while ((m = raceLinkRe.exec(html)) !== null) {
    const href = m[1];           // /race/tour-de-france/2024/gc
    const year = m[3];
    const raceName = m[4].trim();

    if (!raceName || raceName.length < 3) continue;
    const key = `${raceName}|${year}`;
    if (seen.has(key)) continue;

    // Look for position in up to 400 chars BEFORE this link
    const before = html.slice(Math.max(0, m.index - 400), m.index);

    // Position: standalone number 1–50 near end of the "before" slice
    const posMatch = before.match(/(?:^|[>\s,|])([1-9]|[1-4]\d)(?=\s*[<\s,|])/g);
    const rawPos = posMatch ? posMatch[posMatch.length - 1].replace(/[>\s,|]/g, "") : null;
    const position = rawPos ? parseInt(rawPos, 10) : 999;

    if (position > 50) continue;

    // Race category from context
    const ctx = before + html.slice(m.index, m.index + 200);
    const catMatch = ctx.match(/\b(2\.UWT|1\.UWT|2\.Pro|1\.Pro|2\.HC|1\.HC|2\.1|1\.1|2\.2|1\.2|CN|CC)\b/);
    const category = catMatch ? catMatch[1] : "";

    seen.add(key);
    results.push({
      year,
      race: raceName,
      position,
      category,
      raceUrl: `https://www.procyclingstats.com${href}`,
    });

    if (results.length >= 40) break;
  }

  // Sort: by position asc, then category prestige, then year desc
  results.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    const ca = CATEGORY_RANK[a.category] ?? 99;
    const cb = CATEGORY_RANK[b.category] ?? 99;
    if (ca !== cb) return ca - cb;
    return parseInt(b.year) - parseInt(a.year);
  });

  // Deduplicate race names keeping best position
  const byRace = new Map<string, PcsResult>();
  for (const r of results) {
    const existing = byRace.get(r.race);
    if (!existing || r.position < existing.position) byRace.set(r.race, r);
  }

  return [...byRace.values()]
    .sort((a, b) => a.position - b.position)
    .slice(0, 10);
}
