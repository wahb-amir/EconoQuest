'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RoundSummary {
  round:   number;
  summary: string;
}

interface SummaryData {
  archetype:       string;
  round_summaries: RoundSummary[];
  final_state:     Record<string, number>;
}

interface Props {
  open:        boolean;
  sessionId:   string;
  finalState:  Record<string, unknown>;
  score:       number;
  countryName: string;
  onNewGame:   () => void;
  onExit:      () => void;
}

// ── Archetype config ──────────────────────────────────────────────────────────

const ARCHETYPE_META: Record<string, { icon: string; color: string; tagline: string }> = {
  "The Balanced Steward":  { icon: "⊕", color: "#2d6a2d", tagline: "Steady hand, sustainable growth." },
  "The Inflation Hawk":    { icon: "◈", color: "#1a4a8a", tagline: "You crushed inflation — at a cost." },
  "The Tech Visionary":    { icon: "◉", color: "#6b3fa0", tagline: "You bet on the future. It paid off." },
  "The Populist":          { icon: "▼", color: "#bf3509", tagline: "The people loved you — until they didn't." },
  "The Debt Architect":    { icon: "∑", color: "#8a4a1a", tagline: "Leverage is a tool. You wielded it hard." },
  "The Isolationist":      { icon: "◻", color: "#4a6a4a", tagline: "Safe walls. Slow growth. Your choice." },
  "The Gambler":           { icon: "◆", color: "#a04a1a", tagline: "High risk, high drama, mixed results." },
};

// ── Verdict mapping ───────────────────────────────────────────────────────────

function getVerdict(score: number): { label: string; color: string; desc: string } {
  if (score >= 850) return { label: "Mandate of Heaven",  color: "#2d6a2d", desc: "An economy that will be studied for generations." };
  if (score >= 700) return { label: "Distinguished Rule", color: "#1a4a8a", desc: "Exceptional governance. Your nation thrived." };
  if (score >= 550) return { label: "Capable Leader",     color: "#4a6a4a", desc: "Solid fundamentals. Room to grow." };
  if (score >= 400) return { label: "Mixed Legacy",       color: "#8a6a1a", desc: "Some wins, some losses. Your nation survived." };
  if (score >= 250) return { label: "Troubled Mandate",   color: "#a04a1a", desc: "The cracks showed. Recovery was hard." };
  return              { label: "Economic Collapse",       color: "#bf3509", desc: "The markets did not forgive your decisions." };
}

// ── Metric display helpers ────────────────────────────────────────────────────

