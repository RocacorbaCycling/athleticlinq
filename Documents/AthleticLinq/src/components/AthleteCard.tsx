import type { Athlete } from "@/data/athletes";
import { getUCILevel } from "@/data/athletes";
import CompoundScore from "./CompoundScore";
import FavouriteButton from "./FavouriteButton";
import FireButton from "./FireButton";

interface AthleteCardProps {
  athlete: Athlete;
  /** Only verified scouts see power numbers. Everyone else gets a lock. */
  showPower?: boolean;
}

export default function AthleteCard({ athlete, showPower = false }: AthleteCardProps) {
  return (
    <a href={`/athletes/${athlete.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone/40 hover:border-coral/30">
        {/* Video/Image Thumbnail */}
        <div className="relative aspect-[4/5] bg-navy-deep overflow-hidden">
          {/* Profile image or gradient placeholder */}
          {athlete.profileImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${athlete.profileImage})` }}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-deep to-charcoal" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-display text-white/20">
                  {athlete.firstName[0]}
                  {athlete.lastName[0]}
                </span>
              </div>
            </>
          )}

          {/* Video play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-coral/90 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-navy/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {athlete.flag} {athlete.nationality}
            </span>
            {athlete.verified && (
              <span className="bg-coral/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>

          {/* Age badge + action button (star for scouts, fire for athletes) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="bg-olive/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Age {athlete.age}
            </span>
            <FavouriteButton
              athleteId={athlete.id}
              athleteFirstName={athlete.firstName}
              athleteLastName={athlete.lastName}
              variant="card"
            />
            <FireButton toAthleteId={athlete.id} variant="card" />
          </div>

          {/* Bottom name strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-white font-display text-lg leading-tight">
                  {athlete.firstName}
                </div>
                <div className="text-white font-display text-lg leading-tight">
                  {athlete.lastName}
                </div>
                <div className="text-white/60 text-xs mt-0.5">
                  {athlete.discipline}
                </div>
                {(() => {
                  const lvl = getUCILevel(athlete.compoundScore, athlete.category);
                  return (
                    <span
                      className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1"
                      style={{ color: lvl.color, backgroundColor: lvl.bg + "cc" }}
                    >
                      {lvl.short}
                    </span>
                  );
                })()}
              </div>
              {/* Compound score — scouts only */}
              {showPower ? (
                <CompoundScore score={athlete.compoundScore} size="sm" />
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-white/30 text-[9px] uppercase tracking-wide">Scouts</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        {showPower ? (
          <div className="p-3 bg-cream-warm/50">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-earth">Compound</div>
                <div className="text-coral font-bold text-sm">{athlete.compoundScore}</div>
                <div className="text-earth text-[10px]">W²/kg</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-earth">FTP</div>
                <div className="text-navy font-bold text-sm">{athlete.ftp}W</div>
                <div className="text-earth text-[10px]">{athlete.ftpPerKg} W/kg</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-earth">5min</div>
                <div className="text-navy font-bold text-sm">{athlete.fiveMinPower}W</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-earth">Sprint</div>
                <div className="text-navy font-bold text-sm">{athlete.maxPower}W</div>
              </div>
            </div>
          </div>
        ) : (
          /* Locked stats strip — athletes and guests see this */
          <div className="p-3 bg-cream-warm/50">
            <div className="flex items-center justify-center gap-2 py-2">
              <svg className="w-3.5 h-3.5 text-earth/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-earth/50 text-xs font-medium">Power data · Scouts only</span>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
          {athlete.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider text-earth bg-stone/40 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
          {athlete.stravaConnected && (
            <span className="text-[10px] uppercase tracking-wider text-[#FC4C02] bg-[#FC4C02]/10 px-2 py-0.5 rounded-full font-medium">
              Strava
            </span>
          )}
          {athlete.labResultsUrl && (
            <span className="text-[10px] uppercase tracking-wider text-olive bg-olive/10 px-2 py-0.5 rounded-full font-medium">
              Lab Certified
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
