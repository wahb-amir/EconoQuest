// ─── TrendRow.tsx ─────────────────────────────────────────────────────────────
// Compact row used in the "Quarter Trends" section below the main card grid.

import React, { useState } from "react";
import { EDU } from "./education-data";
import { fmt, getDelta, getHealth } from "./helpers";
import { Spark } from "./Spark";
import type { EconomicMetrics, MetricKey, QuarterData } from "./types";

interface TrendRowProps {
  metricKey: MetricKey;
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history: QuarterData[];
  onOpen: (k: MetricKey, v: string) => void;
}

export function TrendRow({ metricKey, metrics, previousMetrics, history, onOpen }: TrendRowProps) {
  const [hov, setHov] = useState(false);

  const { v } = fmt(metricKey, metrics[metricKey]);
  const delta = getDelta(metricKey, metrics[metricKey], previousMetrics?.[metricKey]);
  const health = getHealth(metricKey, metrics[metricKey]);
  const spark = history.map((q) => q.metrics[metricKey]);

  const deltaColor =
    delta.dir === "up"   ? "#16a34a" :
    delta.dir === "down" ? "#dc2626" :
    "rgba(28,20,9,0.3)";
  const deltaArrow =
    delta.dir === "up" ? "↑" : delta.dir === "down" ? "↓" : "→";

  return (
    <button
      type="button"
      onClick={() => onOpen(metricKey, v)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr auto",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "8px 4px",
        background: hov ? health.color + "08" : "transparent",
        borderBottom: "1px solid rgba(28,20,9,0.06)",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        transition: "background 0.15s",
      }}
    >
      {/* Symbol + dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: health.color, flexShrink: 0, boxShadow: hov ? `0 0 6px ${health.color}` : "none" }} />
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(28,20,9,0.45)" }}>
          {EDU[metricKey].symbol}
        </span>
      </div>

      {/* Sparkline */}
      <Spark data={spark} color={health.color} />

      {/* Delta + value */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, fontWeight: 600, color: deltaColor }}>
          {deltaArrow}{delta.label}
        </span>
        <span style={{ fontFamily: "'Fraunces'", fontSize: 16, fontWeight: 700, color: "#1c1409", letterSpacing: "-0.01em" }}>
          {v}
        </span>
      </div>
    </button>
  );
}