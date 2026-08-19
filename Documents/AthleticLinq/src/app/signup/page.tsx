import Link from "next/link";

export default function SignupChooser() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl text-navy mb-3">
            Join AthleticLinq
          </h1>
          <p className="text-earth text-lg">
            Are you a young cyclist looking to get discovered, or a scout looking for talent?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Athlete Card */}
          <Link href="/signup/athlete">
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-stone/40 hover:border-coral/40 hover:shadow-lg transition-all duration-300 text-center cursor-pointer h-full">
              <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-coral/20 transition-colors">
                <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">I&apos;m an Athlete</h2>
              <p className="text-earth text-sm mb-6 leading-relaxed">
                Create your profile, share your power numbers and compound score, upload videos, and get discovered by professional teams.
              </p>
              <ul className="text-left text-sm text-earth space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-coral">✓</span> Showcase FTP, W/kg & Compound Score
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral">✓</span> Upload profile videos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral">✓</span> Link Strava & Instagram
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral">✓</span> Get noticed by WorldTour teams
                </li>
              </ul>
              <span className="inline-block bg-coral hover:bg-coral-light text-white font-medium px-6 py-2.5 rounded-full transition-colors text-sm group-hover:bg-coral-light">
                Sign Up as Athlete →
              </span>
            </div>
          </Link>

          {/* Scout Card */}
          <Link href="/signup/scout">
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-stone/40 hover:border-navy/30 hover:shadow-lg transition-all duration-300 text-center cursor-pointer h-full">
              <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-navy/15 transition-colors">
                <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">I&apos;m a Scout / Team</h2>
              <p className="text-earth text-sm mb-6 leading-relaxed">
                Access verified athlete profiles, filter by compound score and power data, and contact the next generation of talent.
              </p>
              <ul className="text-left text-sm text-earth space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-navy">✓</span> Filter by Compound Score & W/kg
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-navy">✓</span> View verified performance data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-navy">✓</span> Watch athlete profile videos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-navy">✓</span> Contact athletes directly
                </li>
              </ul>
              <span className="inline-block border border-navy/30 hover:border-navy text-navy font-medium px-6 py-2.5 rounded-full transition-colors text-sm group-hover:bg-navy group-hover:text-white">
                Sign Up as Scout →
              </span>
            </div>
          </Link>
        </div>

        {/* Already have account */}
        <p className="text-center text-earth text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-coral hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
