"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, AthleteProfile, ScoutProfile, ParentProfile, isScout, isAthlete, isParent } from "@/context/AuthContext";
import { calculateCompoundScore } from "@/data/athletes";
import { supabase } from "@/lib/supabase";
import CompoundScore from "@/components/CompoundScore";
import VideoPlayer from "@/components/VideoPlayer";

// ── Derive power profile from Strava FTP estimate ────────────────────────────
// Only runs when athlete has a power meter (stravaPowerVerified).
// Physiological ratios: FTP ≈ 82% of 5-min MMP, ≈ 95% of 20-min power.
function stravaToPowerFields(
  stravaFTPEstimate: number | undefined,
  stravaBestMaxPower: number | undefined,
  stravaPowerVerified: boolean | undefined,
  weightStr: string | undefined,
): Partial<AthleteProfile> {
  if (!stravaPowerVerified || !stravaFTPEstimate) return {};
  const weight = parseFloat(weightStr ?? "") || 0;
  if (!weight) return {};

  const ftp            = stravaFTPEstimate;
  const fiveMinPower   = Math.round(ftp / 0.82);  // FTP ≈ 82% of 5-min MMP
  const twentyMinPower = Math.round(ftp / 0.95);  // FTP ≈ 95% of 20-min power
  const ftpPerKg       = (ftp / weight).toFixed(2);
  const compoundScore  = calculateCompoundScore(fiveMinPower, weight);

  return {
    ftp:            String(ftp),
    fiveMinPower:   String(fiveMinPower),
    twentyMinPower: String(twentyMinPower),
    ftpPerKg,
    compoundScore,
    ...(stravaBestMaxPower ? { maxPower: String(stravaBestMaxPower) } : {}),
  };
}

// ── Pencil icon ──────────────────────────────────────────────────────────────
function PencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

