// ─── EduDrawer.tsx ────────────────────────────────────────────────────────────
// Slide-in educational drawer shown when a MetricCard is clicked.
// Contains DrawerLabel and DrawerSection as local sub-components.

import React, { useState, useEffect, useCallback } from "react";
import { EDU } from "./education-data";
import { getHealth, rawVal } from "./helpers";
import { RangePositionBar } from "./RangePositionBar";
import type { MetricKey, PolicyEffect } from "./types";

// ─── DrawerLabel ──────────────────────────────────────────────────────────────

export function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono'",
          fontSize: 8,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "rgba(242,235,224,0.22)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(242,235,224,0.06)" }} />
    </div>
  );
}

// ─── DrawerSection ────────────────────────────────────────────────────────────

export function DrawerSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <DrawerLabel>{label}</DrawerLabel>
      <p
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono'",
          fontSize: 12,
          lineHeight: 1.88,
          color: "rgba(242,235,224,0.55)",
        }}
      >
        {children}
      </p>
    </div>
  );
}

// ─── EduDrawer ────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Ranges", "Policy", "History"] as const;

function effColor(e: PolicyEffect["effect"]) {
  return e === "positive" ? "#22c55e" : e === "negative" ? "#ef4444" : "#94a3b8";
}
function effIcon(e: PolicyEffect["effect"]) {
  return e === "positive" ? "↑" : e === "negative" ? "↓" : "→";
}

interface EduDrawerProps {
  metricKey: MetricKey | null;
  formattedValue: string;
  onClose: () => void;
}

