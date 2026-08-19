import type { Athlete } from "@/data/athletes";

interface PowerStatsProps {
  athlete: Athlete;
  compact?: boolean;
}

export default function PowerStats({ athlete, compact = false }: PowerStatsProps) {
  const stats = compact
    ? [
        { label: "FTP", value: `${athlete.ftp}W`, sub: `${athlete.ftpPerKg} W/kg` },
        { label: "5min", value: `${athlete.fiveMinPower}W` },
        { label: "Sprint", value: `${athlete.maxPower}W` },
      ]
    : [
        { label: "FTP", value: `${athlete.ftp}W`, sub: `${athlete.ftpPerKg} W/kg` },
        { label: "20min Power", value: `${athlete.twentyMinPower}W` },
        { label: "5min Power", value: `${athlete.fiveMinPower}W` },
        { label: "Max Sprint", value: `${athlete.maxPower}W` },
        { label: "VO2max", value: athlete.vo2max ? `${athlete.vo2max}` : "—" },
        { label: "Weight", value: `${athlete.weight}kg` },
      ];

  return (
    <div
      className={`grid ${
        compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
      } gap-3`}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-cream-warm rounded-xl p-3 text-center"
        >
          <div className="text-[11px] uppercase tracking-wider text-earth font-medium mb-1">
            {stat.label}
          </div>
          <div className="text-navy font-bold text-lg">{stat.value}</div>
          {stat.sub && (
            <div className="text-xs text-coral font-semibold">{stat.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
