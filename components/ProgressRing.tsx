"use client";

export function ProgressRing({
  value,
  total,
  size = 88,
  strokeWidth = 8,
  label,
  sublabel,
  inverted = false,
}: {
  value: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  inverted?: boolean;
}) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={inverted ? "text-white/25" : "text-zinc-200 dark:text-zinc-800"}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-700 ease-out ${inverted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-semibold ${inverted ? "text-white" : "text-zinc-800 dark:text-zinc-100"}`}
          style={{ fontSize: size < 56 ? 12 : size < 80 ? 15 : 18 }}
        >
          {label ?? `${value}/${total}`}
        </span>
        {sublabel && (
          <span className={`text-[10px] ${inverted ? "text-white/70" : "text-zinc-500 dark:text-zinc-400"}`}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