function MetricPill({ label, value, unit, good }: { label: string; value: number; unit: string; good?: 'high' | 'low' | null }) {
  const isGood = good === 'high' ? value > 3 : good === 'low' ? value < 5 : null;
  const color = isGood === true ? '#2d6a2d' : isGood === false ? '#bf3509' : '#1c1409';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '10px 14px',
      background: 'rgba(28,20,9,.04)',
      border: '1px solid rgba(28,20,9,.1)',
    }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(28,20,9,.4)' }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '.03em', color, lineHeight: 1 }}>
        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
      </span>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

  .gss-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(28,20,9,0.82);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 24px 16px;
    overflow-y: auto;
  }

  .gss-modal {
    background: #f2ebe0;
    width: 100%; max-width: 780px;
    font-family: 'DM Mono','Courier New',monospace;
    margin: auto;
  }

  /* mentor header */
  .gss-mentor-bar {
    background: #1c1409;
    padding: 20px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .gss-mentor-avatar {
    width: 40px; height: 40px;
    background: #bf3509;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; color: #f2ebe0;
    flex-shrink: 0;
  }
  .gss-mentor-name {
    font-size: 9px; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(242,235,224,.5); margin-bottom: 2px;
  }
  .gss-mentor-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: .04em; color: #f2ebe0; line-height: 1;
  }
  .gss-mentor-tag {
    margin-left: auto;
    font-size: 8px; letter-spacing: .14em; text-transform: uppercase;
    color: rgba(242,235,224,.35);
    border: 1px solid rgba(242,235,224,.12);
    padding: 3px 9px;
    white-space: nowrap;
  }

  /* archetype card */
  .gss-archetype {
    padding: 28px;
    border-bottom: 1px solid rgba(28,20,9,.12);
    display: flex; align-items: flex-start; gap: 20px;
  }
  .gss-arch-icon {
    font-size: 32px; flex-shrink: 0; margin-top: 2px;
  }
  .gss-arch-eyebrow {
    font-size: 8px; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(28,20,9,.4); margin-bottom: 5px;
  }
  .gss-arch-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px; letter-spacing: .03em; line-height: 1; margin-bottom: 6px;
  }
  .gss-arch-tagline {
    font-size: 12px; color: rgba(28,20,9,.55); line-height: 1.6;
  }
  .gss-score-badge {
    margin-left: auto; flex-shrink: 0;
    display: flex; flex-direction: column; align-items: center;
    padding: 14px 18px;
    border: 1.5px solid rgba(28,20,9,.18);
  }
  .gss-score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px; letter-spacing: .02em; line-height: 1;
  }
  .gss-score-label {
    font-size: 8px; letter-spacing: .14em; text-transform: uppercase;
    color: rgba(28,20,9,.4); margin-top: 2px;
  }

  /* verdict */
  .gss-verdict {
    padding: 18px 28px;
    border-bottom: 1px solid rgba(28,20,9,.12);
    display: flex; align-items: center; gap: 14px;
  }
  .gss-verdict-line { width: 3px; height: 36px; flex-shrink: 0; }
  .gss-verdict-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: .04em; line-height: 1; margin-bottom: 3px;
  }
  .gss-verdict-desc {
    font-size: 11px; color: rgba(28,20,9,.5); line-height: 1.5;
  }

  /* final metrics */
  .gss-metrics {
    padding: 20px 28px;
    border-bottom: 1px solid rgba(28,20,9,.12);
  }
  .gss-metrics-title {
    font-size: 8px; letter-spacing: .2em; text-transform: uppercase;
    color: rgba(28,20,9,.35); margin-bottom: 12px;
  }
  .gss-metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  /* mentor intro */
  .gss-mentor-intro {
    padding: 20px 28px;
    border-bottom: 1px solid rgba(28,20,9,.12);
    background: rgba(28,20,9,.025);
  }
  .gss-mentor-quote {
    font-size: 12px; line-height: 1.85; color: rgba(28,20,9,.7);
    border-left: 3px solid #bf3509;
    padding-left: 16px;
  }
  .gss-mentor-sig {
    font-size: 9px; color: rgba(28,20,9,.35); letter-spacing: .1em;
    text-transform: uppercase; margin-top: 10px; padding-left: 19px;
  }

  /* round timeline */
  .gss-timeline {
    padding: 20px 28px;
    border-bottom: 1px solid rgba(28,20,9,.12);
  }
  .gss-timeline-title {
    font-size: 8px; letter-spacing: .2em; text-transform: uppercase;
    color: rgba(28,20,9,.35); margin-bottom: 16px;
  }
  .gss-round-item {
    display: flex; gap: 14px; margin-bottom: 16px;
  }
  .gss-round-item:last-child { margin-bottom: 0; }
  .gss-round-dot-col {
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0; width: 28px;
  }
  .gss-round-dot {
    width: 28px; height: 28px;
    background: #1c1409;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px; color: #f2ebe0; flex-shrink: 0;
  }
  .gss-round-line {
    width: 1px; flex: 1; background: rgba(28,20,9,.1);
    margin-top: 4px; min-height: 12px;
  }
  .gss-round-body { flex: 1; padding-bottom: 4px; }
  .gss-round-label {
    font-size: 8px; letter-spacing: .14em; text-transform: uppercase;
    color: rgba(28,20,9,.35); margin-bottom: 5px;
  }
  .gss-round-text {
    font-size: 12px; line-height: 1.75; color: #1c1409;
    padding: 10px 14px;
    background: rgba(28,20,9,.03);
    border: 1px solid rgba(28,20,9,.08);
    border-left: 2px solid rgba(28,20,9,.15);
  }

  /* loading state */
  .gss-loading {
    padding: 40px 28px;
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
  }
  .gss-loading-dot {
    width: 8px; height: 8px;
    background: #bf3509; border-radius: 50%;
    animation: gss-blink 1s step-end infinite;
  }
  .gss-loading-text {
    font-size: 10px; letter-spacing: .16em; text-transform: uppercase;
    color: rgba(28,20,9,.4);
  }

  /* actions */
  .gss-actions {
    padding: 20px 28px;
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .gss-btn-primary {
    flex: 1; min-width: 140px;
    background: #bf3509; color: #f2ebe0; border: none;
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: .09em; text-transform: uppercase;
    padding: 14px 20px; cursor: pointer; transition: background .12s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .gss-btn-primary:hover { background: #d94010; }
  .gss-btn-ghost {
    background: transparent; color: rgba(28,20,9,.6);
    border: 1.5px solid rgba(28,20,9,.2);
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: .09em; text-transform: uppercase;
    padding: 14px 20px; cursor: pointer; transition: .12s;
  }
  .gss-btn-ghost:hover { border-color: rgba(28,20,9,.5); color: #1c1409; }

  @keyframes gss-blink { 0%,100%{opacity:1} 50%{opacity:0} }

  @media (max-width: 600px) {
    .gss-archetype { flex-wrap: wrap; }
    .gss-score-badge { margin-left: 0; }
    .gss-metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .gss-mentor-bar { padding: 16px 20px; }
    .gss-archetype,
    .gss-verdict,
    .gss-metrics,
    .gss-mentor-intro,
    .gss-timeline,
    .gss-actions { padding-left: 16px; padding-right: 16px; }
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export function GameSummaryScreen({
  open, sessionId, finalState, score, countryName, onNewGame, onExit,
}: Props) {
  const [data,    setData]    = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!open || !sessionId) return;
    setLoading(true);
    setError('');
    setData(null);

    async function fetchSummary() {
      try {
        const res = await fetch('/api/game/final-summary', {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ session_id: sessionId, final_state: finalState }),
        });

        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError('Could not load your mandate review. Your results were still recorded.');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [open, sessionId]);

  if (!open) return null;

  const archMeta  = data ? (ARCHETYPE_META[data.archetype] ?? ARCHETYPE_META["The Balanced Steward"]) : null;
  const verdict   = getVerdict(score);
  const fs        = finalState as any;

  return (
    <>
      <style>{css}</style>
      <div className="gss-overlay">
        <motion.div
          className="gss-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >

          {/* Mentor header */}
          <div className="gss-mentor-bar">
            <div className="gss-mentor-avatar">EQ</div>
            <div>
              <div className="gss-mentor-name">Economic Advisor — Post-Mandate Review</div>
              <div className="gss-mentor-title">{countryName} · Mandate Complete</div>
            </div>
            <div className="gss-mentor-tag">Confidential Debrief</div>
          </div>

          {loading ? (
            <div className="gss-loading">
              <div className="gss-loading-dot" />
              <p className="gss-loading-text">Reviewing your mandate decisions…</p>
            </div>
          ) : error ? (
            <>
              {/* Show basic score even if summary fails */}
              <div style={{ padding: '28px', borderBottom: '1px solid rgba(28,20,9,.12)' }}>
                <p style={{ fontSize: 11, color: 'rgba(28,20,9,.5)', lineHeight: 1.7 }}>{error}</p>
                <div style={{ marginTop: 16, fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#1c1409' }}>
                  Final Score: {score}
                </div>
              </div>
              <div className="gss-actions">
                <button className="gss-btn-primary" onClick={onNewGame}>New Nation →</button>
                <button className="gss-btn-ghost"   onClick={onExit}>Exit</button>
              </div>
            </>
          ) : data && archMeta ? (
            <>
              {/* Archetype + Score */}
              <div className="gss-archetype">
                <span className="gss-arch-icon" style={{ color: archMeta.color }}>{archMeta.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="gss-arch-eyebrow">Your Leadership Archetype</div>
                  <div className="gss-arch-name" style={{ color: archMeta.color }}>{data.archetype}</div>
                  <div className="gss-arch-tagline">{archMeta.tagline}</div>
                </div>
                <div className="gss-score-badge">
                  <div className="gss-score-num" style={{ color: verdict.color }}>{score}</div>
                  <div className="gss-score-label">Wisdom Score</div>
                </div>
              </div>

              {/* Verdict */}
              <div className="gss-verdict">
                <div className="gss-verdict-line" style={{ background: verdict.color }} />
                <div>
                  <div className="gss-verdict-label" style={{ color: verdict.color }}>{verdict.label}</div>
                  <div className="gss-verdict-desc">{verdict.desc}</div>
                </div>
              </div>

              {/* Final metrics snapshot */}
              <div className="gss-metrics">
                <div className="gss-metrics-title">Final Economic State</div>
                <div className="gss-metrics-grid">
                  <MetricPill label="GDP Growth"   value={fs.gdp}   unit="%" good="high" />
                  <MetricPill label="Inflation"    value={fs.inf}   unit="%" good="low"  />
                  <MetricPill label="Unemployment" value={fs.unemp} unit="%" good="low"  />
                  <MetricPill label="Debt / GDP"   value={fs.dbt}   unit="%" good={null} />
                  <MetricPill label="Public Mood"  value={fs.mood}  unit=""  good="high" />
                  <MetricPill label="Innovation"   value={fs.inn}   unit="pts" good="high" />
                  <MetricPill label="Currency"     value={fs.cur}   unit=""  good="high" />
                  <MetricPill label="Trade Balance" value={fs.trd}  unit="%" good="high" />
                </div>
              </div>

              {/* Mentor opening statement */}
              <div className="gss-mentor-intro">
                <div className="gss-mentor-quote">
                  {getMentorIntro(data.archetype, score, data.round_summaries.length)}
                </div>
                <div className="gss-mentor-sig">— Your Economic Advisor · {data.round_summaries.length} Fiscal Years Reviewed</div>
              </div>

              {/* Round-by-round timeline */}
              {data.round_summaries.length > 0 && (
                <div className="gss-timeline">
                  <div className="gss-timeline-title">Mandate Timeline — Advisor Notes</div>
                  {data.round_summaries.map((r, i) => (
                    <div key={r.round} className="gss-round-item">
                      <div className="gss-round-dot-col">
                        <div className="gss-round-dot">{r.round}</div>
                        {i < data.round_summaries.length - 1 && <div className="gss-round-line" />}
                      </div>
                      <div className="gss-round-body">
                        <div className="gss-round-label">Fiscal Year {r.round}</div>
                        <div className="gss-round-text">{r.summary}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="gss-actions">
                <button className="gss-btn-primary" onClick={onNewGame}>
                  New Nation →
                </button>
                <button className="gss-btn-ghost" onClick={onExit}>
                  Exit to Home
                </button>
              </div>
            </>
          ) : null}

        </motion.div>
      </div>
    </>
  );
}

// ── Mentor intro generator ────────────────────────────────────────────────────

function getMentorIntro(archetype: string, score: number, rounds: number): string {
  const intros: Record<string, string[]> = {
    "The Balanced Steward": [
      `After reviewing your ${rounds} fiscal years at the helm, I see a leader who understood that stability and growth are not enemies — they are partners. You resisted the temptation of short-term fixes. That discipline is rare.`,
      `You governed with patience. Most leaders I advise chase rapid growth and collapse. You chose the harder path: building foundations that compound over time. The markets respected that.`,
    ],
    "The Inflation Hawk": [
      `You made the painful call early. High interest rates are never popular — unemployment rises, growth slows, and the public mood suffers. But you held the line, and inflation broke. That is the Volcker playbook, and it works.`,
      `Inflation is a silent tax on the poor. You saw that, and you acted. The short-term cost was real, but the long-term stability you purchased was worth every point of lost growth.`,
    ],
    "The Tech Visionary": [
      `You bet on the future when the present was uncertain. R&D investment pays off slowly — three, four rounds before you see the innovation index move. Most leaders abandon the strategy before the dividend arrives. You didn't.`,
      `Building a knowledge economy requires accepting short-term pain. You did. The innovation index you built will compound in ways that traditional fiscal stimulus cannot replicate.`,
    ],
    "The Populist": [
      `I want to be honest with you, because that is what advisors are for: printing currency felt like a solution. The mood numbers went up. Growth ticked higher. But inflation is a debt that always comes due, and yours came due hard.`,
      `The people wanted relief, and you gave it to them — borrowed from their future selves. That is the fundamental tension of populist economics. The short-term is real. The long-term is also real.`,
    ],
    "The Debt Architect": [
      `You understood leverage. Borrowing to invest in productive capacity is not recklessness — it is how most great economies were built. The question is always: can you service the debt before the creditors lose faith?`,
      `High debt is not inherently fatal. It becomes fatal when GDP growth falls below the interest rate. You walked that line. Sometimes you crossed it. The tension in your mandate was real.`,
    ],
    "The Isolationist": [
      `You chose safety over dynamism. High tariffs, low foreign exposure, stable reserves — it is a coherent strategy. You won't find it in the Hall of Fame, but you won't find it in the history of economic collapses either.`,
      `There is wisdom in knowing your limits. You didn't gamble with the wealth fund, you didn't chase foreign lending returns, and you kept the currency stable. A conservative mandate, well executed.`,
    ],
    "The Gambler": [
      `You played the high-risk table. Sometimes the wealth fund delivered. Sometimes it didn't. What I want you to understand is that volatility in the fund creates fragility everywhere else — reserves that should buffer crises became the crisis.`,
      `Risk appetite is not a flaw. But unhedged risk — maximum wealth fund exposure when debt is already elevated — removes your margin for error. One bad quarter cascades.`,
    ],
  };

  const pool = intros[archetype] ?? intros["The Balanced Steward"];
  const base = pool[score > 600 ? 0 : 1] ?? pool[0];

  const suffix = score >= 800
    ? " This mandate will be cited as an example for future leaders."
    : score >= 600
    ? " Overall, this was a mandate worth studying."
    : score >= 400
    ? " There are lessons here worth taking into your next mandate."
    : " I hope the experience itself was the lesson.";

  return base + suffix;
}