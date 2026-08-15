import React, { useState } from "react";
import SqlSyntaxTooltip from "./SqlSyntaxTooltip";
import HighlightedSqlQuery from "./HighlightedSqlQuery";
import {
  Check,
  Copy,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LessonProseProps {
  text: string;
  onRunCode?: (sql: string) => void;
  fontSize?: "normal" | "relaxed" | "large";
}

/**
 * Formats inline text: markdown bold, inline code with syntax tooltip, and italics.
 */
export function formatProseText(text: string): React.ReactNode {
  if (!text) return "";

  // Split into tokens: markdown bold (**text**), inline backticks (`code`), or text
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Handle **bold**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return <strong key={index} style={{ color: "var(--text)", fontWeight: 700 }}>{inner}</strong>;
    }

    // Handle `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      const isSqlKeyword = /^(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|LEFT\s+JOIN|INNER\s+JOIN|JOIN|WITH|CTE|COALESCE|NULLIF|OVER|PARTITION\s+BY|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|CASE|WHEN|THEN|ELSE|END|DISTINCT|COUNT|SUM|AVG|MIN|MAX|AND|OR|NOT|IN|BETWEEN|LIKE|IS\s+NULL|IS\s+NOT\s+NULL)$/i.test(inner.trim());

      if (isSqlKeyword) {
        return (
          <SqlSyntaxTooltip key={index} keyword={inner.toLowerCase().trim()}>
            <code
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--cyan)",
                background: "color-mix(in srgb, var(--cyan) 12%, transparent)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.9em",
                fontWeight: 600,
                cursor: "help",
              }}
            >
              {inner.toUpperCase()}
            </code>
          </SqlSyntaxTooltip>
        );
      }

      return (
        <code
          key={index}
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--amber)",
            background: "color-mix(in srgb, var(--amber) 10%, transparent)",
            padding: "2px 5px",
            borderRadius: "4px",
            fontSize: "0.9em",
          }}
        >
          {inner}
        </code>
      );
    }

    // Handle *italic*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={index} style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>{part.slice(1, -1)}</em>;
    }

    // Plain text: scan for standalone SQL keywords to add helpful hover tooltip
    const keywordRegex = /\b(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|LEFT\s+JOIN|INNER\s+JOIN|\bJOIN\b|WITH|CTE|COALESCE|NULLIF|OVER|PARTITION\s+BY|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|CASE|WHEN|THEN|ELSE|END|DISTINCT|COUNT|SUM|AVG|MIN|MAX)\b/gi;
    const subParts = part.split(keywordRegex);

    if (subParts.length === 1) return part;

    return subParts.map((sub, sIdx) => {
      if (
        sub.match(
          /^(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|LEFT\s+JOIN|INNER\s+JOIN|JOIN|WITH|CTE|COALESCE|NULLIF|OVER|PARTITION\s+BY|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|CASE|WHEN|THEN|ELSE|END|DISTINCT|COUNT|SUM|AVG|MIN|MAX)$/i
        )
      ) {
        return (
          <SqlSyntaxTooltip key={`${index}-${sIdx}`} keyword={sub.toLowerCase().trim()}>
            <span style={{ color: "var(--cyan)", fontWeight: 600, cursor: "help" }}>
              {sub.toUpperCase()}
            </span>
          </SqlSyntaxTooltip>
        );
      }
      return sub;
    });
  });
}

function CleanSqlSnippetBlock({ codeText }: { codeText: string }) {
  const [copied, setCopied] = useState(false);

  // Normalize code: strip excess blank lines
  const cleanCode = codeText
    .replace(/\r\n/g, "\n")
    .replace(/^\s*\n+/g, "")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="lp-code-wrapper"
      style={{
        position: "relative",
        margin: "18px 0",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        overflow: "hidden",
        background: "var(--bg-editor, #0d1117)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 14px",
          background: "var(--panel2, rgba(255,255,255,0.03))",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--text-muted, var(--muted))",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          SQL Syntax Example
        </span>

        <button
          onClick={handleCopy}
          style={{
            background: copied
              ? "color-mix(in srgb, var(--emerald) 15%, transparent)"
              : "color-mix(in srgb, var(--text) 5%, transparent)",
            border: `1px solid ${
              copied
                ? "color-mix(in srgb, var(--emerald) 30%, transparent)"
                : "var(--border)"
            }`,
            color: copied ? "var(--emerald)" : "var(--text-secondary)",
            borderRadius: "4px",
            padding: "3px 8px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.15s ease",
          }}
          title="Copy SQL example to clipboard"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <HighlightedSqlQuery code={cleanCode} />
    </div>
  );
}

