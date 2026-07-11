"use client";

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

function startOfWeek(d: Date): Date {
  const day = (d.getDay() + 6) % 7; // lunes = 0
  const out = new Date(d);
  out.setDate(d.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function WeekStrip({ inverted = false }: { inverted?: boolean }) {
  const today = new Date();
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="flex justify-between gap-1">
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={`text-[11px] font-medium ${inverted ? "text-white/50" : "text-zinc-400 dark:text-zinc-500"}`}>
              {DAY_LETTERS[i]}
            </span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                isToday
                  ? inverted
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : inverted
                    ? "text-white/80"
                    : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {d.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
