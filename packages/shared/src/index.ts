export const version = "0.0.0";

export function formatProblemId(id: number): string {
  return `LC${id.toString().padStart(4, "0")}`;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface TestCase {
  input: unknown;
  expected: unknown;
}

export interface ProblemMeta {
  id: number;
  slug?: string;
  title: string;
  url?: string;
  difficulty: Difficulty;
  tags: string[];
  description?: string;
  template?: string;
  testCases?: TestCase[];
  hints?: string[];
}

export interface ProblemClip {
  id: number;
  slug: string;
  title: string;
  url?: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  template?: string;
  testCases?: TestCase[];
  hints?: string[];
  clippedAt?: string;
}