export function EduDrawer({ metricKey, formattedValue, onClose }: EduDrawerProps) {
  const [vis, setVis] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (metricKey) {
      setTab(0);
      requestAnimationFrame(() => setVis(true));
      document.body.style.overflow = "hidden";
    } else {
      setVis(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [metricKey]);

  const close = useCallback(() => {
    setVis(false);
    setTimeout(onClose, 320);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [close]);

  if (!metricKey) return null;

  const d = EDU[metricKey];
  const rv = rawVal(metricKey, formattedValue);
  const health = getHealth(metricKey, rv);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: vis ? "rgba(5,4,2,0.82)" : "transparent",
          backdropFilter: vis ? "blur(10px)" : "none",
          transition: "background 0.32s, backdrop-filter 0.32s",
          cursor: "pointer",
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal
        aria-label={`Learn: ${d.title}`}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 9999,
          width: "min(620px, 100vw)",
          background: "#090704",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: vis ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(.22,.72,0,1)",
          boxShadow: vis ? "-40px 0 120px rgba(0,0,0,0.7)" : "none",
          borderLeft: `1px solid ${health.color}22`,
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${health.color}, ${health.color}33)`, flexShrink: 0 }} />

        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -80, right: -80,
            width: 300, height: 300,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${health.color}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── Header ── */}
        <div style={{ position: "relative", padding: "24px 32px 0", flexShrink: 0 }}>
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 8px",
                background: health.color + "18",
                border: `1px solid ${health.color}35`,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: health.color, boxShadow: `0 0 6px ${health.color}` }} />
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: health.color }}>
                {health.label}
              </span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(242,235,224,0.2)" }}>
              {d.symbol} · {d.unit}
            </span>
          </div>

          <h2 style={{ fontFamily: "'Fraunces'", fontSize: 30, fontWeight: 700, color: "#f2ebe0", margin: "0 0 4px", lineHeight: 1.1 }}>
            {d.title}
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, fontStyle: "italic", color: "rgba(242,235,224,0.28)", margin: "0 0 16px" }}>
            — {d.tagline}
          </p>

          {/* Big value */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Fraunces'", fontSize: 42, fontWeight: 900, lineHeight: 1, color: health.color, letterSpacing: "-0.02em" }}>
              {formattedValue}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "rgba(242,235,224,0.28)" }}>
              {d.unit}
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={close}
            style={{
              position: "absolute", right: 24, top: 24,
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(242,235,224,0.1)",
              background: "rgba(242,235,224,0.04)",
              color: "rgba(242,235,224,0.3)",
              fontFamily: "'JetBrains Mono'", fontSize: 12,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(242,235,224,0.1)"; (e.target as HTMLElement).style.color = "#f2ebe0"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "rgba(242,235,224,0.04)"; (e.target as HTMLElement).style.color = "rgba(242,235,224,0.3)"; }}
          >
            ✕
          </button>
        </div>

        {/* Gradient divider */}
        <div style={{ height: 1, margin: "0 32px", background: `linear-gradient(90deg, ${health.color}50, transparent)`, flexShrink: 0 }} />

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(242,235,224,0.07)", padding: "0 32px", flexShrink: 0, overflowX: "auto" }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(i)}
              style={{
                fontFamily: "'JetBrains Mono'", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em",
                padding: "12px 16px", cursor: "pointer", border: "none", background: "none",
                borderBottom: `2px solid ${tab === i ? health.color : "transparent"}`,
                color: tab === i ? "#f2ebe0" : "rgba(242,235,224,0.25)",
                transition: "color 0.15s", whiteSpace: "nowrap", marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 64px" }}>
          <style>{`@keyframes dTabIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>

          {/* Overview */}
          {tab === 0 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerSection label="Definition">{d.definition}</DrawerSection>
              <DrawerSection label="Why It Matters">{d.whyItMatters}</DrawerSection>
              <div>
                <DrawerLabel>How It's Calculated</DrawerLabel>
                <div style={{ borderLeft: `3px solid ${health.color}70`, background: `linear-gradient(90deg, ${health.color}08, transparent)`, padding: "14px 16px", marginBottom: 20 }}>
                  <p style={{ margin: 0, fontFamily: "'JetBrains Mono'", fontSize: 11, lineHeight: 1.85, color: "rgba(242,235,224,0.6)" }}>
                    {d.howCalculated}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ranges */}
          {tab === 1 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerLabel>Position in Range</DrawerLabel>
              <RangePositionBar edu={d} value={rv} />

              <DrawerLabel>Health Ranges</DrawerLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {d.healthRanges.map((r) => {
                  const active = r.label === health.label;
                  return (
                    <div
                      key={r.label}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px",
                        background: active ? r.color + "18" : "rgba(242,235,224,0.025)",
                        border: `1px solid ${active ? r.color + "50" : "rgba(242,235,224,0.06)"}`,
                        boxShadow: active ? `0 0 16px ${r.color}12` : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0, boxShadow: active ? `0 0 8px ${r.color}` : "none" }} />
                      <span style={{ flex: 1, fontFamily: "'JetBrains Mono'", fontSize: 11, fontWeight: 600, color: active ? r.color : "#f2ebe0" }}>
                        {r.label}
                      </span>
                      {active && (
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: r.color }}>
                          ← you
                        </span>
                      )}
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "rgba(242,235,224,0.28)" }}>
                        {r.range}
                      </span>
                    </div>
                  );
                })}
              </div>

              <DrawerLabel>Leaderboard Impact</DrawerLabel>
              <div style={{ border: "1px solid rgba(191,53,9,0.2)", background: "linear-gradient(135deg,rgba(191,53,9,0.1),rgba(191,53,9,0.03))", padding: "14px 16px" }}>
                <p style={{ margin: 0, fontFamily: "'JetBrains Mono'", fontSize: 11, lineHeight: 1.8, color: "rgba(242,235,224,0.6)" }}>
                  {d.leaderboardImpact}
                </p>
              </div>
            </div>
          )}

          {/* Policy */}
          {tab === 2 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerLabel>Policy Effects</DrawerLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.policyEffects.map((p) => (
                  <div
                    key={p.policy}
                    style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 10, padding: "12px", background: "rgba(242,235,224,0.025)", border: "1px solid rgba(242,235,224,0.06)" }}
                  >
                    <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: effColor(p.effect) + "18", borderRadius: 2, color: effColor(p.effect), fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700 }}>
                      {effIcon(p.effect)}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, fontWeight: 600, color: "#f2ebe0", marginBottom: 4 }}>{p.policy}</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, lineHeight: 1.65, color: "rgba(242,235,224,0.4)" }}>{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {tab === 3 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerSection label="Real World Example">
                <span style={{ borderLeft: `3px solid ${health.color}70`, paddingLeft: 12, display: "block" }}>
                  {d.realWorldExample}
                </span>
              </DrawerSection>

              <DrawerLabel>Did You Know?</DrawerLabel>
              <div style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(242,235,224,0.07)", background: "rgba(242,235,224,0.025)", padding: "20px 20px 18px" }}>
                <div style={{ position: "absolute", top: -8, left: 4, fontFamily: "'Fraunces'", fontSize: 80, lineHeight: 1, color: "rgba(242,235,224,0.04)", pointerEvents: "none" }}>
                  "
                </div>
                <p style={{ position: "relative", margin: 0, fontFamily: "'JetBrains Mono'", fontSize: 11, lineHeight: 1.88, color: "rgba(242,235,224,0.55)" }}>
                  {d.funFact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(242,235,224,0.06)", padding: "10px 32px" }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(242,235,224,0.16)" }}>
            Esc or click outside to dismiss
          </span>
        </div>
      </aside>
    </>
  );
}