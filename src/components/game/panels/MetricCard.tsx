// ─── MetricCard.tsx ───────────────────────────────────────────────────────────
// Individual clickable metric card shown in the main grid.

import React, { useState } from "react";
import { EDU } from "./education-data";
import { fmt, getDelta, getHealth } from "./helpers";
import { Spark } from "./Spark";
import type { EconomicMetrics, MetricKey, QuarterData } from "./types";

interface MetricCardProps {
  metricKey: MetricKey;
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history: QuarterData[];
  index: number;
  onOpen: (k: MetricKey, v: string) => void;
}

export function MetricCard({
  metricKey,
  metrics,
  previousMetrics,
  history,
  index,
  onOpen,
}: MetricCardProps) {
  const [hov, setHov] = useState(false);

  const { v, u } = fmt(metricKey, metrics[metricKey]);
  const delta = getDelta(metricKey, metrics[metricKey], previousMetrics?.[metricKey]);
  const health = getHealth(metricKey, metrics[metricKey]);
  const spark = history.map((h) => h.metrics[metricKey]);

  const deltaColor =
    delta.dir === "up"   ? "#22c55e" :
    delta.dir === "down" ? "#ef4444" :
    "rgba(28,20,9,0.3)";
  const deltaArrow =
    delta.dir === "up" ? "↑" : delta.dir === "down" ? "↓" : "→";

  return (
    <button
      type="button"
      onClick={() => onOpen(metricKey, v)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={`${u}: ${v}. Status: ${health.label}. Click to learn more.`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "14px 14px 12px",
        textAlign: "left",
        cursor: "pointer",
        border: `1px solid ${hov ? health.color + "60" : health.color + "20"}`,
        background: hov ? health.color + "10" : health.color + "06",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov
          ? `0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px ${health.color}20, inset 0 1px 0 ${health.color}18`
          : "none",
        transition: "all 0.18s cubic-bezier(.22,.72,0,1)",
        animation: "mpIn 0.42s ease both",
        animationDelay: `${index * 40}ms`,
        overflow: "hidden",
        outline: "none",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${health.color}, ${health.color}44)`,
          opacity: hov ? 1 : 0.55,
          transition: "opacity 0.18s",
        }}
      />

      {/* Ambient glow on hover */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 85% 15%, ${health.color}14 0%, transparent 65%)`,
          opacity: hov ? 1 : 0,
          transition: "opacity 0.18s",
          pointerEvents: "none",
        }}
      />

      {/* Top row: unit label + delta pill */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingLeft: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,20,9,0.38)" }}>
          {u}
        </span>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", background: deltaColor + "18", borderRadius: 2, fontFamily: "'JetBrains Mono'", fontSize: 9, fontWeight: 600, color: deltaColor }}>
          <span>{deltaArrow}</span>
          <span>{delta.label}</span>
        </div>
      </div>

      {/* Main value */}
      <div style={{ paddingLeft: 6, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Fraunces'", fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: hov ? health.color : "#1c1409", transition: "color 0.18s" }}>
          {v}
        </span>
      </div>

      {/* Symbol + health badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 6, marginBottom: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(28,20,9,0.28)" }}>
          {EDU[metricKey].symbol}
        </span>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", background: health.color + "14", border: `1px solid ${health.color}28` }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: health.color }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: health.color }}>
            {health.label}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ paddingLeft: 6, marginBottom: 8 }}>
        <Spark data={spark} color={health.color} />
      </div>

      {/* Hover "learn" cue */}
      <div style={{ paddingLeft: 6, display: "flex", alignItems: "center", gap: 5, opacity: hov ? 1 : 0, transform: hov ? "none" : "translateY(4px)", transition: "all 0.18s" }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: health.color }}>
          Tap to learn →
        </span>
      </div>

      {/* Bottom sweep line */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: health.color,
          transform: hov ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.28s ease",
        }}
      />
    </button>
  );
}