// ─── ProgressBar.tsx ──────────────────────────────────────────────────────────
// Mandate progress bar shown at the top of the MetricsPanel.

import React from "react";

interface ProgressBarProps {
  quarter: number;
  total: number;
  progress: number; // 0–100
}

export function ProgressBar({ quarter, total, progress }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(28,20,9,0.32)" }}>
          Mandate Progress
        </span>
        <span style={{ fontFamily: "'Fraunces'", fontSize: 15, color: "#1c1409", letterSpacing: "0.01em" }}>
          Q{quarter}{" "}
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "rgba(28,20,9,0.3)" }}>
            / Q{total}
          </span>
        </span>
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: 3, background: "rgba(28,20,9,0.08)", overflow: "hidden" }}>
        {/* Fill */}
        <div
          style={{
            position: "absolute", inset: 0,
            width: `${progress}%`,
            background: "#bf3509",
            transition: "width 0.7s cubic-bezier(.22,.72,0,1)",
          }}
        />
        {/* Quarter tick marks */}
        {Array.from({ length: total - 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute", top: 0, bottom: 0, width: 1,
              background: "rgba(28,20,9,0.1)",
              left: `${((i + 1) / total) * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}