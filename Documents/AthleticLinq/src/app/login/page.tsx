"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#c83c5a" strokeWidth="2.5" strokeDasharray="56 14" strokeLinecap="round" />
              <path d="M13 28 L20 10 L27 28" stroke="#1a2744" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.5 22.5 H24.5" stroke="#c83c5a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="29" cy="28" r="2.5" fill="#c83c5a" />
            </svg>
            <span className="font-display text-2xl text-navy tracking-tight">
              Athletic<span className="text-coral">Linq</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl text-navy mb-2">Welcome back</h1>
          <p className="text-earth text-sm">Log in to your AthleticLinq account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-coral/10 border border-coral/30 text-coral text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-earth mb-1.5 font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-earth font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-coral hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone/40 text-sm text-warm-black focus:outline-none focus:ring-2 focus:ring-coral/30 bg-cream-warm/30"
                placeholder="Your password"
                minLength={8}
                autoComplete="current-password"
                name="password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral hover:bg-coral-light text-white font-medium py-2.5 rounded-full transition-colors text-sm mt-2 disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-stone/30" />
            <span className="text-earth/40 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-stone/30" />
          </div>

          {/* Strava login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-[#FC4C02] hover:bg-[#E04402] text-white rounded-full py-2.5 text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Continue with Strava
          </button>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-earth text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup/athlete" className="text-coral hover:underline font-medium">
              Sign up as Athlete
            </Link>
            {" · "}
            <Link href="/signup/scout" className="text-coral hover:underline font-medium">
              Sign up as Scout
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
