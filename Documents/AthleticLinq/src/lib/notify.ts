/**
 * notify.ts — Admin signup notifications via EmailJS REST API
 *
 * Sends an email to the AthleticLinq admin whenever a new athlete or scout
 * registers. Uses EmailJS (emailjs.com) which works entirely client-side —
 * no server or API route needed.
 *
 * SETUP (one-time, ~5 minutes):
 * 1. Go to https://www.emailjs.com and create a free account
 * 2. Add a Gmail service (Email Services → Add New Service → Gmail)
 *    — connect your Gmail so EmailJS can send FROM it
 * 3. Create an Email Template (Email Templates → Create New Template)
 *    — Set "To Email" to: cpasio1986@gmail.com
 *    — Set "Subject" to: New {{account_type}} signup — {{full_name}}
 *    — Paste the body below into the template (HTML or text):
 *
 *    New {{account_type}} signup on AthleticLinq
 *
 *    Name:         {{full_name}}
 *    Email:        {{user_email}}
 *    Account type: {{account_type}}
 *    Organisation: {{organization}}
 *    Role:         {{role}}
 *    Country:      {{country}}
 *    Discipline:   {{discipline}}
 *    Category:     {{category}}
 *    Signed up at: {{signup_date}}
 *
 *    Go approve/verify them → https://supabase.com/dashboard/project/tzvftfkajclueyyyuhpm
 *
 * 4. Copy your Public Key from Account → API Keys
 * 5. Add the three values to Netlify:
 *    Site → Environment variables → Add:
 *      NEXT_PUBLIC_EMAILJS_SERVICE_ID   = service_xxxxxxx
 *      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID  = template_xxxxxxx
 *      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY   = your_public_key
 *    (Also add them to your local .env.local so dev works too)
 */

const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || "";

export interface SignupNotificationParams {
  type: "athlete" | "scout";
  firstName: string;
  lastName: string;
  email: string;
  // Scout-specific
  organization?: string;
  role?: string;
  country?: string;
  orgType?: string;
  // Athlete-specific
  discipline?: string;
  category?: string;
  nationality?: string;
  location?: string;
}

export async function notifySignup(params: SignupNotificationParams): Promise<void> {
  // Silently skip if EmailJS hasn't been configured yet
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.info("[notify] EmailJS not configured — skipping signup notification");
    return;
  }

  const now = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "full",
    timeStyle: "short",
  });

  const templateParams = {
    account_type : params.type === "scout" ? "Scout / Team" : "Athlete",
    full_name    : `${params.firstName} ${params.lastName}`,
    user_email   : params.email,
    organization : params.organization || params.nationality || "—",
    role         : params.role         || params.discipline  || "—",
    country      : params.country      || params.location    || "—",
    discipline   : params.discipline   || "—",
    category     : params.category     || params.orgType     || "—",
    signup_date  : now,
  };

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        service_id     : SERVICE_ID,
        template_id    : TEMPLATE_ID,
        user_id        : PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (!res.ok) {
      console.warn("[notify] EmailJS returned", res.status, await res.text());
    }
  } catch (err) {
    // Network error or EmailJS down — never block the signup flow
    console.warn("[notify] Failed to send signup notification:", err);
  }
}