// ── Edit button ──────────────────────────────────────────────────────────────
function EditBtn({ onClick, label = "Edit" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-coral border border-coral/40 hover:bg-coral hover:text-white px-3 py-1.5 rounded-full transition-all duration-150"
    >
      <PencilIcon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Stat tile ────────────────────────────────────────────────────────────────
function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? "bg-coral/10 border border-coral/20" : "bg-stone/10"}`}>
      <div className="text-[10px] uppercase tracking-wider text-earth mb-1">{label}</div>
      <div className={`font-bold text-xl ${highlight ? "text-coral" : "text-navy-deep"}`}>
        {value || "—"}
      </div>
      {sub && <div className="text-earth text-[10px] mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone/20 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone/10">
        <h2 className="font-display text-base text-navy-deep flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {onEdit && <EditBtn onClick={onEdit} label={editLabel} />}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  user,
  section,
  onClose,
  onSave,
}: {
  user: AthleteProfile;
  section: string;
  onClose: () => void;
  onSave: (data: Partial<AthleteProfile>) => void;
}) {
  const [form, setForm] = useState<Partial<AthleteProfile>>({ ...user });
  const set = (k: keyof AthleteProfile, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));
  const setNum = (k: keyof AthleteProfile, v: string) =>
    setForm((p) => ({ ...p, [k]: v === "" ? undefined : Number(v) }));

  const fiveMin = parseFloat(form.fiveMinPower as string) || 0;
  const wt = parseFloat(form.weight as string) || 1;
  const liveScore = Math.round((fiveMin * fiveMin) / wt);
  const liveFtpPerKg =
    form.ftp && form.weight
      ? (parseFloat(form.ftp as string) / parseFloat(form.weight as string)).toFixed(2)
      : user.ftpPerKg;

  const inp =
    "w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone/20 shrink-0">
          <h2 className="font-display text-lg text-navy-deep">Edit {section}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone/20 flex items-center justify-center text-earth hover:text-navy-deep transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {section === "Personal Info" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">First Name</label>
                  <input className={inp} value={form.firstName || ""} onChange={(e) => set("firstName", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Last Name</label>
                  <input className={inp} value={form.lastName || ""} onChange={(e) => set("lastName", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Location</label>
                <input className={inp} value={form.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Nationality</label>
                <input className={inp} value={form.nationality || ""} onChange={(e) => set("nationality", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-2">Sex</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["male", "female", "prefer not to say"] as const).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border cursor-pointer transition-colors text-xs capitalize ${
                        (form.sex || "") === option
                          ? "border-coral bg-coral/5 text-coral font-semibold"
                          : "border-stone/40 text-earth hover:border-coral/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="edit-sex"
                        value={option}
                        checked={(form.sex || "") === option}
                        onChange={() => set("sex", option)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {section === "Cycling Profile" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Discipline</label>
                <select className={inp} value={form.discipline || ""} onChange={(e) => set("discipline", e.target.value)}>
                  <option value="">Select discipline</option>
                  <option>Road - Climber</option>
                  <option>Road - Sprinter</option>
                  <option>Road - All-rounder</option>
                  <option>Road - Time Trial</option>
                  <option>Road - Classics/Puncheur</option>
                  <option>Track</option>
                  <option>Cyclocross</option>
                  <option>Mountain Bike</option>
                  <option>Gravel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Category</label>
                <select className={inp} value={form.category || ""} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select category</option>
                  <option>Junior</option>
                  <option>U23</option>
                  <option>Elite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Current Team / Club</label>
                <input className={inp} value={form.team || ""} onChange={(e) => set("team", e.target.value)} placeholder="Team or club name" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Bio</label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={4}
                  value={form.bio || ""}
                  onChange={(e) => set("bio", e.target.value)}
                  maxLength={500}
                  placeholder="Tell scouts what makes you stand out…"
                />
                <p className="text-earth/40 text-xs mt-1 text-right">{(form.bio || "").length}/500</p>
              </div>
            </>
          )}

          {section === "Performance Data" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Weight (kg)</label>
                  <input type="number" className={inp} value={form.weight || ""} onChange={(e) => set("weight", e.target.value)} min={30} max={150} step={0.1} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">FTP (W)</label>
                  <input type="number" className={inp} value={form.ftp || ""} onChange={(e) => set("ftp", e.target.value)} min={50} max={600} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">5-min Power (W)</label>
                  <input type="number" className={inp} value={form.fiveMinPower || ""} onChange={(e) => set("fiveMinPower", e.target.value)} min={50} max={700} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">20-min Power (W)</label>
                  <input type="number" className={inp} value={form.twentyMinPower || ""} onChange={(e) => set("twentyMinPower", e.target.value)} min={50} max={600} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Sprint Max (W)</label>
                  <input type="number" className={inp} value={form.maxPower || ""} onChange={(e) => set("maxPower", e.target.value)} min={100} max={2500} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">VO₂max (ml/kg/min)</label>
                  <input type="number" className={inp} value={form.vo2max || ""} onChange={(e) => set("vo2max", e.target.value)} min={20} max={100} step={0.1} />
                </div>
              </div>
              {fiveMin > 0 && (
                <div className="p-4 rounded-xl bg-coral/5 border border-coral/20 text-center">
                  <div className="text-2xl font-bold text-coral">{liveScore.toLocaleString()}</div>
                  <div className="text-[10px] uppercase tracking-wider text-earth mt-0.5">Live Compound Score (W²/kg)</div>
                </div>
              )}
            </>
          )}

          {section === "Connections" && (
            <>
              <div className="bg-stone/5 border border-stone/20 rounded-xl p-3 text-[11px] text-earth/60 leading-relaxed">
                Use the <strong>Connect with Strava</strong> button on your dashboard for live data sync. The URL below is a manual fallback only.
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Strava Profile URL (manual)</label>
                <input type="text" className={inp} value={form.stravaUrl || ""} onChange={(e) => set("stravaUrl", e.target.value)} placeholder="https://www.strava.com/athletes/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">Instagram URL</label>
                <input type="text" className={inp} value={form.instagramUrl || ""} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://www.instagram.com/your-handle" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth mb-1.5">ProCyclingStats URL</label>
                <input type="text" className={inp} value={(form as { procyclingstatsUrl?: string }).procyclingstatsUrl || ""} onChange={(e) => set("procyclingstatsUrl" as keyof typeof form, e.target.value as never)} placeholder="https://www.procyclingstats.com/rider/your-name" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone/20 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 border border-stone/40 text-earth font-semibold py-2.5 rounded-full text-sm hover:border-navy-deep/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                ...form,
                compoundScore: liveScore || user.compoundScore,
                ftpPerKg: liveFtpPerKg || user.ftpPerKg,
              });
              onClose();
            }}
            className="flex-1 bg-coral hover:bg-coral/90 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pro upgrade gate ──────────────────────────────────────────────────────────
function ProUpgradeGate({ onUpgrade, loading, message }: { onUpgrade: () => void; loading: boolean; message: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="p-4 select-none pointer-events-none" style={{ filter: "blur(4px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-navy-deep/15 flex items-center justify-center shrink-0">
            <span className="text-navy-deep/40 text-xs font-bold">SC</span>
          </div>
          <div>
            <p className="text-warm-black text-xs font-semibold">Scout Name</p>
            <p className="text-earth/60 text-[10px]">Team Manager · Organisation</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-[1px]">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-coral" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-xs font-bold text-coral">Pro feature</span>
        </div>
        <p className="text-earth/70 text-[10px] text-center px-4">{message}</p>
        <button onClick={onUpgrade} disabled={loading}
          className="text-[10px] font-semibold text-white bg-coral hover:bg-coral/90 px-4 py-1.5 rounded-full transition-colors disabled:opacity-50">
          {loading ? "Loading…" : "Upgrade to Pro — €3.99/mo"}
        </button>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, updateProfile, deleteAccount, isLoading } = useAuth();
  const router = useRouter();
  const [editSection, setEditSection] = useState<string | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentSuccess] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("payment") === "success";
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [stravaMsg, setStravaMsg]       = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [stravaSyncing, setStravaSyncing] = useState(false);
  const [pendingStravaData, setPendingStravaData] = useState<Partial<AthleteProfile> | null>(null);
  const [uploadingLabResults, setUploadingLabResults] = useState(false);
  const [labResultsError, setLabResultsError] = useState<string | null>(null);
  const [analyzingLab, setAnalyzingLab] = useState(false);
  const [addingResult, setAddingResult]     = useState(false);
  const [newRace, setNewRace]               = useState("");
  const [newYear, setNewYear]               = useState(String(new Date().getFullYear()));
  const [newPos, setNewPos]                 = useState("");
  const [newCat, setNewCat]                 = useState("");
  const [editingPcsUrl, setEditingPcsUrl]   = useState(false);
  const [pcsUrlDraft, setPcsUrlDraft]       = useState("");

  function handleAddResult() {
    if (!newRace.trim() || !newPos) return;
    const pos = parseInt(newPos, 10);
    if (isNaN(pos) || pos < 1) return;
    const existing = isAthlete(user) ? (user.pcsResults ?? []) : [];
    updateProfile({ pcsResults: [...existing, { race: newRace.trim(), year: newYear, position: pos, category: newCat.trim(), raceUrl: "" }] });
    setNewRace(""); setNewYear(String(new Date().getFullYear())); setNewPos(""); setNewCat("");
    setAddingResult(false);
  }

  function handleDeleteResult(idx: number) {
    if (!isAthlete(user)) return;
    updateProfile({ pcsResults: (user.pcsResults ?? []).filter((_, i) => i !== idx) });
  }
  const [scoutViewCount, setScoutViewCount] = useState<number | null>(null);
  const [scoutViewList, setScoutViewList] = useState<Array<{
    scout_first_name: string; scout_last_name: string;
    scout_organization: string; scout_role: string; last_viewed_at: string;
  }>>([]);

  type ShortlistInvite = {
    id?: string;
    scout_id: string;
    scout_name: string;
    scout_organization: string;
    role_type: string;
    message: string;
    status: "pending" | "accepted" | "declined";
    created_at: string;
  };
  const [invitations, setInvitations] = useState<ShortlistInvite[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  type FavNotification = {
    id: string;
    scout_name: string;
    scout_org: string;
    scout_id: string;
    created_at: string;
    read: boolean;
  };
  const [favNotifications, setFavNotifications] = useState<FavNotification[]>([]);

  type FavouriteAthlete = {
    athlete_id: string;
    created_at: string;
    firstName?: string;
    lastName?: string;
    discipline?: string;
    category?: string;
    flag?: string;
    profileImage?: string;
  };
  const [scoutFavourites, setScoutFavourites] = useState<FavouriteAthlete[]>([]);

  type MessageReply = {
    text: string;
    from_athlete_id: string;
    athlete_name: string;
    created_at: string;
  };
  type InboxMessage = {
    id: string;
    from_scout_id: string;
    scout_name: string;
    scout_organization: string;
    message: string;
    created_at: string;
    read: boolean;
    replies: MessageReply[];
  };
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  type SentMessage = {
    id: string;
    to_athlete_id: string;
    scout_name: string;
    message: string;
    created_at: string;
    replies: MessageReply[];
  };
  const [scoutSentMessages, setScoutSentMessages] = useState<SentMessage[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  // Fetch scout view stats for athletes
  useEffect(() => {
    if (!user || isScout(user) || !supabase) return;
    supabase
      .from("profile_views")
      .select("scout_first_name, scout_last_name, scout_organization, scout_role, last_viewed_at")
      .eq("athlete_id", user.id)
      .order("last_viewed_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setScoutViewCount(data.length);
          setScoutViewList(data);
        }
      });
  }, [user]);

  // Fetch favourite notifications for athletes
  useEffect(() => {
    if (!user || isScout(user) || !supabase) return;
    supabase
      .from("notifications")
      .select("id, scout_name, scout_org, scout_id, created_at, read")
      .eq("athlete_id", user.id)
      .eq("type", "favourite")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setFavNotifications(data as FavNotification[]);
      });
  }, [user]);

  // Fetch scout's favourited athletes
  useEffect(() => {
    if (!user || !isScout(user) || !supabase) return;
    supabase
      .from("favourites")
      .select("athlete_id, created_at")
      .eq("scout_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data: favs }) => {
        if (!favs || favs.length === 0) return;
        const ids = favs.map((f) => f.athlete_id);
        const { data: profiles } = await supabase!
          .from("athletes")
          .select("id, profile")
          .in("id", ids);
        const merged = favs.map((f) => {
          const match = profiles?.find((p) => p.id === f.athlete_id);
          const prof = match?.profile ?? {};
          return {
            athlete_id: f.athlete_id,
            created_at: f.created_at,
            firstName: prof.firstName,
            lastName: prof.lastName,
            discipline: prof.discipline,
            category: prof.category,
            flag: prof.flag,
            profileImage: prof.profileImage,
          };
        });
        setScoutFavourites(merged);
      });
  }, [user]);

  // Fetch direct messages for athletes/parents
  useEffect(() => {
    if (!user || isScout(user) || !supabase) return;
    supabase
      .from("messages")
      .select("id, from_scout_id, scout_name, scout_organization, message, created_at, read, replies")
      .eq("to_athlete_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setInboxMessages(data.map((m) => ({ ...m, replies: m.replies ?? [] })) as InboxMessage[]);
      });
  }, [user]);

  // Fetch messages sent by scout (to see replies)
  useEffect(() => {
    if (!user || !isScout(user) || !supabase) return;
    supabase
      .from("messages")
      .select("id, to_athlete_id, scout_name, message, created_at, replies")
      .eq("from_scout_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setScoutSentMessages(data.map((m) => ({ ...m, replies: m.replies ?? [] })) as SentMessage[]);
      });
  }, [user]);

  // Fetch shortlist invitations for athletes
  useEffect(() => {
    if (!user || isScout(user) || !supabase) return;
    supabase
      .from("shortlists")
      .select("scout_id, scout_name, scout_organization, role_type, message, status, created_at")
      .eq("athlete_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setInvitations(data as ShortlistInvite[]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleInviteResponse(scoutId: string, status: "accepted" | "declined") {
    if (!user || !supabase) return;
    setInviteLoading(true);
    await supabase
      .from("shortlists")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("athlete_id", user.id)
      .eq("scout_id", scoutId);
    setInvitations((prev) =>
      prev.map((inv) => inv.scout_id === scoutId ? { ...inv, status } : inv)
    );
    setInviteLoading(false);
  }

  // ── Strava OAuth return ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url   = new URL(window.location.href);
    const param = url.searchParams.get("strava");
    if (!param) return;

    // Grab sd param before cleaning URL
    const sdParam = url.searchParams.get("sd");
    const reason  = url.searchParams.get("reason") ?? "";

    // Clean URL immediately so refresh doesn't re-trigger
    url.searchParams.delete("strava");
    url.searchParams.delete("sd");
    url.searchParams.delete("reason");
    window.history.replaceState({}, "", url.toString());

    if (param === "connected") {
      setStravaMsg({ type: "success", text: "Strava connected! Training stats and power numbers updated." });
      setTimeout(() => setStravaMsg(null), 7000);
      if (sdParam) {
        try {
          const stravaData: Partial<AthleteProfile> = JSON.parse(decodeURIComponent(sdParam));
          setPendingStravaData(stravaData);
        } catch (e) {
          console.error("[dashboard] failed to parse Strava data from URL:", e);
        }
      }
    } else if (param === "denied") {
      setStravaMsg({ type: "info", text: "Strava connection was cancelled." });
      setTimeout(() => setStravaMsg(null), 4000);
    } else if (param === "error") {
      setStravaMsg({ type: "error", text: "Strava connection failed. Please try again." });
      console.warn("[dashboard] Strava error reason:", reason);
    }
  }, []);

  // ── Apply pending Strava data once user is loaded ──────────────────────────
  useEffect(() => {
    if (pendingStravaData && user && isAthlete(user)) {
      const powerFields = stravaToPowerFields(
        pendingStravaData.stravaFTPEstimate,
        pendingStravaData.stravaBestMaxPower,
        pendingStravaData.stravaPowerVerified,
        user.weight,
      );
      updateProfile({ ...pendingStravaData, ...powerFields });
      setPendingStravaData(null);
    }
  }, [user, pendingStravaData, updateProfile]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-earth text-sm flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-coral" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading your profile…
        </div>
      </div>
    );
  }

  // Defined early so both scout and athlete views can reference it
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    await deleteAccount();
    router.push("/");
  };

  // ── Pro / Stripe helpers ───────────────────────────────────────────────────
  const isPro = !!(user as AthleteProfile | ScoutProfile | ParentProfile).pro;
  const subStatus = (user as AthleteProfile | ScoutProfile | ParentProfile).subscriptionStatus ?? "free";
  const stripeCustomerId = (user as AthleteProfile | ScoutProfile | ParentProfile).stripeCustomerId;

  async function handleUpgrade() {
    if (!user) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userType: user.type ?? "athlete", email: (user as AthleteProfile).email }),
      });
      const { url, error } = await res.json();
      if (error || !url) { alert("Could not start checkout — please try again."); return; }
      window.location.href = url;
    } catch { alert("Could not start checkout — please try again."); }
    finally { setCheckingOut(false); }
  }

  async function handleManageSubscription() {
    if (!stripeCustomerId) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/.netlify/functions/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeCustomerId }),
      });
      const { url, error } = await res.json();
      if (error || !url) { alert("Could not open billing portal — please try again."); return; }
      window.location.href = url;
    } catch { alert("Could not open billing portal — please try again."); }
    finally { setCheckingOut(false); }
  }

  // ── Scout view ──────────────────────────────────────────────────────────────
  if (isScout(user)) {
    // Scouts must be Pro (or trialing) to access the platform
    if (!isPro) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-navy-deep mb-2">Scout Pro</h1>
            <p className="text-earth text-sm leading-relaxed mb-6">
              Start your <strong>7-day free trial</strong> to access athlete profiles, power data, lab results, and messaging. Cancel any time.
            </p>
            <div className="bg-cream-warm rounded-2xl p-4 mb-6 text-left space-y-2">
              {["Full access to all athlete profiles", "Power data & lab results", "Contact & message athletes", "Favourites & shortlists", "Palmarès & race history"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                  <svg className="w-4 h-4 text-coral shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={handleUpgrade} disabled={checkingOut}
              className="w-full bg-coral hover:bg-coral/90 text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50 text-sm">
              {checkingOut ? "Loading…" : "Start 7-day free trial — €9.99/mo"}
            </button>
            <p className="text-earth/40 text-xs mt-3">No charge until your trial ends · Cancel any time</p>
            <button onClick={() => { logout(); router.push("/login"); }}
              className="mt-4 text-xs text-earth/40 hover:text-earth underline">
              Sign out
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="font-display text-lg text-navy-deep text-center mb-2">Delete your account?</h2>
            <p className="text-earth text-sm text-center mb-6 leading-relaxed">
              This permanently removes your scout profile and all account information. <strong>This cannot be undone.</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}
                className="flex-1 border border-stone/40 text-earth font-semibold py-2.5 rounded-full text-sm hover:border-navy-deep/30 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading}
                className="flex-1 bg-coral hover:bg-coral/90 text-white font-semibold py-2.5 rounded-full text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteLoading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Deleting…</>
                ) : "Yes, delete it"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-stone/10">
        <div className="relative bg-navy-deep overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-[center_25%]" style={{ backgroundImage: "url('/hero-discover.jpg')" }} />
          <div className="absolute inset-0 bg-navy-deep/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Home
              </Link>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="text-white/40 hover:text-coral text-sm transition-colors font-medium"
              >
                Log Out
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-navy-deep flex items-center justify-center shadow-lg">
                <span className="text-white font-display text-2xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Scout Account</span>
                  {user.verified ? (
                    <span className="bg-olive/80 text-white text-xs px-2 py-0.5 rounded-full">Verified</span>
                  ) : (
                    <span className="bg-amber-500/80 text-white text-xs px-2 py-0.5 rounded-full">Pending Verification</span>
                  )}
                </div>
                <h1 className="font-display text-2xl text-white">{user.firstName} {user.lastName}</h1>
                <p className="text-white/50 text-sm">{user.role} · {user.organization}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!user.verified ? (
            /* ── Pending scout ── */
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-amber-900 text-lg mb-1">Verification In Progress</h2>
                    <p className="text-amber-700/80 text-sm leading-relaxed">
                      Your scout account is pending review by the AthleticLinq team. We verify all scouts to protect athlete data. You&apos;ll typically hear back within <strong>24–48 hours</strong>.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  {[
                    { done: true, text: "Account created" },
                    { done: true, text: "Organization details submitted" },
                    { done: false, text: "Identity & organization verification in progress", pending: true },
                    { done: false, text: "Full platform access granted" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {step.done ? (
                        <span className="w-5 h-5 rounded-full bg-olive flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : step.pending ? (
                        <span className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-stone/40 shrink-0" />
                      )}
                      <span className={step.done ? "text-olive font-medium" : step.pending ? "text-amber-700" : "text-earth/50"}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone/20 p-5">
                <h3 className="font-display text-base text-navy-deep mb-3">Your Application</h3>
                <dl className="space-y-2.5 text-sm">
                  {[
                    ["Name", `${user.firstName} ${user.lastName}`],
                    ["Email", user.email],
                    ["Role", user.role],
                    ["Organization", user.organization],
                    ["Org Type", user.orgType],
                    ["Country", user.country],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <dt className="text-earth text-xs">{label}</dt>
                      <dd className="text-warm-black font-medium text-xs text-right">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-navy-deep rounded-2xl p-5 text-center">
                <p className="text-white/50 text-sm mb-3">
                  While you wait, you can browse a preview of our athlete directory.
                </p>
                <Link
                  href="/discover"
                  className="inline-block bg-coral hover:bg-coral/90 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
                >
                  Preview Athlete Directory →
                </Link>
              </div>
            </div>
          ) : (
            /* ── Verified scout ── */
            <div className="space-y-5">
              <div className="bg-olive/10 border border-olive/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-olive/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-olive">Account Verified</div>
                  <div className="text-earth text-sm">You have full access to the athlete directory.</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone/20 p-5">
                <h3 className="font-display text-base text-navy-deep mb-3">Scout Details</h3>
                <dl className="space-y-2.5 text-sm">
                  {[
                    ["Name", `${user.firstName} ${user.lastName}`],
                    ["Email", user.email],
                    ["Role", user.role],
                    ["Organization", user.organization],
                    ["Country", user.country],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <dt className="text-earth text-xs">{label}</dt>
                      <dd className="text-warm-black font-medium text-xs text-right">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* My Favourites */}
              <div className="bg-white rounded-2xl border border-stone/20 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone/10">
                  <h3 className="font-display text-base text-navy-deep flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    My Favourites
                    {scoutFavourites.length > 0 && (
                      <span className="text-xs font-normal text-earth bg-stone/30 px-2 py-0.5 rounded-full">
                        {scoutFavourites.length}
                      </span>
                    )}
                  </h3>
                  <Link href="/discover" className="text-xs text-coral hover:underline font-medium">
                    Browse more →
                  </Link>
                </div>
                {scoutFavourites.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="w-8 h-8 text-stone/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-earth text-sm">No favourites yet.</p>
                    <p className="text-earth/60 text-xs mt-1">Star athletes from the discover page to save them here.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-stone/10">
                    {scoutFavourites.map((fav) => (
                      <li key={fav.athlete_id}>
                        <a
                          href={`/athletes/${fav.athlete_id}`}
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone/5 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-navy-deep flex items-center justify-center shrink-0 overflow-hidden">
                            {fav.profileImage ? (
                              <img src={fav.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white text-sm font-display">
                                {(fav.firstName?.[0] ?? "?")}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-navy-deep truncate">
                              {fav.flag} {fav.firstName} {fav.lastName}
                            </div>
                            <div className="text-xs text-earth truncate">
                              {fav.discipline}{fav.category ? ` · ${fav.category}` : ""}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-earth/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                href="/discover"
                className="block text-center bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Browse Athletes →
              </Link>

              {/* Scout sent messages + replies */}
              {scoutSentMessages.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone/20 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-stone/10">
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h3 className="font-display text-base text-navy-deep">Messages</h3>
                    {scoutSentMessages.some((m) => m.replies.length > 0) && (
                      <span className="text-xs font-normal text-white bg-coral px-2 py-0.5 rounded-full ml-auto">
                        {scoutSentMessages.reduce((n, m) => n + m.replies.length, 0)} repl{scoutSentMessages.reduce((n, m) => n + m.replies.length, 0) === 1 ? "y" : "ies"}
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-stone/10">
                    {scoutSentMessages.map((msg) => (
                      <div key={msg.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-navy-deep">To: {msg.to_athlete_id}</p>
                          <span className="text-[10px] text-earth/40">
                            {new Date(msg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-xs text-earth/70 leading-relaxed mb-2">{msg.message}</p>
                        {msg.replies.length > 0 ? (
                          <div className="space-y-1.5 border-l-2 border-coral/30 pl-2.5">
                            {msg.replies.map((r, i) => (
                              <div key={i}>
                                <p className="text-[10px] font-semibold text-coral">{r.athlete_name} <span className="font-normal text-earth/40">{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></p>
                                <p className="text-xs text-earth/80">{r.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-earth/40 italic">No reply yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Danger zone */}
          <div className="pt-4 text-center">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-earth/50 hover:text-coral transition-colors underline underline-offset-2"
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ── Parent dashboard ────────────────────────────────────────────────────────
  if (isParent(user)) {
    return (
      <div className="min-h-screen bg-stone/10">
        <div className="relative bg-navy-deep overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-[center_25%]" style={{ backgroundImage: "url('/hero-discover.jpg')" }} />
          <div className="absolute inset-0 bg-navy-deep/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Home
              </Link>
              <button onClick={() => { logout(); router.push("/"); }} className="text-white/40 hover:text-coral text-sm transition-colors font-medium">Log Out</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-navy-deep flex items-center justify-center shadow-lg border border-white/10">
                <span className="text-white font-display text-2xl">{user.firstName[0]}{user.lastName[0]}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Guardian Account</span>
                <h1 className="font-display text-2xl text-white">{user.firstName} {user.lastName}</h1>
                <p className="text-white/50 text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
          {/* Linked athlete */}
          <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-6">
            <h2 className="font-display text-base text-navy-deep mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Linked Athlete
            </h2>
            {user.linkedAthleteId ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-warm-black text-sm font-semibold">Account linked</p>
                  <p className="text-earth/60 text-xs mt-0.5">{user.linkedAthleteEmail}</p>
                </div>
                <Link
                  href={`/athletes/${user.linkedAthleteId}`}
                  className="bg-coral/10 text-coral text-xs font-semibold px-4 py-2 rounded-full hover:bg-coral/20 transition-colors"
                >
                  View Profile →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-earth/60 text-sm mb-3">No athlete linked yet. Enter your child&apos;s AthleticLinq email to connect accounts.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="child@example.com"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone/40 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                  />
                  <button className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-navy/90 transition-colors">Link</button>
                </div>
              </div>
            )}
          </div>

          {/* Invitations */}
          <div className="bg-white rounded-2xl border border-stone/20 shadow-sm p-6">
            <h2 className="font-display text-base text-navy-deep mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Scout Invitations
            </h2>
            {invitations.length === 0 ? (
              <p className="text-earth/50 text-sm">No scout invitations yet. When scouts shortlist your child, invitations will appear here for your review.</p>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div key={inv.scout_id} className={`rounded-xl border p-4 ${inv.status === "pending" ? "border-coral/25 bg-coral/5" : "border-stone/20"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-navy-deep text-sm">{inv.scout_name}</p>
                        <p className="text-earth/60 text-xs">{inv.scout_organization}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${inv.status === "pending" ? "text-coral bg-coral/10" : inv.status === "accepted" ? "text-olive bg-olive/10" : "text-earth/60 bg-stone/20"}`}>
                        {inv.status === "pending" ? "Awaiting Review" : inv.status === "accepted" ? "Approved" : "Declined"}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-earth/50 mb-1">{inv.role_type}</p>
                    <p className="text-earth/80 text-xs leading-relaxed mb-3">{inv.message}</p>
                    {inv.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleInviteResponse(inv.scout_id, "accepted")} disabled={inviteLoading}
                          className="flex-1 bg-olive hover:bg-olive/90 text-white text-xs font-semibold py-1.5 rounded-full transition-colors disabled:opacity-50">
                          Approve
                        </button>
                        <button onClick={() => handleInviteResponse(inv.scout_id, "declined")} disabled={inviteLoading}
                          className="flex-1 border border-stone/40 text-earth text-xs font-medium py-1.5 rounded-full hover:border-stone/70 transition-colors disabled:opacity-50">
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs text-earth/50 hover:text-coral transition-colors underline underline-offset-2">
              Delete my account
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h2 className="font-display text-lg text-navy-deep text-center mb-4">Delete guardian account?</h2>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-stone/40 text-earth font-semibold py-2.5 rounded-full text-sm">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading}
                  className="flex-1 bg-coral hover:bg-coral/90 text-white font-semibold py-2.5 rounded-full text-sm disabled:opacity-60">
                  {deleteLoading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Athlete check ───────────────────────────────────────────────────────────
  if (!isAthlete(user)) return null;

  const handleSave = (data: Partial<AthleteProfile>) => {
    updateProfile(data);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2500);
  };

  // ── Strava OAuth URL ──────────────────────────────────────────────────────
  const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const stravaAuthUrl = STRAVA_CLIENT_ID
    ? `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent("https://athleticlinq.com/.netlify/functions/strava-callback")}&response_type=code&scope=read,activity:read_all&state=${user.id}`
    : null;

  // ── Strava data sync ──────────────────────────────────────────────────────
  async function handleStravaSync() {
    if (!isAthlete(user)) return;
    setStravaSyncing(true);
    try {
      // POST tokens from localStorage as fallback — works even if Supabase
      // doesn't have the row yet (e.g. athlete registered before Supabase setup)
      const res  = await fetch("/.netlify/functions/strava-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId:        user.id,
          accessToken:      user.stravaAccessToken,
          refreshToken:     user.stravaRefreshToken,
          tokenExpiresAt:   user.stravaTokenExpiresAt,
          stravaAthleteId:  user.stravaAthleteId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Derive updated power numbers from Strava FTP estimate
        const powerFields = stravaToPowerFields(
          data.stravaFTPEstimate,
          data.stravaBestMaxPower,
          data.stravaPowerVerified,
          user.weight,
        );
        const hasPowerUpdate = Object.keys(powerFields).length > 0;

        updateProfile({
          stravaWeeklyHours:      data.stravaWeeklyHours,
          stravaWeeklyTSS:        data.stravaWeeklyTSS,
          stravaRecentDistance:   data.stravaRecentDistance,
          stravaPowerVerified:    data.stravaPowerVerified,
          stravaFTPEstimate:      data.stravaFTPEstimate,
          stravaBestMaxPower:     data.stravaBestMaxPower,
          stravaWeeklyElevation:  data.stravaWeeklyElevation,
          stravaYTDDistance:      data.stravaYTDDistance,
          stravaYTDElevation:     data.stravaYTDElevation,
          stravaYTDHours:         data.stravaYTDHours,
          stravaTotalSufferScore: data.stravaTotalSufferScore,
          stravaLastSynced:       data.stravaLastSynced,
          // Persist any rotated tokens
          ...(data.stravaAccessToken    && { stravaAccessToken:    data.stravaAccessToken }),
          ...(data.stravaRefreshToken   && { stravaRefreshToken:   data.stravaRefreshToken }),
          ...(data.stravaTokenExpiresAt && { stravaTokenExpiresAt: data.stravaTokenExpiresAt }),
          // Power numbers derived from Strava (only if power meter verified)
          ...powerFields,
        });

        setStravaMsg({
          type: "success",
          text: hasPowerUpdate
            ? "Strava synced! Power numbers and compound score updated."
            : "Strava synced! Training stats updated.",
        });
        setTimeout(() => setStravaMsg(null), 5000);
      } else {
        setStravaMsg({ type: "error", text: data.error ?? "Sync failed — please try again." });
        setTimeout(() => setStravaMsg(null), 5000);
      }
    } catch {
      setStravaMsg({ type: "error", text: "Sync failed — please check your connection." });
      setTimeout(() => setStravaMsg(null), 5000);
    } finally {
      setStravaSyncing(false);
    }
  }

  // ── Video upload ──────────────────────────────────────────────────────────
  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // iOS sometimes returns an empty file.type — detect from extension as fallback
    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const mimeFromExt: Record<string, string> = {
      mp4: "video/mp4",
      mov: "video/quicktime",
      m4v: "video/mp4",
      webm: "video/webm",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
    };
    const resolvedType = file.type || mimeFromExt[ext] || "video/mp4";

    // Accept if MIME type is video or if we recognise the extension
    const isVideo = resolvedType.startsWith("video/") || ext in mimeFromExt;
    if (!isVideo) {
      setVideoUploadError("Please select a video file (MP4, MOV, or WebM).");
      return;
    }

    const MAX_BYTES = 200 * 1024 * 1024; // 200 MB
    if (file.size > MAX_BYTES) {
      setVideoUploadError(
        `File is ${(file.size / 1024 / 1024).toFixed(0)} MB — please keep it under 200 MB. Try trimming the clip or exporting at a lower resolution.`
      );
      return;
    }

    setUploadingVideo(true);
    setVideoUploadError(null);

    try {
      if (!supabase) throw new Error("no-supabase");

      const path = `${user?.id ?? "unknown"}/profile-video.${ext}`;

      // Delete any existing file first so the new content-type is always applied
      // (upsert alone does not reliably update stored MIME metadata)
      await supabase.storage.from("athlete-videos").remove([path]);

      const { error: uploadErr } = await supabase.storage
        .from("athlete-videos")
        .upload(path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: resolvedType, // always a valid MIME type — never an empty string
        });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("athlete-videos")
        .getPublicUrl(path);

      updateProfile({ videoUrl: publicUrl });
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { statusCode?: string })?.statusCode;
      console.error("[VideoUpload] error:", msg, "status:", status);

      if (msg === "no-supabase") {
        setVideoUploadError("Storage not available. Paste a YouTube or Vimeo link below instead.");
      } else if (
        status === "404" ||
        msg.toLowerCase().includes("bucket not found") ||
        msg.toLowerCase().includes("not found")
      ) {
        setVideoUploadError("The video storage bucket hasn't been created yet. Run the SQL setup in your Supabase dashboard (see instructions in your chat), or paste a YouTube / Vimeo link below in the meantime.");
      } else if (
        status === "403" ||
        msg.toLowerCase().includes("security policy") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("permission")
      ) {
        setVideoUploadError("Upload blocked by storage permissions. Run the SQL setup in your Supabase dashboard to fix this, or paste a YouTube / Vimeo link below in the meantime.");
      } else {
        setVideoUploadError(`Upload failed: ${msg}. Try a shorter clip or paste a YouTube / Vimeo link below instead.`);
      }
    } finally {
      setUploadingVideo(false);
    }
  }

  function handleVideoUrlSave() {
    const url = videoUrlInput.trim();
    if (!url) return;
    updateProfile({ videoUrl: url });
    setVideoUrlInput("");
    setShowVideoUrlInput(false);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2500);
  }

  function handleVideoRemove() {
    updateProfile({ videoUrl: "", videoThumbnail: "" });
    setShowVideoUrlInput(false);
    setVideoUrlInput("");
  }

  // ── Lab results upload ────────────────────────────────────────────────────
  async function handleLabResultsUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowedExts = ["pdf", "jpg", "jpeg", "png", "tif", "tiff"];
    // On mobile, cloud-storage files (OneDrive, iCloud) often arrive as
    // application/octet-stream — trust the file extension instead
    const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "application/octet-stream", ""];
    if (!ALLOWED_MIME.includes(file.type) && !allowedExts.includes(ext)) {
      setLabResultsError("Please upload a PDF, JPG, or PNG file.");
      return;
    }
    if (!allowedExts.includes(ext)) {
      setLabResultsError("Please upload a PDF, JPG, or PNG file.");
      return;
    }

    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setLabResultsError(`File is ${(file.size / 1024 / 1024).toFixed(0)} MB — please keep it under 10 MB.`);
      return;
    }

    setUploadingLabResults(true);
    setLabResultsError(null);

    try {
      if (!supabase) throw new Error("no-supabase");

      const path = `${user?.id ?? "unknown"}/lab-results.${ext || "pdf"}`;
      await supabase.storage.from("lab-results").remove([path]);

      const MIME_BY_EXT: Record<string, string> = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", tif: "image/tiff", tiff: "image/tiff" };
      const contentType = (file.type && file.type !== "application/octet-stream") ? file.type : (MIME_BY_EXT[ext] ?? "application/pdf");

      const { error: uploadErr } = await supabase.storage
        .from("lab-results")
        .upload(path, file, { upsert: false, cacheControl: "3600", contentType });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("lab-results").getPublicUrl(path);

      updateProfile({ labResultsUrl: publicUrl, labResultsFileName: file.name });
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2500);

      // ── AI extraction (non-blocking — failure is silent) ──────────────────
      setAnalyzingLab(true);
      try {
        const aiRes = await fetch("/.netlify/functions/analyze-lab-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: publicUrl, contentType }),
        });
        if (aiRes.ok) {
          const extracted = await aiRes.json();
          if (extracted && !extracted.error) {
            updateProfile({ labExtractedData: extracted });
          }
        }
      } catch {
        // Non-fatal — extraction is a bonus, not critical
      } finally {
        setAnalyzingLab(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "no-supabase") {
        setLabResultsError("Storage not available. Please try again later.");
      } else if (msg.toLowerCase().includes("bucket not found") || msg.toLowerCase().includes("not found")) {
        setLabResultsError("Storage bucket not yet created. Run the SQL setup in your Supabase dashboard.");
      } else {
        setLabResultsError(`Upload failed: ${msg}`);
      }
    } finally {
      setUploadingLabResults(false);
    }
  }

  // ── Thumbnail upload ──────────────────────────────────────────────────────
  function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) return;

    setUploadingThumbnail(true);

    const reader = new FileReader();
    reader.onerror = () => setUploadingThumbnail(false);
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onerror = () => setUploadingThumbnail(false);
      img.onload = () => {
        // Scale to max 800 px wide, keep natural aspect ratio
        const MAX_W = 800;
        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { setUploadingThumbnail(false); return; }

        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);

        try {
          updateProfile({ videoThumbnail: compressed });
          setSaveFlash(true);
          setTimeout(() => setSaveFlash(false), 2500);
        } finally {
          setUploadingThumbnail(false);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setUploadingPhoto(true);

    const reader = new FileReader();

    reader.onerror = () => {
      setUploadingPhoto(false);
      alert("Could not read the file. Please try a different image.");
    };

    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;

      // ── Resize via Canvas before storing ──────────────────────────────
      // Raw photos can be 4–20 MB; base64 adds ~33% overhead and localStorage
      // is capped at 5 MB total. Resizing to ≤400 px at JPEG 80% keeps the
      // stored value well under 50 KB regardless of the source file size.
      const img = new Image();

      img.onerror = () => {
        setUploadingPhoto(false);
        alert("Could not load the image. Please try a different file.");
      };

      img.onload = () => {
        const MAX = 400;
        let w = img.width;
        let h = img.height;

        // Maintain aspect ratio
        if (w > h) {
          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        } else {
          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        }

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setUploadingPhoto(false);
          alert("Your browser does not support image resizing. Please try a different browser.");
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);

        try {
          updateProfile({ profileImage: compressed });
          setSaveFlash(true);
          setTimeout(() => setSaveFlash(false), 2500);
        } catch {
          alert("Could not save your photo — local storage is full. Clear some browser data and try again.");
        } finally {
          setUploadingPhoto(false);
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);

    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";
  }

  // stravaOAuth = true means connected via OAuth (has live data)
  const stravaOAuth = !!(isAthlete(user) && user.stravaAccessToken);

  return (
    <>
      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="font-display text-lg text-navy-deep text-center mb-2">Delete your account?</h2>
            <p className="text-earth text-sm text-center mb-6 leading-relaxed">
              This permanently removes your profile, performance data, and all account information. <strong>This cannot be undone.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 border border-stone/40 text-earth font-semibold py-2.5 rounded-full text-sm hover:border-navy-deep/30 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 bg-coral hover:bg-coral/90 text-white font-semibold py-2.5 rounded-full text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Deleting…</>
                ) : "Yes, delete it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editSection && (
        <EditModal
          user={user}
          section={editSection}
          onClose={() => setEditSection(null)}
          onSave={handleSave}
        />
      )}

      {/* Save flash */}
      {saveFlash && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-olive text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Profile saved!
        </div>
      )}

      {/* Payment success banner */}
      {paymentSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-coral text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Welcome to Pro! Your account is now unlocked.
        </div>
      )}

      {/* Strava notification banner */}
      {stravaMsg && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold pointer-events-none ${
          stravaMsg.type === "success" ? "bg-[#FC4C02] text-white" :
          stravaMsg.type === "error"   ? "bg-coral text-white" :
                                         "bg-navy-deep text-white"
        }`}>
          {stravaMsg.type === "success" && (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          )}
          {stravaMsg.text}
        </div>
      )}

      {/* File input is now nested directly inside the avatar label below — no id/ref needed */}

      <div className="min-h-screen bg-stone/10">

        {/* ── Top banner ── */}
        <div className="relative bg-navy-deep overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-[center_25%]" style={{ backgroundImage: "url('/hero-discover.jpg')" }} />
          <div className="absolute inset-0 bg-navy-deep/80" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            {/* Nav row */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/discover" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Discover
              </Link>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="text-white/40 hover:text-coral text-sm transition-colors font-medium"
              >
                Log Out
              </button>
            </div>

            {/* Profile identity row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* ── Avatar with photo upload ──
                   Wrapping everything in a single <label> with a nested <input> is the
                   most reliable cross-browser approach. No htmlFor, no ref, no
                   programmatic .click() — the browser handles it natively. ── */}
              <label className="relative group shrink-0 cursor-pointer block" title="Upload profile photo">
                {/* Hidden file input nested directly inside the label */}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />

                {/* Avatar display */}
                {user.profileImage ? (
                  <div
                    className="w-24 h-24 rounded-2xl bg-cover bg-center shadow-lg border-2 border-white/20"
                    style={{ backgroundImage: `url(${user.profileImage})` }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-coral to-navy-deep flex items-center justify-center shadow-lg border-2 border-white/20">
                    <span className="text-white font-display text-3xl select-none">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                )}

                {/* Hover overlay — pointer-events-none so clicks fall through to the label */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPhoto ? (
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-[10px] font-medium mt-1">Change photo</span>
                    </>
                  )}
                </div>

                {/* Always-visible camera badge — pointer-events-none, label handles the click */}
                <div className="pointer-events-none absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-coral border-2 border-white flex items-center justify-center shadow-md">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </label>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {user.flag && <span className="text-xl">{user.flag}</span>}
                  {user.category && (
                    <span className="bg-white/15 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {user.category}
                    </span>
                  )}
                  <span className="bg-coral/80 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Your Profile
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white/50 text-sm mt-1.5">
                  {user.discipline || "Cyclist"}
                  {user.location ? ` · ${user.location}` : ""}
                  {user.team ? ` · ${user.team}` : ""}
                </p>
              </div>

              {/* Compound score badge */}
              {user.compoundScore > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 shrink-0">
                  <CompoundScore score={user.compoundScore} size="lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left column (main) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Bio */}
              <Section
                title="About Me"
                icon={
                  <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                onEdit={() => setEditSection("Cycling Profile")}
              >
                {user.bio ? (
                  <p className="text-warm-black/70 text-sm leading-relaxed">{user.bio}</p>
                ) : (
                  <button
                    onClick={() => setEditSection("Cycling Profile")}
                    className="w-full border-2 border-dashed border-stone/40 rounded-xl py-5 text-earth/50 text-sm hover:border-coral/40 hover:text-coral transition-colors"
                  >
                    + Add a bio to tell scouts about yourself…
                  </button>
                )}
              </Section>

              {/* Power Numbers */}
              <Section
                title="Power Numbers"
                icon={
                  <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                onEdit={() => setEditSection("Performance Data")}
                editLabel="Update"
              >
                {/* Strava source badge */}
                {stravaOAuth && isAthlete(user) && user.stravaPowerVerified && user.ftp && (
                  <div className="flex items-center gap-1.5 mb-3 text-[10px] text-[#FC4C02] font-semibold">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Calculated from Strava data · Est. 5-min via FTP ratio
                  </div>
                )}

                {user.ftp ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Stat label="Compound Score" value={user.compoundScore ? user.compoundScore.toLocaleString() : "—"} sub="W²/kg" highlight />
                    <Stat label="FTP" value={user.ftp ? `${user.ftp} W` : "—"} sub={user.ftpPerKg ? `${user.ftpPerKg} W/kg` : ""} />
                    <Stat label="5-min Power" value={user.fiveMinPower ? `${user.fiveMinPower} W` : "—"} />
                    <Stat label="20-min Power" value={user.twentyMinPower ? `${user.twentyMinPower} W` : "—"} />
                    <Stat label="Sprint Max" value={user.maxPower ? `${user.maxPower} W` : "—"} />
                    <Stat label="VO₂max" value={user.vo2max ? `${user.vo2max}` : "—"} sub={user.vo2max ? "ml/kg/min" : ""} />
                  </div>
                ) : stravaOAuth && isAthlete(user) && user.stravaPowerVerified ? (
                  /* Has Strava OAuth but no power yet — prompt to sync */
                  <div className="text-center py-4">
                    <p className="text-earth text-sm mb-3">
                      You have a power meter on Strava. Sync to import your power numbers automatically.
                    </p>
                    <button
                      onClick={handleStravaSync}
                      disabled={stravaSyncing}
                      className="bg-[#FC4C02] hover:bg-[#FC4C02]/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-50"
                    >
                      {stravaSyncing ? "Syncing…" : "Sync from Strava"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditSection("Performance Data")}
                    className="w-full border-2 border-dashed border-stone/40 rounded-xl py-8 text-earth/50 text-sm hover:border-coral/40 hover:text-coral transition-colors flex flex-col items-center gap-2"
                  >
                    <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    + Add your power numbers to get scouted
                  </button>
                )}
              </Section>

              {/* Profile Video */}
              <Section
                title="Profile Video"
                icon={
                  <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              >
                {user.videoUrl ? (
                  /* ── Has a video — show preview + controls ── */
                  <div className="space-y-3">
                    <div className="aspect-video rounded-xl overflow-hidden relative bg-navy-deep">
                      <VideoPlayer url={user.videoUrl} poster={user.videoThumbnail} />
                    </div>

                    {/* Thumbnail row */}
                    <div className="flex items-center gap-3 p-3 bg-cream-warm/40 border border-stone/30 rounded-xl">
                      {/* Thumbnail preview or placeholder */}
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-stone/20 shrink-0 flex items-center justify-center border border-stone/30">
                        {user.videoThumbnail ? (
                          <img src={user.videoThumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-earth/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-warm-black">
                          {user.videoThumbnail ? "Video thumbnail set" : "No thumbnail yet"}
                        </p>
                        <p className="text-[11px] text-earth/50 mt-0.5">Shown before the video plays</p>
                      </div>
                      <label className="cursor-pointer shrink-0 text-xs font-semibold text-coral hover:text-white hover:bg-coral border border-coral/40 px-3 py-1.5 rounded-full transition-all">
                        {uploadingThumbnail ? "Saving…" : user.videoThumbnail ? "Change" : "Add thumbnail"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleThumbnailUpload}
                          disabled={uploadingThumbnail}
                        />
                      </label>
                      {user.videoThumbnail && (
                        <button
                          onClick={() => updateProfile({ videoThumbnail: "" })}
                          className="text-earth/40 hover:text-coral text-xs shrink-0"
                          title="Remove thumbnail"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Video replace / remove */}
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold border border-coral/40 text-coral hover:bg-coral hover:text-white px-3 py-2 rounded-full transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploadingVideo ? "Uploading…" : "Replace video"}
                        <input
                          type="file"
                          accept="video/*"
                          className="sr-only"
                          onChange={handleVideoUpload}
                          disabled={uploadingVideo}
                        />
                      </label>
                      <button
                        onClick={handleVideoRemove}
                        className="text-xs font-semibold text-earth/60 hover:text-coral border border-stone/30 px-3 py-2 rounded-full transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {videoUploadError && (
                      <p className="text-coral text-xs leading-relaxed">{videoUploadError}</p>
                    )}
                  </div>
                ) : (
                  /* ── No video yet — upload area ── */
                  <div className="space-y-4">
                    {/* Primary upload button */}
                    <label className={`group block cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${uploadingVideo ? "border-coral/30 bg-coral/5" : "border-stone/30 hover:border-coral/40 hover:bg-coral/5"}`}>
                      <input
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                      />
                      {uploadingVideo ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-coral animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          <p className="text-coral font-semibold text-sm">Uploading your video…</p>
                          <p className="text-earth/50 text-xs">This may take a minute for longer clips</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center group-hover:bg-coral/20 transition-colors">
                            <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-navy-deep font-semibold text-sm">Tap to upload from your phone</p>
                            <p className="text-earth/50 text-xs mt-0.5">MP4 or MOV · 30–90 seconds · up to 200 MB</p>
                          </div>
                          <span className="inline-block text-xs text-coral font-semibold bg-coral/10 px-4 py-2 rounded-full mt-1">
                            Choose video
                          </span>
                        </div>
                      )}
                    </label>

                    {/* URL paste option */}
                    {!showVideoUrlInput ? (
                      <button
                        onClick={() => setShowVideoUrlInput(true)}
                        className="w-full text-xs text-earth/50 hover:text-earth transition-colors py-1"
                      >
                        Or paste a YouTube / Vimeo link instead →
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleVideoUrlSave()}
                          placeholder="https://youtube.com/watch?v=… or vimeo.com/…"
                          className="flex-1 px-3 py-2 rounded-xl border border-stone/40 text-xs text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-white"
                          autoFocus
                        />
                        <button
                          onClick={handleVideoUrlSave}
                          className="bg-coral text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-coral/90 transition-colors shrink-0"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setShowVideoUrlInput(false); setVideoUrlInput(""); }}
                          className="text-earth/50 hover:text-earth text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {videoUploadError && (
                      <p className="text-coral text-xs leading-relaxed bg-coral/5 border border-coral/20 rounded-xl p-3">
                        {videoUploadError}
                      </p>
                    )}
                  </div>
                )}
              </Section>

              {/* Palmarès */}
              {isAthlete(user) && (
                <Section
                  title="Palmarès"
                  icon={
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  }
                >
                  {/* PCS profile link */}
                  {user.procyclingstatsUrl && !editingPcsUrl ? (
                    <div className="flex items-center gap-2 mb-4 p-2.5 bg-stone/20 rounded-xl">
                      <a href={user.procyclingstatsUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-xs text-coral font-medium hover:underline truncate flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        ProCyclingStats profile
                      </a>
                      <button onClick={() => { setPcsUrlDraft(user.procyclingstatsUrl ?? ""); setEditingPcsUrl(true); }}
                        className="text-[10px] text-earth/40 hover:text-earth shrink-0">Edit</button>
                    </div>
                  ) : editingPcsUrl ? (
                    <div className="flex gap-2 items-center mb-4">
                      <input autoFocus type="url" value={pcsUrlDraft} onChange={(e) => setPcsUrlDraft(e.target.value)}
                        placeholder="https://www.procyclingstats.com/rider/your-name"
                        className="flex-1 text-xs px-3 py-2 border border-stone/40 rounded-xl focus:outline-none focus:border-coral/50" />
                      <button onClick={() => { updateProfile({ procyclingstatsUrl: pcsUrlDraft.trim() }); setEditingPcsUrl(false); }}
                        disabled={!pcsUrlDraft.trim()}
                        className="text-xs font-semibold bg-coral text-white px-3 py-2 rounded-full disabled:opacity-40">Save</button>
                      <button onClick={() => setEditingPcsUrl(false)} className="text-xs text-earth/50 px-2">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingPcsUrl(true)}
                      className="w-full text-xs text-earth/50 border border-dashed border-stone/40 hover:border-coral/40 hover:text-coral rounded-xl px-3 py-2 text-left transition-colors mb-4">
                      + Add your ProCyclingStats profile link
                    </button>
                  )}

                  {/* Results list */}
                  {user.pcsResults && user.pcsResults.length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {user.pcsResults.map((r, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs group">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${r.position === 1 ? "bg-coral/15 text-coral" : r.position <= 3 ? "bg-navy/10 text-navy" : "bg-stone/40 text-earth"}`}>
                            {r.position}
                          </span>
                          <span className="flex-1 text-navy-deep truncate">
                            {r.race}{r.year && <span className="text-earth/50 ml-1">{r.year}</span>}
                          </span>
                          {r.category && <span className="text-[10px] text-earth/50 shrink-0">{r.category}</span>}
                          <button onClick={() => handleDeleteResult(i)}
                            className="text-earth/20 hover:text-coral opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shrink-0 ml-1">✕</button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add result form */}
                  {addingResult ? (
                    <div className="border border-stone/40 rounded-xl p-3 space-y-2 mt-2">
                      <input autoFocus type="text" value={newRace} onChange={(e) => setNewRace(e.target.value)}
                        placeholder="Race name (e.g. Tour de l'Avenir)"
                        className="w-full text-xs px-3 py-2 border border-stone/40 rounded-lg focus:outline-none focus:border-coral/50" />
                      <div className="flex gap-2">
                        <input type="number" value={newPos} onChange={(e) => setNewPos(e.target.value)}
                          placeholder="Position" min="1" max="999"
                          className="w-24 text-xs px-3 py-2 border border-stone/40 rounded-lg focus:outline-none focus:border-coral/50" />
                        <input type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)}
                          placeholder="Year" min="2000" max="2030"
                          className="w-24 text-xs px-3 py-2 border border-stone/40 rounded-lg focus:outline-none focus:border-coral/50" />
                        <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)}
                          placeholder="Category (optional)"
                          className="flex-1 text-xs px-3 py-2 border border-stone/40 rounded-lg focus:outline-none focus:border-coral/50" />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleAddResult} disabled={!newRace.trim() || !newPos}
                          className="text-xs font-semibold bg-coral text-white px-4 py-1.5 rounded-full disabled:opacity-40">
                          Add result
                        </button>
                        <button onClick={() => { setAddingResult(false); setNewRace(""); setNewPos(""); setNewCat(""); }}
                          className="text-xs text-earth/50 hover:text-earth px-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingResult(true)}
                      className="w-full text-xs text-coral border border-coral/30 hover:bg-coral/5 rounded-xl px-3 py-2 text-left transition-colors">
                      + Add a race result
                    </button>
                  )}
                </Section>
              )}

              {/* Lab Results */}
              <Section
                title="Lab Test Results"
                icon={
                  <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                <p className="text-earth/60 text-xs leading-relaxed mb-4">
                  Upload certified lab results (VO₂max, metabolic test, blood lactate, etc.) to add a <strong className="text-olive">Lab Certified</strong> badge to your profile. Visible to verified scouts only.
                </p>

                {isAthlete(user) && user.labResultsUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-olive/5 border border-olive/20 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-olive/15 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-warm-black text-xs font-semibold truncate">
                          {user.labResultsFileName ?? "Lab Results"}
                        </p>
                        <span className="text-[10px] font-semibold text-olive bg-olive/10 px-2 py-0.5 rounded-full">Lab Certified ✓</span>
                      </div>
                      <a href={user.labResultsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-earth/50 hover:text-coral transition-colors shrink-0">
                        View
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold border border-olive/40 text-olive hover:bg-olive hover:text-white px-3 py-2 rounded-full transition-all">
                        {uploadingLabResults ? "Uploading…" : "Replace document"}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,application/pdf,image/jpeg,image/png,image/tiff" className="sr-only" onChange={handleLabResultsUpload} disabled={uploadingLabResults} />
                      </label>
                      <button
                        onClick={() => updateProfile({ labResultsUrl: "", labResultsFileName: "" })}
                        className="text-xs font-semibold text-earth/60 hover:text-coral border border-stone/30 px-3 py-2 rounded-full transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`group block cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-colors ${uploadingLabResults ? "border-olive/30 bg-olive/5" : "border-stone/30 hover:border-olive/40 hover:bg-olive/5"}`}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,application/pdf,image/jpeg,image/png,image/tiff" className="sr-only" onChange={handleLabResultsUpload} disabled={uploadingLabResults} />
                    {uploadingLabResults ? (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-7 h-7 text-olive animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <p className="text-olive text-sm font-semibold">Uploading…</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center group-hover:bg-olive/20 transition-colors">
                          <svg className="w-6 h-6 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-navy-deep font-semibold text-sm">Upload lab results document</p>
                        <p className="text-earth/50 text-xs">PDF, JPG, or PNG · up to 10 MB</p>
                        <span className="inline-block text-xs text-olive font-semibold bg-olive/10 px-4 py-2 rounded-full mt-1">Choose file</span>
                      </div>
                    )}
                  </label>
                )}
                {labResultsError && (
                  <p className="text-coral text-xs mt-2 leading-relaxed bg-coral/5 border border-coral/20 rounded-xl p-3">{labResultsError}</p>
                )}
                {analyzingLab && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-olive">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    AI is reading your lab results…
                  </div>
                )}
                {isAthlete(user) && user.labExtractedData && (() => {
                  const d = user.labExtractedData!;
                  const metrics = [
                    { label: "VO₂max", value: d.vo2max ? `${d.vo2max}` : null, unit: "ml/kg/min" },
                    { label: "Lab FTP", value: d.ftpLab ? `${d.ftpLab}` : null, unit: "W" },
                    { label: "LT1", value: d.ltWatts1 ? `${d.ltWatts1}` : null, unit: "W" },
                    { label: "LT2", value: d.ltWatts2 ? `${d.ltWatts2}` : null, unit: "W" },
                    { label: "Max HR", value: d.maxHr ? `${d.maxHr}` : null, unit: "bpm" },
                    { label: "W@VO₂max", value: d.powerAtVo2max ? `${d.powerAtVo2max}` : null, unit: "W" },
                    { label: "VLamax", value: d.vLamax ? `${d.vLamax}` : null, unit: "mmol/L/s" },
                  ].filter(m => m.value);
                  if (metrics.length === 0) return null;
                  return (
                    <div className="mt-4 border border-olive/20 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 bg-olive/5 px-4 py-2.5 border-b border-olive/15">
                        <svg className="w-3.5 h-3.5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                        </svg>
                        <span className="text-xs font-semibold text-olive uppercase tracking-wider">AI Extracted Lab Metrics</span>
                        {d.labName && <span className="text-xs text-earth/60 ml-auto">{d.labName}</span>}
                      </div>
                      <div className="p-3 grid grid-cols-3 gap-2">
                        {metrics.map(m => (
                          <div key={m.label} className="bg-white rounded-lg p-2.5 text-center border border-stone/20">
                            <div className="text-[9px] uppercase tracking-wider text-earth mb-1">{m.label}</div>
                            <div className="text-navy-deep font-bold text-sm">{m.value}</div>
                            <div className="text-earth/50 text-[9px]">{m.unit}</div>
                          </div>
                        ))}
                      </div>
                      {d.notes && (
                        <div className="px-4 pb-3 text-[10px] text-earth/60 italic">{d.notes}</div>
                      )}
                      <div className="px-4 pb-2.5 text-[9px] text-earth/40">
                        These values are for your reference only and do not replace your training data.
                      </div>
                    </div>
                  );
                })()}
              </Section>
            </div>

            {/* ── Right column (sidebar) ── */}
            <div className="space-y-6">

              {/* Pro status / upgrade card */}
              {!isScout(user) && (
                isPro ? (
                  <div className="bg-coral/5 border border-coral/20 rounded-2xl p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-coral shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-coral">Pro Active</p>
                      <p className="text-[10px] text-earth/50">{subStatus === "trialing" ? "Free trial" : "Monthly subscription"}</p>
                    </div>
                    {stripeCustomerId && (
                      <button onClick={handleManageSubscription} disabled={checkingOut}
                        className="text-[10px] text-coral hover:underline shrink-0 font-medium disabled:opacity-50">
                        Manage
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-stone/30 rounded-2xl p-4">
                    <p className="text-xs font-bold text-navy-deep mb-1">Upgrade to Pro</p>
                    <p className="text-[10px] text-earth/60 mb-3">See who views and favourites your profile. Get a verified badge.</p>
                    <button onClick={handleUpgrade} disabled={checkingOut}
                      className="w-full bg-coral hover:bg-coral/90 text-white text-xs font-semibold py-2 rounded-full transition-colors disabled:opacity-50">
                      {checkingOut ? "Loading…" : "€3.99 / month"}
                    </button>
                  </div>
                )
              )}

              {/* Scout Favourites Notifications — Pro only */}
              {!isScout(user) && (
                <Section
                  title="Scouts Interested"
                  icon={
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                >
                  {!isPro ? (
                    <ProUpgradeGate onUpgrade={handleUpgrade} loading={checkingOut}
                      message="See which scouts have starred your profile" />
                  ) : favNotifications.length === 0 ? (
                    <div className="text-center py-2">
                      <p className="text-earth/60 text-sm">No favourites yet</p>
                      <p className="text-earth/40 text-xs mt-1">Scouts who star your profile will appear here</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {favNotifications.map((n) => (
                        <li key={n.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-navy-deep font-medium">{n.scout_name}</p>
                            <p className="text-xs text-earth">{n.scout_org}</p>
                            <p className="text-xs text-earth/40 mt-0.5">
                              {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              )}

              {/* Shortlist Invitations */}
              {!isScout(user) && (
                <Section
                  title="Scout Invitations"
                  icon={
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                >
                  {invitations.length === 0 ? (
                    <div className="text-center py-2">
                      <p className="text-earth/60 text-sm">No invitations yet</p>
                      <p className="text-earth/40 text-xs mt-1">Scouts will send invitations when they want to connect</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invitations.map((inv) => (
                        <div
                          key={inv.scout_id}
                          className={`rounded-xl border p-3 text-sm ${
                            inv.status === "accepted"
                              ? "border-olive/30 bg-olive/5"
                              : inv.status === "declined"
                              ? "border-stone/30 bg-stone/5 opacity-60"
                              : "border-coral/25 bg-coral/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-navy-deep text-xs">{inv.scout_name}</p>
                              <p className="text-earth/60 text-[11px]">{inv.scout_organization}</p>
                            </div>
                            {inv.status === "pending" ? (
                              <span className="text-[10px] font-semibold text-coral bg-coral/10 px-2 py-0.5 rounded-full shrink-0">New</span>
                            ) : inv.status === "accepted" ? (
                              <span className="text-[10px] font-semibold text-olive bg-olive/10 px-2 py-0.5 rounded-full shrink-0">Accepted</span>
                            ) : (
                              <span className="text-[10px] font-semibold text-earth/60 bg-stone/20 px-2 py-0.5 rounded-full shrink-0">Declined</span>
                            )}
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-earth/50 mb-1">{inv.role_type}</p>
                          <p className="text-earth/80 text-xs leading-relaxed mb-3">{inv.message}</p>
                          {inv.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleInviteResponse(inv.scout_id, "accepted")}
                                disabled={inviteLoading}
                                className="flex-1 bg-olive hover:bg-olive/90 text-white text-xs font-semibold py-1.5 rounded-full transition-colors disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleInviteResponse(inv.scout_id, "declined")}
                                disabled={inviteLoading}
                                className="flex-1 border border-stone/40 text-earth text-xs font-medium py-1.5 rounded-full hover:border-stone/70 transition-colors disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* Direct Messages from Scouts */}
              {!isScout(user) && (
                <Section
                  title="Messages"
                  icon={
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                >
                  {inboxMessages.length === 0 ? (
                    <div className="text-center py-2">
                      <p className="text-earth/60 text-sm">No messages yet</p>
                      <p className="text-earth/40 text-xs mt-1">Scouts who contact you will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inboxMessages.map((msg) => (
                        <div key={msg.id} className={`rounded-xl border p-3 text-sm ${msg.read ? "border-stone/20 bg-stone/5" : "border-coral/25 bg-coral/5"}`}>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <p className="font-semibold text-navy-deep text-xs">{msg.scout_name}</p>
                              {msg.scout_organization && <p className="text-earth/60 text-[11px]">{msg.scout_organization}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!msg.read && <span className="w-2 h-2 rounded-full bg-coral inline-block" />}
                              <span className="text-[10px] text-earth/40">
                                {new Date(msg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          </div>
                          <p className="text-earth/80 text-xs leading-relaxed">{msg.message}</p>

                          {/* Previous replies */}
                          {msg.replies.length > 0 && (
                            <div className="mt-2 space-y-1.5 border-l-2 border-olive/30 pl-2.5">
                              {msg.replies.map((r, i) => (
                                <div key={i}>
                                  <p className="text-[10px] font-semibold text-olive">{r.athlete_name} <span className="font-normal text-earth/40">{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></p>
                                  <p className="text-xs text-earth/80">{r.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply / mark read */}
                          <div className="flex gap-3 mt-2">
                            {replyingTo !== msg.id && (
                              <button
                                onClick={async () => {
                                  if (!msg.read && supabase) {
                                    await supabase.from("messages").update({ read: true }).eq("id", msg.id);
                                    setInboxMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
                                  }
                                  setReplyingTo(msg.id);
                                  setReplyText("");
                                }}
                                className="text-[10px] font-semibold text-coral hover:underline"
                              >
                                Reply
                              </button>
                            )}
                            {!msg.read && replyingTo !== msg.id && (
                              <button
                                onClick={async () => {
                                  if (!supabase) return;
                                  await supabase.from("messages").update({ read: true }).eq("id", msg.id);
                                  setInboxMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
                                }}
                                className="text-[10px] text-earth/40 hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>

                          {/* Inline reply form */}
                          {replyingTo === msg.id && (
                            <div className="mt-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply…"
                                rows={3}
                                className="w-full border border-stone/40 rounded-xl px-3 py-2 text-xs text-warm-black placeholder-earth/50 focus:outline-none focus:border-coral/60 resize-none"
                              />
                              <div className="flex gap-2 mt-1.5 justify-end">
                                <button
                                  onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                  className="text-[10px] text-earth/50 hover:text-earth px-3 py-1.5 border border-stone/30 rounded-full"
                                >
                                  Cancel
                                </button>
                                <button
                                  disabled={!replyText.trim() || replySending}
                                  onClick={async () => {
                                    if (!supabase || !user || !replyText.trim()) return;
                                    setReplySending(true);
                                    const newReply: MessageReply = {
                                      text: replyText.trim(),
                                      from_athlete_id: user.id,
                                      athlete_name: `${(user as { firstName?: string }).firstName ?? ""} ${(user as { lastName?: string }).lastName ?? ""}`.trim(),
                                      created_at: new Date().toISOString(),
                                    };
                                    const updated = [...msg.replies, newReply];
                                    await supabase.from("messages").update({ replies: updated, read: true }).eq("id", msg.id);
                                    setInboxMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, replies: updated, read: true } : m));
                                    setReplyingTo(null);
                                    setReplyText("");
                                    setReplySending(false);
                                  }}
                                  className="text-[10px] font-semibold bg-coral hover:bg-coral/90 disabled:opacity-50 text-white px-4 py-1.5 rounded-full transition-colors"
                                >
                                  {replySending ? "Sending…" : "Send Reply"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* Scout Views */}
              {!isScout(user) && (
                <Section
                  title="Scout Views"
                  icon={
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                >
                  {!isPro ? (
                    <ProUpgradeGate onUpgrade={handleUpgrade} loading={checkingOut}
                      message="See exactly which scouts viewed your profile" />
                  ) : scoutViewCount === null ? (
                    <p className="text-earth/50 text-xs text-center py-2">Loading…</p>
                  ) : scoutViewCount === 0 ? (
                    <div className="text-center py-2">
                      <p className="text-earth/60 text-sm">No scout views yet</p>
                      <p className="text-earth/40 text-xs mt-1">Scouts who view your profile will appear here</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {scoutViewList.map((v, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs">
                          <div className="w-8 h-8 rounded-full bg-olive/15 flex items-center justify-center shrink-0">
                            <span className="text-olive font-bold text-[10px]">
                              {(v.scout_first_name?.[0] ?? "") + (v.scout_last_name?.[0] ?? "")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-navy-deep font-medium truncate">{v.scout_first_name} {v.scout_last_name}</p>
                            <p className="text-earth/50 text-[10px]">{v.scout_role} · {v.scout_organization}</p>
                          </div>
                          <p className="text-earth/30 text-[10px] shrink-0">
                            {new Date(v.last_viewed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              )}

              {/* Personal Details */}
              <Section
                title="Details"
                onEdit={() => setEditSection("Personal Info")}
              >
                <dl className="space-y-3">
                  {[
                    ["Nationality", user.nationality ? `${user.flag} ${user.nationality}` : null],
                    ["Location", user.location],
                    ["Sex", user.sex ? user.sex.charAt(0).toUpperCase() + user.sex.slice(1) : null],
                    ["Category", user.category],
                    ["Discipline", user.discipline],
                    ["Team", user.team],
                    ["Experience", user.experienceYears ? `${user.experienceYears} yrs` : null],
                    ["Email", user.email],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label as string} className="flex justify-between gap-2 items-start">
                        <dt className="text-earth text-xs shrink-0">{label}</dt>
                        <dd className="text-warm-black font-medium text-xs text-right">{value}</dd>
                      </div>
                    ))}
                </dl>
              </Section>

              {/* Connections */}
              <Section
                title="Connections"
                onEdit={() => setEditSection("Connections")}
              >
                <div className="space-y-3">

                  {/* ── Strava ── */}
                  <div className="rounded-xl border border-stone/20 overflow-hidden">
                    {/* Header row */}
                    <div className={`flex items-center gap-3 px-3 py-2.5 ${stravaOAuth ? "bg-[#FC4C02]/8" : "bg-stone/5"}`}>
                      <svg className="w-5 h-5 text-[#FC4C02] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                      </svg>
                      <span className="text-xs font-semibold text-warm-black flex-1">Strava</span>
                      {stravaOAuth ? (
                        <span className="text-[10px] font-semibold text-[#FC4C02] bg-[#FC4C02]/10 px-2 py-0.5 rounded-full">Live Data ✓</span>
                      ) : (isAthlete(user) && user.stravaUrl) ? (
                        <span className="text-[10px] font-semibold text-earth/50 bg-stone/30 px-2 py-0.5 rounded-full">URL only</span>
                      ) : null}
                    </div>

                    {stravaOAuth && isAthlete(user) ? (
                      /* ── Connected via OAuth — live stats ── */
                      <div className="px-3 pt-3 pb-3 border-t border-stone/10 space-y-3">

                        {/* Training volume */}
                        <div className="text-[9px] uppercase tracking-wider text-earth/40 font-semibold">Weekly Training</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: "Hours/Wk", value: user.stravaWeeklyHours    != null ? `${user.stravaWeeklyHours}h` : "—" },
                            { label: "4-Wk km",  value: user.stravaRecentDistance  != null ? `${user.stravaRecentDistance}` : "—" },
                            { label: "Elev/Wk",  value: user.stravaWeeklyElevation != null ? `${user.stravaWeeklyElevation.toLocaleString()}m` : "—" },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-stone/5 rounded-lg p-2 text-center">
                              <div className="text-sm font-bold text-navy-deep">{value}</div>
                              <div className="text-[9px] uppercase tracking-wider text-earth/50 mt-0.5">{label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Power (only if power meter) */}
                        {user.stravaPowerVerified && (
                          <>
                            <div className="text-[9px] uppercase tracking-wider text-earth/40 font-semibold">Power (Strava-verified)</div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { label: "Est. FTP",   value: user.stravaFTPEstimate  != null ? `~${user.stravaFTPEstimate}W`  : "—" },
                                { label: "Peak Power", value: user.stravaBestMaxPower != null ? `${user.stravaBestMaxPower}W`  : "—" },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-[#FC4C02]/5 border border-[#FC4C02]/15 rounded-lg p-2 text-center">
                                  <div className="text-sm font-bold text-navy-deep">{value}</div>
                                  <div className="text-[9px] uppercase tracking-wider text-earth/50 mt-0.5">{label}</div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* YTD */}
                        {(user.stravaYTDDistance || user.stravaYTDElevation || user.stravaYTDHours) && (
                          <>
                            <div className="text-[9px] uppercase tracking-wider text-earth/40 font-semibold">Year to Date</div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { label: "km",  value: user.stravaYTDDistance  != null ? user.stravaYTDDistance.toLocaleString()  : "—" },
                                { label: "m ↑", value: user.stravaYTDElevation != null ? user.stravaYTDElevation.toLocaleString() : "—" },
                                { label: "hrs", value: user.stravaYTDHours     != null ? `${user.stravaYTDHours}`                 : "—" },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-stone/5 rounded-lg p-2 text-center">
                                  <div className="text-sm font-bold text-navy-deep">{value}</div>
                                  <div className="text-[9px] uppercase tracking-wider text-earth/50 mt-0.5">{label}</div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Training load */}
                        {user.stravaTotalSufferScore != null && (
                          <div className="flex items-center justify-between bg-stone/5 rounded-lg px-3 py-2">
                            <span className="text-[9px] uppercase tracking-wider text-earth/40 font-semibold">30-day Training Load</span>
                            <span className="text-sm font-bold text-navy-deep">{user.stravaTotalSufferScore.toLocaleString()}</span>
                          </div>
                        )}

                        {/* Sync row */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] text-earth/40">
                            {user.stravaLastSynced
                              ? `Synced ${new Date(user.stravaLastSynced).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                              : "Not yet synced"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleStravaSync}
                              disabled={stravaSyncing}
                              className="text-[10px] font-semibold text-[#FC4C02] hover:bg-[#FC4C02]/10 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
                            >
                              {stravaSyncing ? "Syncing…" : "↻ Sync"}
                            </button>
                            {user.stravaUrl && (
                              <a
                                href={user.stravaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-earth/50 hover:text-coral transition-colors"
                              >
                                View →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ── Not connected via OAuth — show connect button ── */
                      <div className="px-3 pt-2.5 pb-3 border-t border-stone/10 space-y-2">
                        {isAthlete(user) && user.stravaUrl && (
                          <a
                            href={user.stravaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-coral hover:underline truncate block"
                          >
                            {user.stravaUrl}
                          </a>
                        )}
                        <p className="text-[11px] text-earth/50 leading-relaxed">
                          {isAthlete(user) && user.stravaUrl
                            ? "Connect via OAuth to auto-import live training stats."
                            : "Connect Strava to import your weekly training stats and verify your power data."}
                        </p>
                        {stravaAuthUrl ? (
                          <a
                            href={stravaAuthUrl}
                            className="flex items-center justify-center gap-2 w-full bg-[#FC4C02] hover:bg-[#FC4C02]/90 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                            </svg>
                            Connect with Strava
                          </a>
                        ) : (
                          <div className="text-[10px] text-earth/40 text-center py-1">
                            Strava integration coming soon
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Instagram ── */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isAthlete(user) && user.instagramUrl
                      ? "bg-[#E1306C]/8 border-[#E1306C]/20"
                      : "bg-stone/5 border-stone/20"
                  }`}>
                    <span className="text-[#E1306C] font-bold text-xs w-5 text-center shrink-0">IG</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-warm-black">Instagram</span>
                      {isAthlete(user) && user.instagramUrl ? (
                        <a
                          href={user.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-coral hover:underline truncate block"
                        >
                          {user.instagramUrl}
                        </a>
                      ) : (
                        <div className="text-[10px] text-earth/50">Not added — tap Edit to add</div>
                      )}
                    </div>
                    {isAthlete(user) && user.instagramUrl && (
                      <svg className="w-4 h-4 text-olive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                </div>
              </Section>

              {/* Scout CTA */}
              <div className="bg-navy-deep rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-sm text-white">How scouts see you</h3>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
                      Your profile is live and visible to scouts on AthleticLinq.
                    </p>
                  </div>
                </div>
                <Link
                  href="/discover"
                  className="block text-center bg-coral hover:bg-coral/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors"
                >
                  View Athlete Directory →
                </Link>
              </div>

              {/* Danger zone */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-earth/50 hover:text-coral transition-colors underline underline-offset-2"
                >
                  Delete my account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
