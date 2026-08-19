"use client";

import { getCompoundScoreLabel, getCompoundScoreColor } from "@/data/athletes";

interface CompoundScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Compound Score ring visualization
 * Score is in W²/kg — normalized to a 0-1 fill against a max of ~3200 W²/kg
 * (the approximate threshold for elite U23 podium finishes)
 */
export default function CompoundScore({
  score,
  size = "md",
}: CompoundScoreProps) {
  const color = getCompoundScoreColor(score);
  const label = getCompoundScoreLabel(score);

  const sizes = {
    sm: { ring: 48, stroke: 4, text: "text-[10px]", label: "text-[8px]" },
    md: { ring: 72, stroke: 5, text: "text-sm", label: "text-[10px]" },
    lg: { ring: 100, stroke: 6, text: "text-xl", label: "text-xs" },
  };

  const s = sizes[size];
  const radius = (s.ring - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Normalize against ~3200 W²/kg (elite U23 threshold)
  const fillPct = Math.min(score / 3200, 1);
  const offset = circumference - fillPct * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s.ring, height: s.ring }}>
        <svg
          width={s.ring}
          height={s.ring}
          className="-rotate-90"
          viewBox={`0 0 ${s.ring} ${s.ring}`}
        >
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke="#e5ddd3"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              animation: "power-ring 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${s.text} font-bold`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className={`${s.label} font-medium text-earth uppercase tracking-wider`}>
        {label}
      </span>
    </div>
  );
}
