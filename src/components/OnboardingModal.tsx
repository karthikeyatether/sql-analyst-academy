import React, { useEffect, useRef, useState } from "react";
import { Database, BookOpen, Zap, Target, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

interface OnboardingModalProps {
  roadmapLength: number;
  onClose: () => void;
}

export default function OnboardingModal({ roadmapLength, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const primaryBtn = modalRef.current?.querySelector(".onboard-nav-btn-next, .onboard-start-btn");
    (primaryBtn as HTMLElement)?.focus();
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        const focusables = modalRef.current?.querySelectorAll("button, [tabindex]");
        if (focusables && focusables.length > 0) {
          const first = focusables[0] as HTMLElement;
          const last = focusables[focusables.length - 1] as HTMLElement;
          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const steps = [
    {
      title: "Welcome to SQL Analyst Academy",
      subtitle: "Become an Interview-Ready Data Analyst",
      description: "Master modern database analytics using real business scenarios, interactive playgrounds, and milestone mock tests.",
      icon: <Database size={48} style={{ color: "var(--cyan)" }} />,
      bg: "rgba(56, 217, 255, 0.05)"
    },
    {
      title: `${roadmapLength}-Day Structured Learning Roadmap`,
      subtitle: "Guided Curriculum progression",
      description: "Take a step-by-step path from basic SELECT statements up to advanced Common Table Expressions (CTEs), Window Functions, and query optimization.",
      icon: <BookOpen size={48} style={{ color: "var(--violet)" }} />,
      bg: "rgba(155, 124, 255, 0.05)"
    },
    {
      title: "Interactive Workspace & Linter",
      subtitle: "Code like a Senior Analyst",
      description: "Use autocomplete code blocks, view live database schemas, read column distributions with our ERD explorer, and get real-time lint warnings as you type.",
      icon: <Zap size={48} style={{ color: "var(--amber)" }} />,
      bg: "rgba(255, 190, 61, 0.05)"
    },
    {
      title: "Milestone Mock Interviews",
      subtitle: "Test your skills against top companies",
      description: "Simulate timed analytics interviews modeled after tests at Cred, Swiggy, Paytm, and Myntra. Learn to write performant queries under pressure.",
      icon: <Target size={48} style={{ color: "var(--emerald)" }} />,
      bg: "rgba(48, 230, 149, 0.05)"
    },
    {
      title: "Local Database & Progress Backup",
      subtitle: "Your progress is safe with you",
      description: "All learning data is stored locally in your browser. Use the Backup & Restore JSON controls inside settings to save or restore your progress anytime.",
      icon: <RefreshCw size={48} style={{ color: "var(--cyan)" }} />,
      bg: "rgba(56, 217, 255, 0.05)"
    }
  ];

  const current = steps[step];

  return (
    <div className="custom-modal-overlay">
      <div
        className="custom-modal-window"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        style={{ maxWidth: "480px", padding: "24px" }}
      >
        <div className="custom-modal-body" style={{ textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}
          >
            Skip Tour
          </button>

          <div
            style={{
              display: "inline-flex",
              padding: "16px",
              background: current.bg,
              borderRadius: "50%",
              marginBottom: "20px",
              boxShadow: `0 0 20px ${current.bg}`,
            }}
          >
            {current.icon}
          </div>

          <h2 id="onboarding-title" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text)" }}>
            {current.title}
          </h2>
          <p style={{ fontSize: "12px", color: "var(--cyan)", fontWeight: "bold", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {current.subtitle}
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 24px 0", lineHeight: "1.6" }}>
            {current.description}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "24px" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? "24px" : "6px",
                  height: "6px",
                  background: i === step ? "var(--cyan)" : "var(--border)",
                  borderRadius: "3px",
                  transition: "all 0.3s ease"
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {step > 0 ? (
              <button
                className="secondary-button"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
                onClick={() => setStep(s => s - 1)}
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div style={{ width: "80px" }} />
            )}

            {step < steps.length - 1 ? (
              <button
                className="primary-button onboard-nav-btn-next"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
                onClick={() => setStep(s => s + 1)}
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="primary-button onboard-start-btn"
                style={{ fontSize: "12.5px", fontWeight: "bold" }}
                onClick={onClose}
              >
                Start Journey
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
