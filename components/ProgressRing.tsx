"use client";

export function ProgressRing({
  value,
  total,
  size = 88,
  strokeWidth = 8,
  label,
  sublabel,
}: {
  value: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
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
          className="text-brand-100 dark:text-brand-900"
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
          className="text-brand-500 transition-all duration-700 ease-out dark:text-brand-400"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-semibold text-zinc-800 dark:text-zinc-100"
          style={{ fontSize: size < 56 ? 12 : size < 80 ? 15 : 18 }}
        >
          {label ?? `${value}/${total}`}
        </span>
        {sublabel && <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{sublabel}</span>}
      </div>
    </div>
  );
}
