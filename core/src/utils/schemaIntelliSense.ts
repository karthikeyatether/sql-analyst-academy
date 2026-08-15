import type { TableSchema } from "../data/datasets";
import type * as Monaco from "monaco-editor";

/**
 * Registers dynamic schema-aware autocompletions for Monaco Editor
 */
export function registerSchemaCompletions(
  monacoInstance: typeof Monaco,
  tables: TableSchema[],
): Monaco.IDisposable {
  return monacoInstance.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", ".", "(", ",", "\n"],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const lineContent = model.getLineContent(position.lineNumber);
      const textBefore = lineContent.slice(0, position.column - 1);

      const suggestions: Monaco.languages.CompletionItem[] = [];

      // Check if typing after table prefix (e.g. "customers.")
      const tableMatch = textBefore.match(/([a-zA-Z0-9_]+)\.$/);
      if (tableMatch) {
        const tableName = tableMatch[1].toLowerCase();
        const foundTable = tables.find(
          (t) => t.name.toLowerCase() === tableName,
        );
        if (foundTable) {
          foundTable.columns.forEach((col) => {
            suggestions.push({
              label: col.name,
              kind: monacoInstance.languages.CompletionItemKind.Field,
              detail: `${col.type} (${col.note || foundTable.name})`,
              insertText: col.name,
              range,
            });
          });
          return { suggestions };
        }
      }

      // Add Table Name suggestions
      tables.forEach((tbl) => {
        suggestions.push({
          label: tbl.name,
          kind: monacoInstance.languages.CompletionItemKind.Class,
          detail: `Table (${tbl.columns.length} columns) - ${tbl.domain}`,
          documentation: `Primary Key: ${tbl.primaryKey}\nColumns: ${tbl.columns.map((c) => c.name).join(", ")}`,
          insertText: tbl.name,
          range,
        });

        // Also suggest columns
        tbl.columns.forEach((col) => {
          suggestions.push({
            label: col.name,
            kind: monacoInstance.languages.CompletionItemKind.Field,
            detail: `${col.type} · ${tbl.name}`,
            insertText: col.name,
            range,
          });
        });
      });

      // Add common SQL query snippets
      suggestions.push(
        {
          label: "SELECT * FROM ...",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: "SELECT * FROM ${1:table} LIMIT ${2:10};",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Query all columns with limit",
          range,
        },
        {
          label: "CTE Query (WITH ... AS)",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText:
            "WITH ${1:cte_name} AS (\n  SELECT ${2:*}\n  FROM ${3:table}\n)\nSELECT *\nFROM ${1:cte_name};",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Common Table Expression structure",
          range,
        },
        {
          label: "WINDOW FUNCTION (OVER PARTITION BY)",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText:
            "${1:ROW_NUMBER()} OVER (\n  PARTITION BY ${2:group_col}\n  ORDER BY ${3:order_col} DESC\n) AS ${4:rank_val}",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Window function with partition and order",
          range,
        },
      );

      return { suggestions };
    },
  });
}
