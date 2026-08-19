"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function AthleticLinqLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <circle cx="20" cy="20" r="18" stroke="#c83c5a" strokeWidth="2.5" strokeDasharray="56 14" strokeLinecap="round" />
      <path d="M13 28 L20 10 L27 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 22.5 H24.5" stroke="#c83c5a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="29" cy="28" r="2.5" fill="#c83c5a" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-deep/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <AthleticLinqLogo size="md" />
            <span className="font-display text-xl text-white tracking-tight">
              Athletic<span className="text-coral">Linq</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="text-white/70 hover:text-coral transition-colors text-sm font-medium">
              Discover
            </Link>
            <Link href="/teams" className="text-white/70 hover:text-coral transition-colors text-sm font-medium">
              Teams
            </Link>
            <Link href="/for-scouts" className="text-white/70 hover:text-coral transition-colors text-sm font-medium">
              For Scouts
            </Link>
            <Link href="/compound-score" className="text-white/70 hover:text-coral transition-colors text-sm font-medium">
              Score Calculator
            </Link>
            <Link href="/pricing" className="text-white/70 hover:text-coral transition-colors text-sm font-medium">
              Pricing
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full pl-3 pr-2 py-1.5 transition-colors"
                >
                  <span className="text-white text-sm font-medium">{user.firstName}</span>
                  <div className="w-7 h-7 rounded-full bg-coral flex items-center justify-center text-white text-xs font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone/30 overflow-hidden z-50">
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-warm-black hover:bg-cream-warm/60 transition-colors">
                      <svg className="w-4 h-4 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Dashboard
                    </Link>
                    <Link href="/discover" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-warm-black hover:bg-cream-warm/60 transition-colors">
                      <svg className="w-4 h-4 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Discover Athletes
                    </Link>
                    <div className="border-t border-stone/30" />
                    <button onClick={() => { logout(); setUserMenuOpen(false); router.push("/"); }}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-coral hover:bg-coral/5 transition-colors w-full text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login"
                  className="text-white/70 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40">
                  Log In
                </Link>
                <Link href="/signup"
                  className="bg-coral hover:bg-coral-light text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-deep border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <Link href="/discover" className="block text-white/70 hover:text-coral transition-colors text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Discover</Link>
            <Link href="/teams" className="block text-white/70 hover:text-coral transition-colors text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Teams</Link>
            <Link href="/for-scouts" className="block text-white/70 hover:text-coral transition-colors text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>For Scouts</Link>
            <Link href="/compound-score" className="block text-white/70 hover:text-coral transition-colors text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Score Calculator</Link>
            <Link href="/pricing" className="block text-white/70 hover:text-coral transition-colors text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
            {user ? (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-3 py-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-white/40 text-xs capitalize">{user.type ?? "athlete"}</p>
                  </div>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2.5 text-white/70 hover:text-coral text-sm font-medium py-2 transition-colors" onClick={() => setMobileOpen(false)}>
                  My Dashboard
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}
                  className="flex items-center gap-2.5 text-coral text-sm font-medium py-2 transition-colors w-full text-left">
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1 text-center text-white/70 text-sm font-medium px-4 py-2 rounded-full border border-white/20" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link href="/signup" className="flex-1 text-center bg-coral text-white text-sm font-medium px-5 py-2 rounded-full" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
