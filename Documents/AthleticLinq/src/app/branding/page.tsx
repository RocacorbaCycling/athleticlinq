import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brand Kit — AthleticLinq",
  description: "Official AthleticLinq logos, icons, and brand assets for download.",
};

const assets = [
  {
    id: "logo-dark",
    title: "Logo — Dark",
    description: "Primary logo on navy background. Use for social media posts, email signatures, and dark-themed placements.",
    file: "/brand/logo-dark.svg",
    preview: "/brand/logo-dark.svg",
    bg: "bg-navy-deep",
    dims: "1200 × 400",
    usage: ["Social posts", "Email footer", "Dark backgrounds"],
  },
  {
    id: "logo-light",
    title: "Logo — Light",
    description: "Primary logo on cream background. Use for light-themed placements, printed materials, and website embeds.",
    file: "/brand/logo-light.svg",
    preview: "/brand/logo-light.svg",
    bg: "bg-cream-warm",
    dims: "1200 × 400",
    usage: ["Light backgrounds", "Print", "Website embeds"],
  },
  {
    id: "logo-white",
    title: "Logo — White / Transparent",
    description: "All-white wordmark with transparent background. Drop onto any coloured surface.",
    file: "/brand/logo-white.svg",
    preview: "/brand/logo-white.svg",
    bg: "bg-navy",
    dims: "1200 × 400",
    usage: ["Colour overlays", "Video watermarks", "Merchandise"],
  },
  {
    id: "icon-square",
    title: "App Icon — Square",
    description: "Square icon for Instagram, Facebook, and platform profile pictures. Rounded-corner format.",
    file: "/brand/icon-square.svg",
    preview: "/brand/icon-square.svg",
    bg: "bg-navy-deep",
    dims: "800 × 800",
    usage: ["Instagram", "Facebook", "App stores"],
  },
  {
    id: "icon-circle",
    title: "App Icon — Circle",
    description: "Circular icon for Twitter/X, LinkedIn, and any platform that uses a round profile crop.",
    file: "/brand/icon-circle.svg",
    preview: "/brand/icon-circle.svg",
    bg: "bg-navy-deep",
    dims: "800 × 800",
    usage: ["Twitter / X", "LinkedIn", "WhatsApp"],
  },
  {
    id: "banner-twitter",
    title: "Banner — Twitter / X",
    description: "Wide header banner sized for Twitter/X (1500 × 500). Also works for YouTube channel art.",
    file: "/brand/banner-twitter.svg",
    preview: "/brand/banner-twitter.svg",
    bg: "bg-navy-deep",
    dims: "1500 × 500",
    usage: ["Twitter / X header", "YouTube art", "Discord banner"],
  },
  {
    id: "banner-linkedin",
    title: "Banner — LinkedIn",
    description: "LinkedIn company page cover banner at the platform's native 1128 × 191 ratio.",
    file: "/brand/banner-linkedin.svg",
    preview: "/brand/banner-linkedin.svg",
    bg: "bg-navy-deep",
    dims: "1128 × 191",
    usage: ["LinkedIn company page"],
  },
];

const palette = [
  { name: "Navy Deep", hex: "#0f1a2e", label: "Primary background" },
  { name: "Navy", hex: "#1a2744", label: "Headers, UI" },
  { name: "Coral", hex: "#c83c5a", label: "Accent, CTAs" },
  { name: "Coral Light", hex: "#e28a7e", label: "Hover states" },
  { name: "Olive", hex: "#5a6b4a", label: "Verified, data" },
  { name: "Earth", hex: "#8c7b6b", label: "Supporting text" },
  { name: "Stone", hex: "#e5ddd3", label: "Borders" },
  { name: "Cream Warm", hex: "#f0ebe3", label: "Card backgrounds" },
  { name: "Warm White", hex: "#faf8f5", label: "Page background" },
];

