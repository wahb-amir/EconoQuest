"use client";

import React, { useEffect, useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NationEntry {
  nation_name: string;
  difficulty: "easy" | "medium" | "hard";
  top_score: number;
  top_entries?: { player_name?: string; score?: number }[];
}

interface LeaderboardPanelProps {
  currentNation?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFF_LABEL: Record<string, string> = {
  easy: "Stable",
  medium: "Volatile",
  hard: "Crisis",
};

const DIFF_COLOR: Record<string, string> = {
  easy: "#2a6e3f",
  medium: "#8a5a00",
  hard: "#bf3509",
};

const DIFF_BG: Record<string, string> = {
  easy: "rgba(42,110,63,.10)",
  medium: "rgba(138,90,0,.10)",
  hard: "rgba(191,53,9,.10)",
};

function scoreGrade(score: number): string {
  if (score >= 800) return "S";
  if (score >= 700) return "A";
  if (score >= 600) return "B";
  if (score >= 500) return "C";
  if (score >= 400) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  const m: Record<string, string> = {
    S: "#bf3509",
    A: "#b87200",
    B: "#2a6e3f",
    C: "#1c6080",
    D: "rgba(28,20,9,.45)",
    F: "rgba(28,20,9,.25)",
  };
  return m[grade] ?? "rgba(28,20,9,.4)";
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
  @keyframes hof-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bar-grow {
    from { width: 0; }
  }
  @keyframes pulse-dot {
    0%,100% { opacity: 1; }
    50%      { opacity: .3; }
  }

  .hof-root {
    font-family: 'DM Mono', monospace;
    color: #1c1409;
  }

  /* ── Header ── */
  .hof-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
  }
  .hof-title-row { display: flex; flex-direction: column; gap: 4px; }
  .hof-eyebrow {
    font-size: 9px; letter-spacing: .22em; text-transform: uppercase;
    color: rgba(28,20,9,.38);
  }
  .hof-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(28px, 4vw, 38px);
    letter-spacing: .04em; color: #1c1409; line-height: 1;
  }
  .hof-live {
    display: flex; align-items: center; gap: 5px;
    font-size: 8px; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(28,20,9,.4);
  }
  .hof-live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #bf3509;
    animation: pulse-dot 1.8s ease-in-out infinite;
  }

  /* ── Legend ── */
  .hof-legend {
    display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;
  }
  .hof-legend-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 9px; letter-spacing: .12em; text-transform: uppercase;
    color: rgba(28,20,9,.45);
  }
  .hof-legend-pip {
    width: 8px; height: 8px; border-radius: 2px;
  }

  /* ── Divider ── */
  .hof-divider {
    border: none; border-top: 1px solid rgba(28,20,9,.12);
    margin: 0 0 20px;
  }

  /* ── Current-game banner ── */
  .hof-current-banner {
    display: flex; align-items: center; gap: 10px;
    background: rgba(191,53,9,.06); border: 1px solid rgba(191,53,9,.2);
    padding: 10px 16px; margin-bottom: 24px;
    font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
    color: #bf3509;
  }
  .hof-current-banner strong { font-weight: 500; }

  /* ── Loading / error ── */
  .hof-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 64px 0;
    font-size: 9px; letter-spacing: .2em; text-transform: uppercase;
    color: rgba(28,20,9,.3);
  }
  .hof-loading-spinner {
    width: 14px; height: 14px; border: 1.5px solid rgba(28,20,9,.15);
    border-top-color: #bf3509; border-radius: 50%;
    animation: spin .7s linear infinite; margin-right: 10px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Table wrapper ── */
  .hof-table-wrap { overflow-x: auto; }

  /* ── Row ── */
  .hof-row {
    display: grid;
    grid-template-columns: 40px 1fr 80px 48px 110px;
    align-items: center; gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(28,20,9,.07);
    animation: hof-in .25s ease both;
    transition: background .12s;
    cursor: default;
  }
  .hof-row:hover { background: rgba(28,20,9,.03); }
  .hof-row:last-child { border-bottom: none; }

  /* ── Column: rank ── */
  .hof-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: .02em;
    color: rgba(28,20,9,.18); text-align: center; line-height: 1;
    transition: color .12s;
  }
  .hof-rank.top3 { color: rgba(28,20,9,.55); }
  .hof-rank.rank1 { color: #bf3509; }

  /* ── Column: nation name ── */
  .hof-nation-col { min-width: 0; }
  .hof-nation-name {
    font-size: 13px; letter-spacing: .04em; font-weight: 500;
    color: #1c1409; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis;
  }
  .hof-nation-diff {
    display: inline-flex; align-items: center;
    font-size: 8px; letter-spacing: .16em; text-transform: uppercase;
    padding: 2px 6px; margin-top: 3px;
  }

  /* ── Column: score ── */
  .hof-score-col { text-align: right; }
  .hof-score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: .03em;
    color: #1c1409; line-height: 1;
  }
  .hof-score-label {
    font-size: 8px; letter-spacing: .12em; text-transform: uppercase;
    color: rgba(28,20,9,.32); margin-top: 1px;
  }

  /* ── Column: grade ── */
  .hof-grade {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: .02em; text-align: center; line-height: 1;
    transition: color .12s;
  }

  /* ── Column: score bar ── */
  .hof-bar-col { min-width: 0; }
  .hof-bar-track {
    height: 3px; background: rgba(28,20,9,.08); position: relative;
    overflow: hidden;
  }
  .hof-bar-fill {
    position: absolute; top: 0; left: 0; height: 100%;
    background: #bf3509; animation: bar-grow .55s cubic-bezier(.22,1,.36,1) both;
    transition: width .4s;
  }
  .hof-bar-fill.gold { background: #bf3509; }
  .hof-bar-fill.easy  { background: #2a6e3f; }
  .hof-bar-fill.medium { background: #8a5a00; }
  .hof-bar-fill.hard  { background: #bf3509; }

  /* ── Retry ── */
  .hof-retry {
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 12px; padding: 48px 0;
  }
  .hof-retry-msg {
    font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
    color: rgba(28,20,9,.4);
  }
  .hof-retry-btn {
    background: #1c1409; color: #f2ebe0; border: none;
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: .14em; text-transform: uppercase;
    padding: 10px 20px; cursor: pointer; transition: background .12s;
  }
  .hof-retry-btn:hover { background: #2d2010; }

  /* ── Column header row ── */
  .hof-col-header {
    display: grid;
    grid-template-columns: 40px 1fr 80px 48px 110px;
    gap: 12px; padding: 0 16px 8px;
    font-size: 8px; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(28,20,9,.32);
  }
  .hof-col-header span:nth-child(3) { text-align: right; }
  .hof-col-header span:nth-child(4) { text-align: center; }

  /* ── Empty ── */
  .hof-empty {
    padding: 48px 0; text-align: center;
    font-size: 9px; letter-spacing: .2em; text-transform: uppercase;
    color: rgba(28,20,9,.28);
  }

  /* ── Footnote ── */
  .hof-footnote {
    margin-top: 24px; padding-top: 16px;
    border-top: 1px solid rgba(28,20,9,.08);
    font-size: 9px; letter-spacing: .12em; text-transform: uppercase;
    color: rgba(28,20,9,.28);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
  }

  @media (max-width: 600px) {
    .hof-row {
      grid-template-columns: 36px 1fr 68px 40px;
    }
    .hof-bar-col { display: none; }
    .hof-col-header { grid-template-columns: 36px 1fr 68px 40px; }
    .hof-col-header span:nth-child(5) { display: none; }
    .hof-score-num { font-size: 17px; }
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export function LeaderboardPanel({ currentNation }: LeaderboardPanelProps) {
  const [nations, setNations] = useState<NationEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const maxScore = useRef(1000);

  const load = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/leaderboard/nations", { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const raw: NationEntry[] = data.nations ?? data ?? [];

      // Filter out the nation the player is currently running
      const filtered = currentNation
        ? raw.filter(
            (n) =>
              n.nation_name.toLowerCase() !== currentNation.toLowerCase(),
          )
        : raw;

      // Sort descending by top_score
      const sorted = [...filtered].sort((a, b) => b.top_score - a.top_score);
      maxScore.current = sorted[0]?.top_score ?? 1000;
      setNations(sorted);
      setFetchedAt(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, [currentNation]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{css}</style>
      <div className="hof-root">

        {/* Header */}
        <div className="hof-header">
          <div className="hof-title-row">
            <span className="hof-eyebrow">Global rankings</span>
            <div className="hof-title">Hall of Nations</div>
          </div>
          <div className="hof-live">
            <div className="hof-live-dot" />
            {status === "loading" ? "Fetching…" : `Updated ${fetchedAt}`}
          </div>
        </div>

        {/* Current-game exclusion notice */}
        {currentNation && status === "ok" && (
          <div className="hof-current-banner">
            <span style={{ fontSize: 10 }}>◈</span>
            <span>
              Your current mandate — <strong>{currentNation}</strong> — is
              excluded from this ranking
            </span>
          </div>
        )}

        {/* Difficulty legend */}
        <div className="hof-legend">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <div className="hof-legend-item" key={d}>
              <div
                className="hof-legend-pip"
                style={{ background: DIFF_COLOR[d] }}
              />
              {DIFF_LABEL[d]} scenario
            </div>
          ))}
        </div>
        <hr className="hof-divider" />

        {/* Loading */}
        {status === "loading" && (
          <div className="hof-loading">
            <div className="hof-loading-spinner" />
            Fetching nation records…
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="hof-retry">
            <span className="hof-retry-msg">Failed to load nation rankings</span>
            <button className="hof-retry-btn" onClick={load}>
              Retry ↺
            </button>
          </div>
        )}

        {/* Table */}
        {status === "ok" && (
          <div className="hof-table-wrap">
            {nations.length === 0 ? (
              <div className="hof-empty">No nation records yet</div>
            ) : (
              <>
                {/* Column headers */}
                <div className="hof-col-header">
                  <span>#</span>
                  <span>Nation</span>
                  <span>Score</span>
                  <span>Grade</span>
                  <span>Performance</span>
                </div>

                {nations.map((n, i) => {
                  const grade = scoreGrade(n.top_score);
                  const barPct = Math.round(
                    (n.top_score / maxScore.current) * 100,
                  );
                  const isFirst = i === 0;
                  const isTop3 = i < 3;

                  return (
                    <div
                      className="hof-row"
                      key={n.nation_name}
                      style={{ animationDelay: `${i * 35}ms` }}
                    >
                      {/* Rank */}
                      <div
                        className={`hof-rank ${isFirst ? "rank1" : isTop3 ? "top3" : ""}`}
                      >
                        {i + 1}
                      </div>

                      {/* Nation */}
                      <div className="hof-nation-col">
                        <div className="hof-nation-name">{n.nation_name}</div>
                        <div
                          className="hof-nation-diff"
                          style={{
                            color: DIFF_COLOR[n.difficulty] ?? "#888",
                            background: DIFF_BG[n.difficulty] ?? "transparent",
                          }}
                        >
                          {DIFF_LABEL[n.difficulty] ?? n.difficulty}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="hof-score-col">
                        <div className="hof-score-num">{n.top_score}</div>
                        <div className="hof-score-label">wisdom</div>
                      </div>

                      {/* Grade */}
                      <div
                        className="hof-grade"
                        style={{ color: gradeColor(grade) }}
                      >
                        {grade}
                      </div>

                      {/* Bar */}
                      <div className="hof-bar-col">
                        <div className="hof-bar-track">
                          <div
                            className={`hof-bar-fill ${n.difficulty}`}
                            style={{
                              width: `${barPct}%`,
                              animationDelay: `${i * 35 + 100}ms`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Footnote */}
        {status === "ok" && nations.length > 0 && (
          <div className="hof-footnote">
            <span>{nations.length} nations ranked</span>
            <span>Best wisdom score per nation · All difficulties</span>
          </div>
        )}
      </div>
    </>
  );
}