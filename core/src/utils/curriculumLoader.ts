import type { PracticeProblem } from "../data/curriculumMetadata";

/**
 * Dynamic async loader for curriculum module problems and lesson contents.
 * Split into on-demand chunks to minimize initial bundle footprint.
 */

const problemBatchCache = new Map<number, PracticeProblem[]>();

export async function loadAllProblems(): Promise<
  Record<number, PracticeProblem[]>
> {
  try {
    const [b1, b2, b3] = await Promise.all([
      import("../data/problems_batch1"),
      import("../data/problems_batch2"),
      import("../data/problems_batch3"),
    ]);

    const combined: Record<number, PracticeProblem[]> = {
      ...b1.problemsBatch1,
      ...b2.batch2Problems,
      ...b3.problemsBatch3,
    };

    Object.entries(combined).forEach(([modId, problems]) => {
      problemBatchCache.set(Number(modId), problems);
    });

    return combined;
  } catch (err) {
    console.error("Failed to load all problem batches:", err);
    return {};
  }
}

/**
 * Extracts a structural SQL signature stripping aliases, string/numeric literals,
 * and comments to identify near-duplicate query shapes across questions.
 */
export function extractStructuralSignature(sqlText: string): string {
  if (!sqlText) return "";

  // 1. Remove comments and string/numeric literals
  let clean = sqlText
    .replace(/(--[^\r\n]*)|(\/\*[\s\S]*?\*\/)/g, " ")
    .replace(/'[^']*'/g, "'LITERAL'")
    .replace(/\b\d+\b/g, "NUM");

  // 2. Remove AS column aliases, table alias prefixes, and normalize window rank functions
  clean = clean
    .replace(/\bAS\s+[a-z0-9_]+\b/gi, "")
    .replace(/\b[a-z0-9_]+\.([a-z0-9_]+)/gi, "$1")
    .replace(/\b(DENSE_RANK|RANK)\b/gi, "RANK_FUNC");

  // 3. Extract core SQL verbs & aggregate/join/window functions
  const verbs = Array.from(
    clean.matchAll(
      /\b(JOIN|LEFT|RIGHT|FULL|INNER|WHERE|GROUP|HAVING|ORDER|LIMIT|MIN|MAX|AVG|SUM|COUNT|ROW_NUMBER|RANK|DENSE_RANK|LEAD|LAG|NTILE|CASE|WHEN|COALESCE|NULLIF|UNION|WITH)\b/gi,
    ),
  ).map((m) => m[0].toUpperCase());

  // 4. Extract target table names
  const tables = Array.from(
    clean.matchAll(
      /\b(customers|orders|order_items|products|payments|employees|subscriptions|departments|food_orders)\b/gi,
    ),
  ).map((m) => m[0].toLowerCase());

  const uniqueTables = Array.from(new Set(tables)).sort().join("+");
  const coreTech = Array.from(
    new Set(
      verbs.filter(
        (v) => !["SELECT", "FROM", "WHERE", "COALESCE", "NULLIF"].includes(v),
      ),
    ),
  )
    .sort()
    .join("+");

  return `${uniqueTables}::${coreTech}`;
}

export interface DuplicateCluster<T> {
  signature: string;
  items: T[];
}

export function detectNearDuplicates<
  T extends {
    id: string;
    title: string;
    solution?: string;
    solutionQuery?: string;
  },
>(questions: T[]): Array<DuplicateCluster<T>> {
  const sigMap = new Map<string, T[]>();

  for (const q of questions) {
    const sol = q.solution || q.solutionQuery || "";
    const sig = extractStructuralSignature(sol);
    if (!sig) continue;

    if (!sigMap.has(sig)) {
      sigMap.set(sig, []);
    }
    sigMap.get(sig)!.push(q);
  }

  const clusters: Array<DuplicateCluster<T>> = [];
  sigMap.forEach((items, signature) => {
    if (items.length > 1) {
      clusters.push({ signature, items });
    }
  });

  return clusters;
}

/**
 * Permanent safeguard helper to ensure question lists and mock test candidate pools
 * never contain duplicate questions (matched by ID, title, or structural signature).
 */
export function deduplicateQuestions<
  T extends {
    id: string;
    title: string;
    solution?: string;
    solutionQuery?: string;
  },
>(questions: T[]): T[] {
  const seenIds = new Set<string>();
  const seenSigs = new Set<string>();
  const result: T[] = [];

  for (const q of questions) {
    const sol = q.solution || q.solutionQuery || "";
    const structSig = extractStructuralSignature(sol);
    const titleClean = q.title.trim().toLowerCase();
    const sig = `${titleClean}|${structSig}`;

    if (!seenIds.has(q.id) && !seenSigs.has(sig)) {
      seenIds.add(q.id);
      seenSigs.add(sig);
      result.push(q);
    }
  }

  return result;
}
