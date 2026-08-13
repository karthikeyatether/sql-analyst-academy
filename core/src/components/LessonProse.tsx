import React from "react";

const SQL_KEYWORDS =
  /^\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT|INNER|WITH|INSERT|UPDATE|DELETE|CREATE|DROP|EXPLAIN|--)/i;
const BULLET_PREFIXES = /^\s*[-•✓✗→▸*]\s+/;
const HEADING_RE = /^[A-Z][A-Z0-9 _/:&-]{3,}:?\s*$|^[A-Z].{0,60}:$/;

export default function LessonProse({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let codeBuffer: string[] = [];
  let paraBuffer: string[] = [];

  function flushCode() {
    if (codeBuffer.length === 0) return;
    elements.push(
      <pre key={`code-${elements.length}`} className="lp-code">
        {codeBuffer.join("\n")}
      </pre>,
    );
    codeBuffer = [];
  }

  function flushPara() {
    if (paraBuffer.length === 0) return;
    const joined = paraBuffer.join(" ").trim();
    if (joined) {
      elements.push(<p key={`para-${elements.length}`}>{joined}</p>);
    }
    paraBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // blank line
    if (!trimmed) {
      flushCode();
      flushPara();
      continue;
    }

    // SQL code line
    if (SQL_KEYWORDS.test(trimmed) || trimmed.startsWith("`")) {
      flushPara();
      codeBuffer.push(raw.trimStart());
      continue;
    }

    // flush code if we're no longer in a SQL block
    flushCode();

    // bullet line
    if (BULLET_PREFIXES.test(raw)) {
      flushPara();
      const content = trimmed.replace(BULLET_PREFIXES, "");
      // Bold the part before first colon if any
      const colonIdx = content.indexOf(":");
      if (colonIdx > 0 && colonIdx < 50) {
        const label = content.slice(0, colonIdx);
        const rest = content.slice(colonIdx + 1);
        elements.push(
          <div key={`b-${elements.length}`} className="lp-bullet">
            <span>
              <strong>{label}</strong>
              {rest}
            </span>
          </div>,
        );
      } else {
        elements.push(
          <div key={`b-${elements.length}`} className="lp-bullet">
            {content}
          </div>,
        );
      }
      continue;
    }

    // heading-like line (short, all caps or ends with colon)
    if (HEADING_RE.test(trimmed) && trimmed.length < 80) {
      flushPara();
      elements.push(
        <div key={`h-${elements.length}`} className="lp-heading">
          {trimmed.replace(/:$/, "")}
        </div>,
      );
      continue;
    }

    // regular prose — accumulate into paragraph
    paraBuffer.push(trimmed);
  }

  flushCode();
  flushPara();

  return <div className="lesson-prose">{elements}</div>;
}
