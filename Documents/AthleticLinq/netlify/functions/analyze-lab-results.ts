/**
 * analyze-lab-results — Extract physiological metrics from a lab test PDF/image
 * using the Claude API. Called from the athlete dashboard after upload.
 *
 * POST /.netlify/functions/analyze-lab-results
 * Body: { fileUrl: string, contentType: string }
 *
 * Setup: add ANTHROPIC_API_KEY to Netlify environment variables.
 */

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";

const EXTRACTION_PROMPT = `You are a sports science expert reading a physiological lab test report for a cyclist.
Extract every key performance metric you can find. Return ONLY a valid JSON object — no prose before or after it:

{
  "vo2max":         number | null,  // ml/kg/min
  "ltWatts1":       number | null,  // Lactate Threshold 1 / VT1 / aerobic threshold (watts)
  "ltWatts2":       number | null,  // Lactate Threshold 2 / VT2 / MLSS / anaerobic threshold (watts)
  "ltHr1":          number | null,  // heart rate at LT1 (bpm)
  "ltHr2":          number | null,  // heart rate at LT2 (bpm)
  "ftpLab":         number | null,  // lab FTP / CP / MLSS — watts (do NOT confuse with training FTP)
  "maxHr":          number | null,  // maximum heart rate (bpm)
  "powerAtVo2max":  number | null,  // power output at VO2max (watts)
  "vLamax":         number | null,  // maximal glycolytic rate (mmol/L/s)
  "testDate":       string | null,  // YYYY-MM-DD
  "labName":        string | null,  // name of the testing lab or clinic
  "notes":          string | null   // one key finding or caveat, max 80 chars
}`;

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string>;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

function json(statusCode: number, body: unknown) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (!ANTHROPIC_KEY) {
    console.error("[analyze-lab-results] ANTHROPIC_API_KEY not configured");
    return json(500, { error: "AI analysis not configured" });
  }

  let fileUrl: string;
  let contentType: string;
  try {
    const parsed = JSON.parse(event.body ?? "{}");
    fileUrl = parsed.fileUrl;
    contentType = parsed.contentType || "application/pdf";
    if (!fileUrl) throw new Error("Missing fileUrl");
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  // ── 1. Fetch the file ──────────────────────────────────────────────────────
  let base64: string;
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    base64 = Buffer.from(buffer).toString("base64");
  } catch (e) {
    console.error("[analyze-lab-results] file fetch failed:", e);
    return json(502, { error: "Could not fetch the uploaded file" });
  }

  // ── 2. Determine media type ────────────────────────────────────────────────
  const urlLower = fileUrl.toLowerCase();
  const isPdf = contentType.includes("pdf") || urlLower.endsWith(".pdf");
  const isImage = !isPdf;

  const mediaType: string = isPdf
    ? "application/pdf"
    : contentType.startsWith("image/")
      ? contentType
      : urlLower.endsWith(".png")
        ? "image/png"
        : urlLower.endsWith(".tiff") || urlLower.endsWith(".tif")
          ? "image/tiff"
          : "image/jpeg";

  const contentBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
    : { type: "image",    source: { type: "base64", media_type: mediaType, data: base64 } };

  // ── 3. Call Claude API ─────────────────────────────────────────────────────
  const apiHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": ANTHROPIC_KEY,
    "anthropic-version": "2023-06-01",
  };
  if (isPdf) {
    // PDF support (beta — may be GA by the time you read this)
    apiHeaders["anthropic-beta"] = "pdfs-2024-09-25";
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            contentBlock,
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[analyze-lab-results] Claude API error:", JSON.stringify(data));
      return json(502, { error: "AI analysis failed — please try again" });
    }

    const text: string = data.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[analyze-lab-results] no JSON in response:", text);
      return json(502, { error: "Could not parse AI response" });
    }

    const extracted = JSON.parse(match[0]);
    // Strip null values so we don't overwrite with nulls
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(extracted)) {
      if (v !== null && v !== undefined) clean[k] = v;
    }

    return json(200, { ...clean, extractedAt: new Date().toISOString() });
  } catch (e) {
    console.error("[analyze-lab-results] error:", e);
    return json(500, { error: "Internal error during AI analysis" });
  }

  // suppress TS unreachable warning
  void isImage;
};
