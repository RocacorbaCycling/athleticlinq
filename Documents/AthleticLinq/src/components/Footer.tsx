import Link from "next/link";

function FooterLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="#c83c5a" strokeWidth="2.5" strokeDasharray="56 14" strokeLinecap="round" />
        <path d="M13 28 L20 10 L27 28" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5 22.5 H24.5" stroke="#c83c5a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="29" cy="28" r="2.5" fill="#c83c5a" />
      </svg>
      <span className="font-display text-xl text-white">
        Athletic<span className="text-coral">Linq</span>
      </span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <FooterLogo />
            <p className="text-sm leading-relaxed">
              Connecting the world&apos;s most talented young cyclists with the
              teams and scouts who can launch their careers.
            </p>
          </div>

          {/* Athletes */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 uppercase tracking-wider">
              Athletes
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discover" className="hover:text-coral transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-coral transition-colors">
                  Upload Video
                </Link>
              </li>
              <li>
                <Link href="/compound-score" className="hover:text-coral transition-colors">
                  Compound Score Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Scouts */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 uppercase tracking-wider">
              Scouts & Teams
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/for-scouts" className="hover:text-coral transition-colors">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link href="/for-scouts" className="hover:text-coral transition-colors">
                  Shortlist Athletes
                </Link>
              </li>
              <li>
                <Link href="/for-scouts" className="hover:text-coral transition-colors">
                  Team Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-coral transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-coral transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-coral transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-coral transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-coral transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} AthleticLinq. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/" className="hover:text-coral transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-coral transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
