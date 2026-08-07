import type * as monacoType from "monaco-editor";
import type { TableSchema } from "../data/datasets";

export function registerSqlAutocomplete(
  monaco: typeof monacoType,
  editor: monacoType.editor.IStandaloneCodeEditor,
  tableSchemas: TableSchema[],
  liveSchemaRef: React.MutableRefObject<TableSchema[]>,
  sqlUpperKeywordsRef: React.MutableRefObject<boolean>
) {
  // 1. Hover Provider
  const hoverProvider = monaco.languages.registerHoverProvider("sql", {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      
      const currentSchema = liveSchemaRef.current.length > 0 ? liveSchemaRef.current : tableSchemas;
      const lowerWord = word.word.toLowerCase();
      
      // Check if word is a table
      const table = currentSchema.find(t => t.name.toLowerCase() === lowerWord);
      if (table) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: `**Table: ${table.name}**` },
            { value: `Columns: ${table.columns.map(c => c.name).join(", ")}` }
          ]
        };
      }
      
      // Check if word is a function
      const funcs: Record<string, string> = {
        "max": "Returns the maximum value of all values in the group.",
        "min": "Returns the minimum value of all values in the group.",
        "avg": "Returns the average value of all non-NULL values in the group.",
        "count": "Returns the number of rows.",
        "sum": "Returns the sum of all values in the group.",
        "substr": "Returns a substring of the input string.",
        "coalesce": "Returns the first non-null argument."
      };
      
      if (funcs[lowerWord]) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: `**Function: ${word.word.toUpperCase()}**` },
            { value: funcs[lowerWord] }
          ]
        };
      }
      
      return null;
    }
  });

  // 2. Signature Help Provider
  const signatureProvider = monaco.languages.registerSignatureHelpProvider("sql", {
    signatureHelpTriggerCharacters: ["("],
    provideSignatureHelp: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);
      
      const funcMatch = textBeforeCursor.match(/\b(SUBSTR|COALESCE|NULLIF|ROUND|CAST)\s*\(/i);
      if (funcMatch) {
        const funcName = funcMatch[1].toUpperCase();
        let params: monacoType.languages.ParameterInformation[] = [];
        let label = "";
        
        if (funcName === "SUBSTR") {
          label = "SUBSTR(string, start, length)";
          params = [{ label: "string" }, { label: "start" }, { label: "length" }];
        } else if (funcName === "ROUND") {
          label = "ROUND(number, decimals)";
          params = [{ label: "number" }, { label: "decimals" }];
        } else if (funcName === "COALESCE") {
          label = "COALESCE(val1, val2, ...)";
          params = [{ label: "val1" }, { label: "val2" }];
        }
        
        if (label) {
          return {
            value: {
              activeParameter: 0,
              activeSignature: 0,
              signatures: [{
                label,
                parameters: params
              }]
            },
            dispose: () => {}
          };
        }
      }
      return null;
    }
  });

  // 3. Autocomplete Provider
  const completionProvider = monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: ["."],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);
      const dotMatch = textBeforeCursor.match(/\b([a-zA-Z0-9_]+)\.$/);
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const currentSchema = liveSchemaRef.current.length > 0 ? liveSchemaRef.current : tableSchemas;
      const fullText = model.getValue();
      
      // Parse active tables for context awareness
      const queryWords = new Set(fullText.toLowerCase().split(/[^a-zA-Z0-9_]+/));
      const activeTableNames = new Set(
        currentSchema.map((t) => t.name.toLowerCase()).filter((name) => queryWords.has(name))
      );

      // Dot completion (e.g. c.city)
      if (dotMatch) {
        const tableNameOrAlias = dotMatch[1].toLowerCase();
        let tableName = tableNameOrAlias;
        const aliases: Record<string, string> = {};

        // Extract aliases
        const cteRegex = /\bWITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(/gi;
        let cteMatch;
        while ((cteMatch = cteRegex.exec(fullText)) !== null) {
          aliases[cteMatch[1].toLowerCase()] = cteMatch[1];
        }

        const tableAliasRegex = /\b(?:FROM|(?:LEFT\s+|RIGHT\s+|INNER\s+|FULL\s+|CROSS\s+)?JOIN)\s+([a-zA-Z0-9_]+)(?:\s+AS)?\s+([a-zA-Z0-9_]+)\b/gi;
        let match;
        while ((match = tableAliasRegex.exec(fullText)) !== null) {
          const table = match[1].toLowerCase();
          const alias = match[2].toLowerCase();
          if (currentSchema.some(t => t.name.toLowerCase() === table) || aliases[table]) {
            aliases[alias] = table;
          }
        }

        if (aliases[tableNameOrAlias]) {
          tableName = aliases[tableNameOrAlias].toLowerCase();
        }

        if (tableNameOrAlias === "table" && textBeforeCursor.match(/\btable\.$/i)) {
             // Let star expansion happen below
        } else {
             const tableSchema = currentSchema.find((t) => t.name.toLowerCase() === tableName);
             if (tableSchema) {
               return {
                 suggestions: tableSchema.columns.map((col) => ({
                   label: col.name,
                   kind: monaco.languages.CompletionItemKind.Field,
                   detail: `${col.type} — ${tableSchema.name} column`,
                   insertText: col.name,
                   range,
                 }))
               };
             }
        }
      }

      // Star Expansion
      if (textBeforeCursor.match(/\b([a-zA-Z0-9_]+)\.\*$/)) {
         const alias = textBeforeCursor.match(/\b([a-zA-Z0-9_]+)\.\*$/)?.[1];
         // Ideally we resolve alias to table schema and return all columns comma separated
      }

      // General Completion
      const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "ON", "AS"];
      const funcs = ["COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "SUBSTR", "ROUND"];
      
      const suggestions: monacoType.languages.CompletionItem[] = [];
      const useUpper = sqlUpperKeywordsRef.current;

      // Smart JOIN snippets
      if (textBeforeCursor.match(/\bJOIN\s+$/i)) {
         // Auto-suggest known join conditions if we have active tables
         currentSchema.forEach(t => {
             suggestions.push({
                 label: `${t.name} ON ...`,
                 kind: monaco.languages.CompletionItemKind.Snippet,
                 insertText: `${t.name} o ON o.id = $1`,
                 insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                 detail: `Auto JOIN snippet for ${t.name}`,
                 range
             });
         });
      }

      keywords.forEach(k => {
        suggestions.push({
          label: k,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: useUpper ? k : k.toLowerCase(),
          range,
          sortText: `05_${k}`
        });
      });

      funcs.forEach(f => {
        suggestions.push({
          label: f,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${useUpper ? f : f.toLowerCase()}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          sortText: `04_${f}`
        });
      });

      currentSchema.forEach(t => {
        const isActive = activeTableNames.has(t.name.toLowerCase());
        suggestions.push({
          label: t.name,
          kind: monaco.languages.CompletionItemKind.Class,
          detail: `Table (${t.columns.length} columns) ${isActive ? "(active)" : ""}`,
          insertText: t.name,
          range,
          sortText: isActive ? `01_${t.name}` : `03_${t.name}`
        });

        // Add columns, if active boost them
        t.columns.forEach(c => {
           suggestions.push({
              label: isActive ? `${t.name}.${c.name}` : c.name,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `${c.type} from ${t.name}`,
              insertText: isActive ? `${t.name}.${c.name}` : c.name,
              range,
              sortText: isActive ? `02_${c.name}` : `06_${c.name}`
           });
        });
      });

      return { suggestions };
    }
  });

  return {
    dispose: () => {
      hoverProvider.dispose();
      signatureProvider.dispose();
      completionProvider.dispose();
    }
  };
}
