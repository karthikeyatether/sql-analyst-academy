export type DatabaseRow = Record<string, string | number | boolean | null>;
export interface DatabaseResult {
  columns: string[];
  values: (string | number | boolean | null)[][];
}
