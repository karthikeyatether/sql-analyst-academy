import React, { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRightLeft, Info } from "lucide-react";
import { QueryResult } from "../utils/sqlEngine";

interface SqlResultDiffViewerProps {
  userResult: QueryResult;
  expectedResult: QueryResult;
}

export const SqlResultDiffViewer: React.FC<SqlResultDiffViewerProps> = ({
  userResult,
  expectedResult,
}) => {
  const diffAnalysis = useMemo(() => {
    if (userResult.error) {
      return {
        status: "error",
        matchPercentage: 0,
        message: "Your query produced an execution error.",
        matchedRows: 0,
        totalExpected: expectedResult.rows.length,
      };
    }

    const userCols = userResult.columns.map((c) => c.toLowerCase());
    const expCols = expectedResult.columns.map((c) => c.toLowerCase());

    const missingCols = expCols.filter((c) => !userCols.includes(c));
    const extraCols = userCols.filter((c) => !expCols.includes(c));

    const stringifyRow = (row: Record<string, unknown>, cols: string[]) => {
      return cols.map((c) => String(row[c] ?? "NULL").trim().toLowerCase()).join(" | ");
    };

    const userRowStrings = userResult.rows.map((r) => stringifyRow(r, userResult.columns));
    const expRowStrings = expectedResult.rows.map((r) => stringifyRow(r, expectedResult.columns));

    let matchedCount = 0;
    const missingRows: Record<string, unknown>[] = [];
    const extraRows: Record<string, unknown>[] = [];

    expectedResult.rows.forEach((expRow, idx) => {
      const str = expRowStrings[idx];
      if (userRowStrings.includes(str)) {
        matchedCount++;
      } else {
        missingRows.push(expRow);
      }
    });

    userResult.rows.forEach((userRow, idx) => {
      const str = userRowStrings[idx];
      if (!expRowStrings.includes(str)) {
        extraRows.push(userRow);
      }
    });

    const totalExp = Math.max(1, expectedResult.rows.length);
    const pct = Math.round((matchedCount / totalExp) * 100);

    return {
      status: pct === 100 && missingCols.length === 0 ? "exact_match" : "divergent",
      matchPercentage: pct,
      missingCols,
      extraCols,
      matchedCount,
      missingRows,
      extraRows,
      totalExpected: expectedResult.rows.length,
      totalUser: userResult.rows.length,
    };
  }, [userResult, expectedResult]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        padding: "16px",
        background: "var(--panel)",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        overflowY: "auto",
      }}
    >
      {/* Diff Overview Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background:
            diffAnalysis.status === "exact_match"
              ? "color-mix(in srgb, var(--emerald) 10%, var(--panel2))"
              : "color-mix(in srgb, var(--amber) 10%, var(--panel2))",
          border:
            diffAnalysis.status === "exact_match"
              ? "1px solid color-mix(in srgb, var(--emerald) 30%, transparent)"
              : "1px solid color-mix(in srgb, var(--amber) 30%, transparent)",
          borderRadius: "8px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {diffAnalysis.status === "exact_match" ? (
            <CheckCircle2 size={20} style={{ color: "var(--emerald)" }} />
          ) : (
            <AlertTriangle size={20} style={{ color: "var(--amber)" }} />
          )}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text)" }}>
              {diffAnalysis.status === "exact_match"
                ? "Perfect Output Match (100%)"
                : `Result Divergence (${diffAnalysis.matchPercentage}% Row Match)`}
            </div>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              Your output: {diffAnalysis.totalUser} rows · Target output:{" "}
              {diffAnalysis.totalExpected} rows
            </span>
          </div>
        </div>

        {/* Match Percentage Pill */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color:
              diffAnalysis.matchPercentage === 100
                ? "var(--emerald)"
                : diffAnalysis.matchPercentage > 50
                  ? "var(--amber)"
                  : "var(--rose)",
            background: "var(--bg)",
            padding: "4px 12px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
          }}
        >
          {diffAnalysis.matchPercentage}% Match
        </div>
      </div>

      {/* Column Divergence Alerts */}
      {((diffAnalysis.missingCols?.length ?? 0) > 0 || (diffAnalysis.extraCols?.length ?? 0) > 0) && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--panel2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            fontSize: "11.5px",
            lineHeight: 1.5,
          }}
        >
          {(diffAnalysis.missingCols?.length ?? 0) > 0 && (
            <div style={{ color: "var(--rose)", marginBottom: "4px" }}>
              ⚠️ Missing Expected Columns: <strong>{diffAnalysis.missingCols?.join(", ")}</strong>
            </div>
          )}
          {(diffAnalysis.extraCols?.length ?? 0) > 0 && (
            <div style={{ color: "var(--amber)" }}>
              ℹ️ Extra Unrequested Columns: <strong>{diffAnalysis.extraCols?.join(", ")}</strong>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Comparison Tables */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Your Result Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: "var(--bg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              background: "var(--panel2)",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--cyan)",
            }}
          >
            YOUR RESULT ({userResult.rows.length} Rows)
          </div>
          <div style={{ flex: 1, overflow: "auto", maxHeight: "300px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "var(--panel)" }}>
                  {userResult.columns.map((c) => (
                    <th
                      key={c}
                      style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        color: "var(--muted)",
                        fontWeight: 700,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userResult.rows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                    {userResult.columns.map((c) => (
                      <td key={c} style={{ padding: "6px 10px", color: "var(--text)" }}>
                        {String(row[c] ?? "NULL")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expected Target Result Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            background: "var(--bg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              background: "var(--panel2)",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--emerald)",
            }}
          >
            EXPECTED TARGET ({expectedResult.rows.length} Rows)
          </div>
          <div style={{ flex: 1, overflow: "auto", maxHeight: "300px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "var(--panel)" }}>
                  {expectedResult.columns.map((c) => (
                    <th
                      key={c}
                      style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        color: "var(--muted)",
                        fontWeight: 700,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expectedResult.rows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                    {expectedResult.columns.map((c) => (
                      <td key={c} style={{ padding: "6px 10px", color: "var(--text)" }}>
                        {String(row[c] ?? "NULL")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlResultDiffViewer;
