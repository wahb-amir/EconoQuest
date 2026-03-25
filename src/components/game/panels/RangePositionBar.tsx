// ─── RangePositionBar.tsx ─────────────────────────────────────────────────────
// Segmented range bar shown in the "Ranges" tab of EduDrawer.

import React from "react";
import type { MetricEdu } from "./types";

interface RangePositionBarProps {
  edu: MetricEdu;
  value: number;
}

export function RangePositionBar({ edu, value }: RangePositionBarProps) {
  const span = edu.valueMax - edu.valueMin;
  const pct = Math.max(0, Math.min(100, ((value - edu.valueMin) / span) * 100));
  const activeRange = edu.healthRanges.find((r) => value >= r.min && value <= r.max);
  const activeColor = activeRange?.color ?? "#bf3509";

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Label row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(242,235,224,0.22)" }}>
          Current position
        </span>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "rgba(242,235,224,0.5)" }}>
          {activeRange?.label ?? "—"}
        </span>
      </div>

      {/* Coloured segment track */}
      <div style={{ display: "flex", height: 18, gap: 2, marginBottom: 8, borderRadius: 2, overflow: "hidden" }}>
        {edu.healthRanges.map((r, i) => {
          const w = ((r.max - r.min) / span) * 100;
          const isActive = value >= r.min && value <= r.max;
          return (
            <div
              key={i}
              style={{
                flexBasis: `${w}%`,
                flexShrink: 0,
                flexGrow: 0,
                background: isActive ? r.color + "30" : r.color + "12",
                borderTop: `2px solid ${isActive ? r.color : r.color + "44"}`,
                position: "relative",
                transition: "background 0.3s",
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", inset: 0, background: r.color + "14" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Needle bar */}
      <div style={{ position: "relative", height: 4, background: "rgba(242,235,224,0.06)", borderRadius: 2 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${activeColor}, transparent)`,
            borderRadius: 2,
            transition: "width 0.6s cubic-bezier(.22,.72,0,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${pct}%`,
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#f2ebe0",
            boxShadow: "0 0 8px rgba(255,255,255,0.4)",
            transition: "left 0.6s cubic-bezier(.22,.72,0,1)",
          }}
        />
      </div>

      {/* Bucket labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {edu.healthRanges.map((r, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 7,
              color: value >= r.min && value <= r.max ? r.color : "rgba(242,235,224,0.18)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}