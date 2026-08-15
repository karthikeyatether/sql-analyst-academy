import type { PracticeProblem } from "./curriculum";
import { problemsBasic } from "./problemsBasic";
import { problemsIntermediate } from "./problemsIntermediate";
import { problemsAdvanced } from "./problemsAdvanced";

export { problemsBasic } from "./problemsBasic";
export { problemsIntermediate } from "./problemsIntermediate";
export { problemsAdvanced } from "./problemsAdvanced";

export const allPracticeProblems: Record<number, PracticeProblem[]> = {
  ...problemsBasic,
  ...problemsIntermediate,
  ...problemsAdvanced,
};