function VisualDataDiagram({ lines }: { lines: string[] }) {
  // Normalize lines and trim outer blank rows
  const cleanLines = lines
    .filter((l, idx) => {
      if (idx === 0 || idx === lines.length - 1) return l.trim().length > 0;
      return true;
    });

  const content = cleanLines.join("\n");
  if (!content.trim()) return null;

  return (
    <div
      className="lp-visual-diagram-card"
      style={{
        margin: "18px 0",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        background: "var(--bg-editor, #0c1017)",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          background: "var(--panel2, rgba(255,255,255,0.03))",
          borderBottom: "1px solid var(--border)",
          fontSize: "11px",
          fontFamily: "var(--font-mono, monospace)",
          color: "var(--cyan)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span>Data Model & Visual Flow</span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px 18px",
          background: "transparent",
          fontFamily: "var(--font-mono, 'JetBrains Mono', Consolas, 'Courier New', monospace)",
          fontSize: "13px",
          lineHeight: "1.45",
          color: "var(--text)",
          overflowX: "auto",
          whiteSpace: "pre",
          letterSpacing: "0.01em",
        }}
      >
        <code>{content}</code>
      </pre>
    </div>
  );
}

function RenderMarkdownTable({ rows }: { rows: string[] }) {
  if (rows.length === 0) return null;

  const contentRows = rows.filter((r) => !/^\s*\|?\s*[-:]+[-| :]*\s*\|?\s*$/.test(r));
  if (contentRows.length === 0) return null;

  const parseRow = (line: string) => {
    const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return trimmed.split("|").map((c) => c.trim());
  };

  const headerCells = parseRow(contentRows[0]);
  const bodyRows = contentRows.slice(1).map(parseRow);

  return (
    <div
      style={{
        margin: "18px 0",
        overflowX: "auto",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        width: "100%",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
          textAlign: "left",
          background: "var(--panel)",
        }}
      >
        <thead>
          <tr style={{ background: "var(--panel2, rgba(255,255,255,0.03))", borderBottom: "1px solid var(--border)" }}>
            {headerCells.map((cell, idx) => (
              <th
                key={idx}
                style={{
                  padding: "10px 14px",
                  fontWeight: 700,
                  color: "var(--cyan)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontSize: "11px",
                }}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((r, rIdx) => (
            <tr
              key={rIdx}
              style={{
                borderBottom: rIdx < bodyRows.length - 1 ? "1px solid var(--border)" : "none",
                background: rIdx % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
              }}
            >
              {r.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    padding: "8px 14px",
                    color: "var(--text-secondary)",
                    fontFamily: cell.includes("'") || /^\d+$/.test(cell) ? "var(--font-mono, monospace)" : "inherit",
                    fontSize: "12.5px",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CheckpointCard({
  question,
  answer,
  explanation,
}: {
  question: string;
  answer?: string;
  explanation?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const displayAnswer = answer || explanation;

  return (
    <div
      className="lp-callout"
      style={{
        margin: "16px 0",
        padding: "14px 16px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <HelpCircle size={18} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: "2px" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>
            Quick Check
          </div>
          <p style={{ margin: "4px 0 8px 0", fontSize: "13.5px", color: "var(--text-secondary)" }}>
            {formatProseText(question)}
          </p>
          {displayAnswer && (
            <div>
              <button
                onClick={() => setRevealed(!revealed)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: "var(--cyan)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {revealed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {revealed ? "Hide Answer" : "Reveal Answer"}
              </button>
              {revealed && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "var(--emerald)",
                  }}
                >
                  {formatProseText(displayAnswer)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SqlExecutionPipelineWidget() {
  const steps = [
    { num: 1, name: "FROM / JOIN", desc: "Locate & assemble tables" },
    { num: 2, name: "WHERE", desc: "Filter individual rows" },
    { num: 3, name: "GROUP BY", desc: "Aggregate rows into groups" },
    { num: 4, name: "HAVING", desc: "Filter aggregated groups" },
    { num: 5, name: "SELECT", desc: "Project columns & calculations" },
    { num: 6, name: "DISTINCT", desc: "Deduplicate output rows" },
    { num: 7, name: "ORDER BY", desc: "Sort the output result" },
    { num: 8, name: "LIMIT", desc: "Restrict output row count" },
  ];

  return (
    <div
      style={{
        margin: "18px 0",
        padding: "16px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--cyan)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "12px",
        }}
      >
        SQL Logical Execution Order
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
        }}
      >
        {steps.map((s) => (
          <div
            key={s.num}
            style={{
              padding: "8px 10px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 800 }}>
              #{s.num} {s.name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to determine if a line belongs to a SQL statement
function isSqlLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return (
    /^(SELECT|WITH|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|INNER\s+JOIN|\[INNER\]\s+JOIN|ON|AND|OR|UNION|CREATE|INSERT|UPDATE|DELETE|SET|VALUES|CASE|WHEN|THEN|ELSE|END|--|\/\*|\*\/)/i.test(
      trimmed
    ) ||
    /;\s*$/.test(trimmed) ||
    /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/.test(trimmed)
  );
}

// Helper to determine if a line is part of a box/ASCII visual diagram or table
function isDiagramLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Unicode box drawing characters
  if (/[│┌└├┬┴┼─═║╔╗╚╝]/.test(trimmed)) return true;
  // Multiple pipe characters (>= 2)
  const pipeCount = (trimmed.match(/\|/g) || []).length;
  if (pipeCount >= 2) return true;
  // Side by side table headers or diagram notes
  if (/^[a-zA-Z0-9_]+:\s+[a-zA-Z0-9_]+:/.test(trimmed)) return true;
  if (/^\(no\s+orders/i.test(trimmed)) return true;
  if (/^[A-Za-z0-9_\s]+(?:table|data|flow|scan|structure)\s*:/i.test(trimmed) && trimmed.length < 40) return true;
  return false;
}

export default function LessonProse({
  text,
  fontSize = "normal",
}: LessonProseProps) {
  if (!text) return null;

  const rawLines = text.split(/\r?\n/);
  const elements: JSX.Element[] = [];

  let codeBuffer: string[] = [];
  let tableBuffer: string[] = [];
  let diagramBuffer: string[] = [];
  let listBuffer: { type: "ol" | "ul"; items: string[] } | null = null;
  let inCodeFence = false;

  function flushCode() {
    if (codeBuffer.length === 0) return;
    const codeText = codeBuffer.join("\n").trim();
    if (codeText) {
      elements.push(
        <CleanSqlSnippetBlock
          key={`code-block-${elements.length}`}
          codeText={codeText}
        />
      );
    }
    codeBuffer = [];
  }

  function flushDiagram() {
    if (diagramBuffer.length === 0) return;
    elements.push(
      <VisualDataDiagram
        key={`diagram-${elements.length}`}
        lines={[...diagramBuffer]}
      />
    );
    diagramBuffer = [];
  }

  function flushTable() {
    if (tableBuffer.length === 0) return;
    elements.push(
      <RenderMarkdownTable
        key={`table-${elements.length}`}
        rows={[...tableBuffer]}
      />
    );
    tableBuffer = [];
  }

  function flushList() {
    if (!listBuffer || listBuffer.items.length === 0) {
      listBuffer = null;
      return;
    }
    const { type, items } = listBuffer;
    if (type === "ol") {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          style={{
            margin: "12px 0 16px 20px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            color: "var(--text-secondary)",
            fontSize: fontSize === "large" ? "15.5px" : fontSize === "relaxed" ? "14.5px" : "14px",
            lineHeight: "1.7",
          }}
        >
          {items.map((it, idx) => (
            <li key={idx} style={{ paddingLeft: "4px" }}>
              {formatProseText(it)}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          style={{
            margin: "12px 0 16px 20px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            color: "var(--text-secondary)",
            fontSize: fontSize === "large" ? "15.5px" : fontSize === "relaxed" ? "14.5px" : "14px",
            lineHeight: "1.7",
          }}
        >
          {items.map((it, idx) => (
            <li key={idx} style={{ paddingLeft: "4px" }}>
              {formatProseText(it)}
            </li>
          ))}
        </ul>
      );
    }
    listBuffer = null;
  }

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const trimmed = raw.trim();

    // 1. Triple backtick code fences
    if (trimmed.startsWith("```")) {
      if (inCodeFence) {
        inCodeFence = false;
        flushCode();
      } else {
        flushTable();
        flushDiagram();
        flushList();
        inCodeFence = true;
      }
      continue;
    }

    if (inCodeFence) {
      codeBuffer.push(raw);
      continue;
    }

    // 2. Visual Diagram & Box Table Detection
    if (isDiagramLine(trimmed)) {
      flushCode();
      flushTable();
      flushList();
      diagramBuffer.push(raw);
      continue;
    } else if (diagramBuffer.length > 0) {
      // Check if next non-empty line is also diagram
      let nextIsDiagram = false;
      for (let j = i + 1; j < rawLines.length; j++) {
        const nextTrim = rawLines[j].trim();
        if (!nextTrim) continue;
        if (isDiagramLine(nextTrim)) {
          nextIsDiagram = true;
        }
        break;
      }
      if (nextIsDiagram && !trimmed) {
        diagramBuffer.push(raw);
        continue;
      } else {
        flushDiagram();
      }
    }

    // 3. Markdown Table Detection (| Col 1 | Col 2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|")) {
      flushCode();
      flushDiagram();
      flushList();
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    // 4. Numbered list item: "1. text" or "2. text"
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      flushCode();
      flushDiagram();
      flushTable();
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(numListMatch[2]);
      continue;
    }

    // 5. Unordered list item: "- text", "* text", "• text"
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      flushCode();
      flushDiagram();
      flushTable();
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(bulletMatch[1]);
      continue;
    }

    // If we were in a list and hit normal text, flush the list
    flushList();

    // 6. Blank lines
    if (!trimmed) {
      // If we are accumulating a SQL statement, check if the NEXT line is also SQL
      if (codeBuffer.length > 0) {
        let nextIsSql = false;
        for (let j = i + 1; j < rawLines.length; j++) {
          const nextTrim = rawLines[j].trim();
          if (!nextTrim) continue;
          if (isSqlLine(nextTrim)) {
            nextIsSql = true;
          }
          break;
        }
        if (nextIsSql) {
          codeBuffer.push(raw);
          continue;
        } else {
          flushCode();
        }
      }
      flushTable();
      flushDiagram();
      flushList();
      continue;
    }

    // 7. SQL Execution Pipeline Widget trigger
    if (/order of execution|execution pipeline|how sql executes/i.test(trimmed) && trimmed.length < 50) {
      flushCode();
      flushDiagram();
      elements.push(<SqlExecutionPipelineWidget key={`pipeline-${elements.length}`} />);
      continue;
    }

    // 8. Admonitions & Callouts
    const tipMatch = trimmed.match(/^(?:💡\s*)?(?:Tip|Pro-Tip|Hint):\s*(.*)$/i);
    const warnMatch = trimmed.match(
      /^(?:⚠️\s*)?(?:Warning|Caution|Trap|Common Mistake):\s*(.*)$/i
    );
    const checkpointMatch = trimmed.match(
      /^(?:❓\s*)?(?:Check Your Understanding|Question|Quick Check):\s*(.*?)(?:\s*(?:Answer|Explanation):\s*(.*))?$/i
    );

    if (tipMatch) {
      flushCode();
      flushDiagram();
      elements.push(
        <div
          key={`tip-${elements.length}`}
          className="lp-callout tip"
          style={{
            margin: "16px 0",
            padding: "14px 18px",
            background: "color-mix(in srgb, var(--emerald) 8%, var(--panel))",
            border: "1px solid color-mix(in srgb, var(--emerald) 30%, transparent)",
            borderRadius: "8px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Lightbulb size={18} style={{ color: "var(--emerald)", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <strong style={{ color: "var(--emerald)", display: "block", marginBottom: "2px" }}>Pro Tip</strong>
            {formatProseText(tipMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    if (warnMatch) {
      flushCode();
      flushDiagram();
      elements.push(
        <div
          key={`warn-${elements.length}`}
          className="lp-callout warning"
          style={{
            margin: "16px 0",
            padding: "14px 18px",
            background: "color-mix(in srgb, var(--amber) 8%, var(--panel))",
            border: "1px solid color-mix(in srgb, var(--amber) 30%, transparent)",
            borderRadius: "8px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <AlertTriangle size={18} style={{ color: "var(--amber)", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <strong style={{ color: "var(--amber)", display: "block", marginBottom: "2px" }}>Common Trap & Pitfall</strong>
            {formatProseText(warnMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    if (checkpointMatch) {
      flushCode();
      flushDiagram();
      elements.push(
        <CheckpointCard
          key={`checkpoint-${elements.length}`}
          question={checkpointMatch[1]}
          explanation={checkpointMatch[2]}
        />
      );
      continue;
    }

    // 9. SQL Statement Detection & Accumulation
    const startsSql = /^(SELECT|WITH|CREATE\s+TABLE|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b/i.test(trimmed);
    if (startsSql) {
      flushCode();
      flushDiagram();
      codeBuffer.push(raw);
      continue;
    }

    // If currently accumulating SQL, check if this line is part of the SQL query
    if (codeBuffer.length > 0 && isSqlLine(trimmed)) {
      codeBuffer.push(raw);
      continue;
    } else {
      flushCode();
    }

    // 10. Standard prose paragraph
    elements.push(
      <p
        key={`p-${elements.length}`}
        style={{
          margin: "12px 0 16px 0",
          fontSize: fontSize === "large" ? "16px" : fontSize === "relaxed" ? "15px" : "14px",
          lineHeight: "1.75",
          color: "var(--text-secondary)",
          width: "100%",
        }}
      >
        {formatProseText(trimmed)}
      </p>
    );
  }

  flushCode();
  flushDiagram();
  flushTable();
  flushList();

  return (
    <div
      className="lesson-prose-container"
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0",
      }}
    >
      {elements}
    </div>
  );
}
