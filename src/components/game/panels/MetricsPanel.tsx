// ─── MetricsPanel.tsx ─────────────────────────────────────────────────────────
// Root component. Composes all sub-components into the full metrics panel UI.

"use client";

import React, { useState, useCallback } from "react";
import { METRIC_KEYS } from "./helpers";
import { MetricCard } from "./MetricCard";
import { TrendRow } from "./TrendRow";
import { ProgressBar } from "./ProgressBar";
import { EduDrawer } from "./EduDrawer";
import type { EconomicMetrics, MetricKey, MetricsPanelProps, QuarterData } from "./types";

const TREND_KEYS: MetricKey[] = ["gdp", "inflation", "unemployment", "publicMood", "reserves"];

export function MetricsPanel({
  metrics,
  previousMetrics,
  history,
  quarter,
  progress,
  isOver,
  onNextQuarter,
}: MetricsPanelProps) {
  const [activeKey, setActiveKey] = useState<MetricKey | null>(null);
  const [activeVal, setActiveVal] = useState("");

  const openEdu = useCallback((k: MetricKey, v: string) => {
    setActiveVal(v);
    setActiveKey(k);
  }, []);

  const closeEdu = useCallback(() => setActiveKey(null), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600&display=swap');
        @keyframes mpIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
      `}</style>

      <div style={{ width: "100%" }}>
        <ProgressBar quarter={quarter} total={8} progress={progress} />

        {/* Hint banner */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid rgba(191,53,9,0.12)", background: "rgba(191,53,9,0.04)", marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#bf3509", opacity: 0.6, animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(28,20,9,0.4)" }}>
            Each metric is clickable — tap any card to learn what it means
          </span>
        </div>

        {/* ── Live Indicators header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(28,20,9,0.28)", whiteSpace: "nowrap" }}>
            Live Indicators
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(28,20,9,0.08)" }} />
        </div>

        {/* ── Cards grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(152px,1fr))", gap: 8, marginBottom: 24 }}>
          {METRIC_KEYS.map((k, i) => (
            <MetricCard
              key={k}
              metricKey={k}
              metrics={metrics}
              previousMetrics={previousMetrics}
              history={history}
              index={i}
              onOpen={openEdu}
            />
          ))}
        </div>

        {/* ── Quarter Trends ── */}
        {history.length > 1 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(28,20,9,0.28)", whiteSpace: "nowrap" }}>
                Quarter Trends
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(28,20,9,0.08)" }} />
            </div>
            <div style={{ border: "1px solid rgba(28,20,9,0.08)", background: "rgba(28,20,9,0.02)", padding: "8px 16px", marginBottom: 20 }}>
              {TREND_KEYS.map((k) => (
                <TrendRow
                  key={k}
                  metricKey={k}
                  metrics={metrics}
                  previousMetrics={previousMetrics}
                  history={history}
                  onOpen={openEdu}
                />
              ))}
            </div>
          </>
        )}

        {/* ── CTA ── */}
        {isOver ? (
          <div style={{ border: "1px solid rgba(191,53,9,0.2)", background: "rgba(191,53,9,0.06)", padding: "14px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(191,53,9,0.8)" }}>
              ◈ Mandate complete — Q8 reached
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.currentTarget.blur(); onNextQuarter(); }}
            disabled={isOver}
            style={{
              display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 10,
              background: "#bf3509", color: "#f2ebe0", border: "none", padding: "16px 24px",
              fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#d94010"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#bf3509"; }}
          >
            <span>Advance to Q{quarter + 1}</span>
            <span style={{ opacity: 0.5 }}>→</span>
          </button>
        )}
      </div>

      <EduDrawer metricKey={activeKey} formattedValue={activeVal} onClose={closeEdu} />
    </>
  );
}

export default MetricsPanel;