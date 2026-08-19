"use client";

import { useAuth, isScout } from "@/context/AuthContext";
import Link from "next/link";

interface PowerGateProps {
  children: React.ReactNode;
  /** Optional: show inline lock instead of full panel */
  inline?: boolean;
}

/**
 * Wraps any power/performance data and hides it from non-scout viewers.
 * Works in server-rendered pages because it's a client component — it reads
 * the auth context at hydration time and conditionally renders.
 */
export default function PowerGate({ children, inline = false }: PowerGateProps) {
  const { user } = useAuth();
  const isVerifiedScout = isScout(user) && user.verified;

  if (isVerifiedScout) {
    return <>{children}</>;
  }

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-earth/50 text-sm">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Available to verified scouts</span>
      </div>
    );
  }

  const isLoggedInAthlete = !!user && !isScout(user);
  const isPendingScout = isScout(user) && !user.verified;

  return (
    <div className="rounded-2xl border-2 border-dashed border-stone/30 p-8 text-center bg-stone/5">
      <div className="w-14 h-14 rounded-full bg-navy-deep/8 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-navy-deep/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      {isPendingScout ? (
        <>
          <h3 className="font-display text-lg text-navy-deep mb-2">Verification pending</h3>
          <p className="text-earth text-sm mb-4 leading-relaxed">
            Power data and performance metrics are unlocked once your scout account is verified. You&apos;ll hear back within 24–48 hours.
          </p>
          <Link href="/dashboard"
            className="inline-block text-xs font-semibold text-amber-700 border border-amber-300 bg-amber-50 px-5 py-2 rounded-full hover:bg-amber-100 transition-colors"
          >
            Check verification status →
          </Link>
        </>
      ) : isLoggedInAthlete ? (
        <>
          <h3 className="font-display text-lg text-navy-deep mb-2">Power data — scouts only</h3>
          <p className="text-earth text-sm mb-4 leading-relaxed">
            Performance metrics are private and only visible to verified scouts and team managers. Athletes cannot view other riders&apos; power numbers.
          </p>
          <Link href="/discover"
            className="inline-block text-xs font-semibold text-coral border border-coral/30 px-5 py-2 rounded-full hover:bg-coral hover:text-white transition-colors"
          >
            Browse athletes →
          </Link>
        </>
      ) : (
        <>
          <h3 className="font-display text-lg text-navy-deep mb-2">Scout access required</h3>
          <p className="text-earth text-sm mb-4 leading-relaxed">
            Power numbers, FTP, and performance data are only available to verified scouts and team managers.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/signup/scout"
              className="inline-block text-xs font-semibold bg-navy-deep text-white px-5 py-2 rounded-full hover:bg-navy-deep/90 transition-colors"
            >
              Apply as Scout
            </Link>
            <Link href="/login"
              className="inline-block text-xs font-semibold text-earth border border-stone/40 px-5 py-2 rounded-full hover:border-navy-deep/30 transition-colors"
            >
              Log In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
