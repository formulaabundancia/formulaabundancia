import { MuscleGroup } from "@/lib/fitness-types";

/** Miniatura del ejercicio; si no hay imagen, muestra un icono de respaldo. */
export function FitnessExerciseThumb({
  image,
  name,
  muscleGroup,
  size = 48,
  className = "",
}: {
  image?: string;
  name: string;
  muscleGroup: MuscleGroup;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size };
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        loading="lazy"
        style={dimension}
        className={`flex-shrink-0 rounded-xl bg-white object-cover ring-1 ring-zinc-200 dark:ring-white/10 ${className}`}
      />
    );
  }
  return (
    <div
      style={dimension}
      className={`flex flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-white/10 ${className}`}
      aria-label={muscleGroup}
    >
      🏋️
    </div>
  );
}
