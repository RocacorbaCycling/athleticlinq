/**
 * Power Duration Curve builder.
 *
 * Builds a 12-bar curve anchored at known real data points (sprint, 5-min,
 * 20-min, 60-min / FTP) and logarithmically interpolates between them.
 * This gives a physiologically accurate shape rather than fixed percentages.
 */

export interface CurveBar {
  dur: string;      // display label e.g. "5s", "5m"
  durSec: number;   // duration in seconds
  pct: number;      // height as % of max (5–100)
  watts: number;    // estimated watts at this duration
}

const BARS: { dur: string; durSec: number }[] = [
  { dur: "5s",   durSec: 5 },
  { dur: "10s",  durSec: 10 },
  { dur: "30s",  durSec: 30 },
  { dur: "1m",   durSec: 60 },
  { dur: "2m",   durSec: 120 },
  { dur: "5m",   durSec: 300 },
  { dur: "10m",  durSec: 600 },
  { dur: "20m",  durSec: 1200 },
  { dur: "30m",  durSec: 1800 },
  { dur: "60m",  durSec: 3600 },
  { dur: "90m",  durSec: 5400 },
  { dur: "120m", durSec: 7200 },
];

/**
 * @param maxW   - Peak sprint power (W) — 5-second anchor
 * @param fiveW  - 5-minute mean maximal power (W)
 * @param twentyW - 20-minute power (W)
 * @param ftpW   - FTP or 60-min power (W); use stravaFTPEstimate if available
 */
export function buildPowerCurve(
  maxW: number,
  fiveW: number,
  twentyW: number,
  ftpW: number,
): CurveBar[] {
  const safeMax = maxW || 1;

  // Anchor points [durSec, watts] — only include those with real data
  const anchors: [number, number][] = (
    [
      [5,    maxW],
      [300,  fiveW],
      [1200, twentyW],
      [3600, ftpW],
    ] as [number, number][]
  ).filter(([, w]) => w > 0);

  if (anchors.length < 2) {
    // Fallback to classic percentage model if we don't have enough anchors
    const fallback: [number, number][] = [
      [5,    100], [10, 92], [30, 78], [60, 70],
      [120,  62], [300, 55], [600, 50], [1200, 46],
      [1800, 43], [3600, 38], [5400, 34], [7200, 30],
    ];
    return BARS.map(({ dur, durSec }, i) => {
      const pct = fallback[i]?.[1] ?? 30;
      return { dur, durSec, pct, watts: Math.round((safeMax * pct) / 100) };
    });
  }

  function interpW(s: number): number {
    if (s <= anchors[0][0]) return anchors[0][1];
    const last = anchors[anchors.length - 1];
    if (s >= last[0]) {
      // Power law decay beyond last anchor (~7% per doubling of duration)
      const halves = Math.log2(s / last[0]);
      return Math.max(last[1] * Math.pow(0.93, halves), last[1] * 0.5);
    }
    for (let i = 0; i < anchors.length - 1; i++) {
      const [d0, w0] = anchors[i];
      const [d1, w1] = anchors[i + 1];
      if (s >= d0 && s <= d1) {
        // Log-linear interpolation between anchors
        const t = (Math.log(s) - Math.log(d0)) / (Math.log(d1) - Math.log(d0));
        return w0 + t * (w1 - w0);
      }
    }
    return safeMax;
  }

  return BARS.map(({ dur, durSec }) => {
    const watts = Math.round(interpW(durSec));
    const pct   = Math.max(5, Math.min(100, Math.round((watts / safeMax) * 100)));
    return { dur, durSec, pct, watts };
  });
}
