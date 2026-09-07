import type { Difficulty } from "@leetcode/shared";

const styles: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}