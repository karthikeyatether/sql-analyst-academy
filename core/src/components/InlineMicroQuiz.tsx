import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface InlineMicroQuizProps {
  question: string;
  options: Option[];
}

export default function InlineMicroQuiz({ question, options }: InlineMicroQuizProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
        border: "1px solid rgba(147, 51, 234, 0.25)",
        borderRadius: "12px",
        padding: "18px 20px",
        margin: "24px 0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            background: "rgba(168, 85, 247, 0.15)",
            color: "var(--violet)",
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          <Sparkles size={12} /> 10-Second Retrieval Checkpoint
        </span>
      </div>

      <h4
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 14px 0",
          lineHeight: 1.5,
        }}
      >
        {question}
      </h4>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          let borderStyle = "1px solid rgba(255,255,255,0.08)";
          let bgStyle = "rgba(255,255,255,0.02)";
          let textColor = "var(--text-secondary)";

          if (submitted) {
            if (opt.isCorrect) {
              borderStyle = "1px solid rgba(52, 211, 153, 0.4)";
              bgStyle = "rgba(52, 211, 153, 0.1)";
              textColor = "#34d399";
            } else if (isSelected) {
              borderStyle = "1px solid rgba(244, 63, 94, 0.4)";
              bgStyle = "rgba(244, 63, 94, 0.1)";
              textColor = "#f43f5e";
            }
          } else if (isSelected) {
            borderStyle = "1px solid var(--violet)";
            bgStyle = "rgba(168, 85, 247, 0.12)";
            textColor = "var(--text)";
          }

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (!submitted) setSelectedId(opt.id);
              }}
              disabled={submitted}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: borderStyle,
                background: bgStyle,
                color: textColor,
                fontSize: "12px",
                fontWeight: isSelected ? 600 : 400,
                textAlign: "left",
                cursor: submitted ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: isSelected ? "none" : "1.5px solid var(--muted)",
                  background: isSelected
                    ? submitted
                      ? opt.isCorrect
                        ? "#34d399"
                        : "#f43f5e"
                      : "var(--violet)"
                    : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {submitted && opt.isCorrect && (
                  <CheckCircle2 size={12} style={{ color: "#000" }} />
                )}
                {submitted && isSelected && !opt.isCorrect && (
                  <XCircle size={12} style={{ color: "#fff" }} />
                )}
              </span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={() => {
            if (selectedId) setSubmitted(true);
          }}
          disabled={!selectedId}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            background: selectedId ? "var(--violet)" : "rgba(255,255,255,0.05)",
            color: selectedId ? "#fff" : "var(--muted)",
            fontWeight: 700,
            fontSize: "11px",
            border: "none",
            cursor: selectedId ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
          }}
        >
          Check Answer
        </button>
      ) : (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            background: selectedOption?.isCorrect
              ? "rgba(52, 211, 153, 0.08)"
              : "rgba(244, 63, 94, 0.08)",
            border: selectedOption?.isCorrect
              ? "1px solid rgba(52, 211, 153, 0.2)"
              : "1px solid rgba(244, 63, 94, 0.2)",
            fontSize: "12px",
            color: selectedOption?.isCorrect ? "#34d399" : "#f43f5e",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {selectedOption?.isCorrect ? (
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={15} style={{ flexShrink: 0 }} />
          )}
          <span>{selectedOption?.explanation}</span>
        </div>
      )}
    </div>
  );
}