export default function BrandingPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="relative bg-navy-deep pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-deep via-navy to-navy-deep" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 text-coral text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            Official Brand Assets
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">
            AthleticLinq<br />
            <span className="text-coral">Brand Kit</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Official logos, icons, and banners for all your social media platforms.
            All assets are free to use for AthleticLinq-related content.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Download tip */}
        <div className="bg-navy/5 border border-navy/10 rounded-2xl p-5 mb-12 flex gap-4 items-start">
          <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-navy font-medium text-sm mb-1">How to download</p>
            <p className="text-earth text-sm">
              Click the <strong>Download SVG</strong> button on any asset below. SVG files are
              infinitely scalable — open them in Figma, Canva, or Photoshop and export as PNG at
              any resolution you need. For social profile pictures, export at <strong>400×400 px</strong>
              minimum. For banners, export at the native dimensions shown.
            </p>
          </div>
        </div>

        {/* Assets grid */}
        <h2 className="font-display text-2xl text-navy mb-6">Logos &amp; Icons</h2>
        <div className="space-y-6 mb-16">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-stone/30 shadow-sm overflow-hidden"
            >
              {/* Preview */}
              <div className={`${asset.bg} p-8 flex items-center justify-center min-h-[160px]`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.preview}
                  alt={asset.title}
                  className="max-w-full max-h-48 object-contain"
                />
              </div>

              {/* Info + download */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg text-navy">{asset.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider bg-stone/50 text-earth px-2 py-0.5 rounded-full font-medium">
                      {asset.dims}
                    </span>
                  </div>
                  <p className="text-earth text-sm mb-3">{asset.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.usage.map((use) => (
                      <span
                        key={use}
                        className="text-[10px] uppercase tracking-wider bg-cream-warm text-earth px-2.5 py-1 rounded-full border border-stone/30"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={asset.file}
                  download={`athleticlinq-${asset.id}.svg`}
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-navy hover:bg-navy-deep text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download SVG
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Colour Palette */}
        <h2 className="font-display text-2xl text-navy mb-6">Brand Colours</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-16">
          {palette.map((colour) => (
            <div key={colour.hex} className="bg-white rounded-xl border border-stone/30 overflow-hidden shadow-sm">
              <div
                className="h-20 w-full"
                style={{ backgroundColor: colour.hex }}
              />
              <div className="p-2.5">
                <div className="text-[10px] font-medium text-warm-black mb-0.5">{colour.name}</div>
                <div className="text-[10px] font-mono text-earth">{colour.hex}</div>
                <div className="text-[9px] text-earth/60 uppercase tracking-wider mt-0.5">{colour.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Typography */}
        <h2 className="font-display text-2xl text-navy mb-6">Brand Typography</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          <div className="bg-white rounded-2xl border border-stone/30 p-6 shadow-sm">
            <div className="text-earth text-xs uppercase tracking-wider mb-3">Display / Headings</div>
            <div className="font-display text-4xl text-navy mb-2">Playfair</div>
            <div className="font-display text-4xl text-coral mb-3">Display</div>
            <div className="text-earth text-xs">
              Used for athlete names, section titles, and hero text.
              Available from Google Fonts.
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone/30 p-6 shadow-sm">
            <div className="text-earth text-xs uppercase tracking-wider mb-3">Body / UI</div>
            <div className="font-body text-3xl font-light text-navy mb-1">Inter</div>
            <div className="font-body text-3xl font-medium text-navy mb-3">Regular</div>
            <div className="text-earth text-xs">
              Used for body copy, UI labels, stats, and navigation.
              Available from Google Fonts.
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone/30 p-6 shadow-sm">
            <div className="text-earth text-xs uppercase tracking-wider mb-3">Accent / Editorial</div>
            <div className="font-accent text-4xl font-light text-navy mb-1">Cormorant</div>
            <div className="font-accent text-4xl text-coral mb-3">Garamond</div>
            <div className="text-earth text-xs">
              Used for pull quotes and editorial-style callouts.
              Available from Google Fonts.
            </div>
          </div>
        </div>

        {/* Usage guidelines */}
        <h2 className="font-display text-2xl text-navy mb-6">Usage Guidelines</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          <div className="bg-olive/5 border border-olive/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-olive/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-olive" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-olive font-medium text-sm">Do</span>
            </div>
            <ul className="space-y-2 text-earth text-sm">
              <li>✓ Use the logo on a navy or light cream background</li>
              <li>✓ Maintain clear space equal to the height of the &quot;A&quot; around the logo</li>
              <li>✓ Use the all-white version on coloured photo backgrounds</li>
              <li>✓ Scale proportionally — never stretch or distort</li>
              <li>✓ Use the coral accent (#c83c5a) for links and highlights</li>
            </ul>
          </div>
          <div className="bg-coral/5 border border-coral/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-coral font-medium text-sm">Don&apos;t</span>
            </div>
            <ul className="space-y-2 text-earth text-sm">
              <li>✗ Don&apos;t change the coral accent to another colour</li>
              <li>✗ Don&apos;t place the logo on busy photo backgrounds without the navy overlay</li>
              <li>✗ Don&apos;t recreate the logo in a different font</li>
              <li>✗ Don&apos;t add drop shadows or outlines to the wordmark</li>
              <li>✗ Don&apos;t use the logo at smaller than 120px wide</li>
            </ul>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-earth text-sm">
          Questions about brand usage?{" "}
          <Link href="/discover" className="text-coral hover:text-coral-light transition-colors">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
