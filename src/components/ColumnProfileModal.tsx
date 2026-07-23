import React from "react";
import { BarChart2 as BarChart3, X } from "lucide-react";

export interface ColumnProfileData {
  table: string;
  column: string;
  total: number;
  distinct: number;
  nulls: number;
  min?: unknown;
  max?: unknown;
  avg?: unknown;
  topValues?: { val: unknown; count: number }[];
}

interface ColumnProfileModalProps {
  profile: ColumnProfileData;
  onClose: () => void;
}

export default function ColumnProfileModal({ profile, onClose }: ColumnProfileModalProps) {
  const { table: tableName, column: columnName, total, distinct, nulls, min, max, avg, topValues } = profile;

  React.useEffect(() => {
    const modalElement = document.getElementById("col-profile-dialog");
    if (!modalElement) return;

    // Focus the modal itself or the first focusable element
    const focusable = modalElement.querySelectorAll('button, [tabindex="0"]');
    if (focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab" && focusable.length > 0) {
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div 
        id="col-profile-dialog"
        className="custom-modal-window" 
        style={{ maxWidth: '450px' }} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="col-profile-title"
      >
        <div className="custom-modal-header">
          <h2 id="col-profile-title">
            <BarChart3 size={18} />
            <span>Column Profiler: {tableName}.{columnName}</span>
          </h2>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="custom-modal-body">
          <div className="linter-advisor-wrap">
            <div className="profile-grid-container">
              <div className="profile-stat-box">
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Records</span>
                <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{total}</strong>
              </div>
              <div className="profile-stat-box">
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Null Values</span>
                <strong style={{ fontSize: '16px', color: nulls > 0 ? 'var(--amber)' : 'var(--emerald)' }}>{nulls}</strong>
              </div>
              <div className="profile-stat-box">
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Unique Values</span>
                <strong style={{ fontSize: '16px', color: 'var(--cyan)' }}>{distinct}</strong>
              </div>
              {min !== undefined && min !== null && (
                <div className="profile-stat-box">
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Min Value</span>
                  <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{String(min)}</strong>
                </div>
              )}
              {max !== undefined && max !== null && (
                <div className="profile-stat-box">
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Max Value</span>
                  <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{String(max)}</strong>
                </div>
              )}
              {avg !== undefined && avg !== null && (
                <div className="profile-stat-box">
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Avg Value</span>
                  <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{typeof avg === 'number' ? avg.toFixed(2) : String(avg)}</strong>
                </div>
              )}
            </div>

            {topValues && topValues.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>Most Frequent Values</span>
                <div className="frequent-value-stream">
                  {topValues.map((item, idx) => {
                    const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={idx} className="frequent-value-row">
                        <div className="frequent-value-info">
                          <span>{String(item.val ?? 'NULL')}</span>
                          <span style={{ color: 'var(--muted)' }}>{item.count} ({pct}%)</span>
                        </div>
                        <div className="frequent-value-track">
                          <div className="frequent-value-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="custom-modal-footer">
          <button className="primary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
