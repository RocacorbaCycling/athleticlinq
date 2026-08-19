import type { Athlete } from "@/data/athletes";

interface VideoCardProps {
  athlete: Athlete;
}

export default function VideoCard({ athlete }: VideoCardProps) {
  return (
    <a href={`/athletes/${athlete.id}`}>
      <div className="group relative video-portrait rounded-2xl overflow-hidden bg-navy-deep cursor-pointer">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy-deep" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl font-display text-white/10">
            {athlete.firstName[0]}
            {athlete.lastName[0]}
          </span>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-coral/80 flex items-center justify-center backdrop-blur-sm group-hover:bg-coral transition-colors group-hover:scale-110 duration-300">
            <svg
              className="w-7 h-7 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Top info */}
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <span className="bg-navy/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {athlete.flag} {athlete.firstName} {athlete.lastName}
          </span>
          {athlete.verified && (
            <span className="bg-coral/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-20">
          <div className="mb-2">
            <div className="text-white font-display text-xl leading-tight">
              {athlete.firstName} {athlete.lastName}
            </div>
            <div className="text-white/60 text-xs">
              {athlete.age}y/o &middot; {athlete.discipline}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center">
              <div className="text-coral text-xs font-bold">
                {athlete.ftpPerKg}
              </div>
              <div className="text-white/50 text-[9px] uppercase">W/kg</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center">
              <div className="text-coral text-xs font-bold">
                {athlete.compoundScore}
              </div>
              <div className="text-white/50 text-[9px] uppercase">W²/kg</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center">
              <div className="text-coral text-xs font-bold">
                {athlete.ftp}W
              </div>
              <div className="text-white/50 text-[9px] uppercase">FTP</div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
