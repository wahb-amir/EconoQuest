'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GlobalEntry {
  rank:           number;
  player_name:    string;
  nation_name:    string;
  difficulty:     string;
  raw_score:      number;
  weighted_score: number;
  archetype:      string;
  created_at:     string;
}

interface NationEntry {
  rank:           number;
  player_name:    string;
  raw_score:      number;
  weighted_score: number;
  archetype:      string;
  difficulty:     string;
}

interface NationGroup {
  nation_name: string;
  difficulty:  string;
  top_entries: NationEntry[];
  top_score:   number;
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

  .lb-root {
    font-family: 'DM Mono','Courier New',monospace;
    color: #1c1409;
  }

  /* ── tabs ── */
  .lb-tabs {
    display: flex; gap: 0;
    border: 1.5px solid rgba(28,20,9,.18);
    margin-bottom: 24px;
    overflow: hidden;
  }
  .lb-tab {
    flex: 1; background: transparent; border: none;
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(28,20,9,.45); padding: 12px 16px;
    cursor: pointer; transition: .12s; text-align: center;
    border-right: 1.5px solid rgba(28,20,9,.18);
  }
  .lb-tab:last-child { border-right: none; }
  .lb-tab.active { background: #1c1409; color: #f2ebe0; }
  .lb-tab:hover:not(.active) { background: rgba(28,20,9,.05); }

  /* ── section header ── */
  .lb-section-head {
    display: flex; justify-content: space-between; align-items: baseline;
    border-bottom: 2px solid rgba(28,20,9,.18);
    padding-bottom: 14px; margin-bottom: 20px;
    flex-wrap: wrap; gap: 8px;
  }
  .lb-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; letter-spacing: .04em; color: #1c1409;
  }
  .lb-section-meta {
    font-size: 9px; color: rgba(28,20,9,.35);
    letter-spacing: .1em; text-transform: uppercase;
  }

  /* ── weight legend ── */
  .lb-legend {
    display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .lb-legend-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 9px; color: rgba(28,20,9,.45);
    letter-spacing: .08em; text-transform: uppercase;
  }
  .lb-legend-dot {
    width: 8px; height: 8px; flex-shrink: 0;
  }

  /* ── global leaderboard table ── */
  .lb-table { width: 100%; border-collapse: collapse; }
  .lb-thead th {
    font-size: 8px; letter-spacing: .16em; text-transform: uppercase;
    color: rgba(28,20,9,.35); font-weight: 500;
    padding: 8px 12px; text-align: left;
    border-bottom: 1px solid rgba(28,20,9,.12);
  }
  .lb-thead th:last-child { text-align: right; }

  .lb-row {
    border-bottom: 1px solid rgba(28,20,9,.07);
    transition: background .12s; cursor: default;
  }
  .lb-row:hover { background: rgba(28,20,9,.03); }
  .lb-row.top3 { background: rgba(191,53,9,.04); }
  .lb-row.top3:hover { background: rgba(191,53,9,.07); }

  .lb-td {
    padding: 12px 12px; vertical-align: middle; font-size: 12px;
  }

  /* rank cell */
  .lb-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: .03em;
    color: rgba(28,20,9,.2); width: 48px;
  }
  .lb-rank.gold   { color: #b8860b; }
  .lb-rank.silver { color: #808080; }
  .lb-rank.bronze { color: #8b4513; }

  /* player cell */
  .lb-player-name {
    font-weight: 500; color: #1c1409; margin-bottom: 2px;
  }
  .lb-archetype {
    font-size: 9px; color: rgba(28,20,9,.38);
    letter-spacing: .06em; text-transform: uppercase;
  }

  /* nation cell */
  .lb-nation-name { color: #1c1409; margin-bottom: 2px; }
  .lb-diff-badge {
    display: inline-block; font-size: 7px; letter-spacing: .1em;
    text-transform: uppercase; padding: 1px 6px; font-weight: 500;
  }
  .lb-diff-easy   { background: #eaf3de; color: #3b6d11; border: 1px solid #c0dd97; }
  .lb-diff-medium { background: #e6f1fb; color: #0c447c; border: 1px solid #85b7eb; }
  .lb-diff-hard   { background: #fcebeb; color: #791f1f; border: 1px solid #f09595; }

  /* score cells */
  .lb-raw-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; color: rgba(28,20,9,.5);
    text-align: right;
  }
  .lb-weighted-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; color: #bf3509;
    text-align: right;
  }
  .lb-score-label {
    font-size: 7px; color: rgba(28,20,9,.3);
    letter-spacing: .1em; text-transform: uppercase;
    text-align: right; margin-top: 1px;
  }

  /* ── nation hall of fame ── */
  .lb-nations-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .lb-nation-card {
    border: 1.5px solid rgba(28,20,9,.13);
    background: #f2ebe0;
    transition: transform .14s, box-shadow .14s;
  }
  .lb-nation-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 0 rgba(28,20,9,.1), 0 8px 20px rgba(28,20,9,.07);
  }
  .lb-nation-card-head {
    padding: 14px 16px 12px;
    border-bottom: 1px solid rgba(28,20,9,.1);
  }
  .lb-nation-card-diff {
    margin-bottom: 6px;
  }
  .lb-nation-card-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: .04em; color: #1c1409;
    line-height: 1; margin-bottom: 2px;
  }
  .lb-nation-card-record {
    font-size: 9px; color: rgba(28,20,9,.35);
    letter-spacing: .08em; text-transform: uppercase;
  }
  .lb-nation-podium {
    padding: 10px 0;
  }
  .lb-podium-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 14px;
    border-bottom: 1px solid rgba(28,20,9,.06);
  }
  .lb-podium-row:last-child { border-bottom: none; }
  .lb-podium-rank {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 15px; color: rgba(28,20,9,.2);
    width: 20px; flex-shrink: 0;
  }
  .lb-podium-rank.gold   { color: #b8860b; }
  .lb-podium-rank.silver { color: #808080; }
  .lb-podium-rank.bronze { color: #8b4513; }
  .lb-podium-name {
    flex: 1; font-size: 11px; color: #1c1409;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .lb-podium-arch {
    font-size: 8px; color: rgba(28,20,9,.35);
    letter-spacing: .06em; text-transform: uppercase;
    white-space: nowrap;
  }
  .lb-podium-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; color: #bf3509;
    flex-shrink: 0;
  }

  /* ── empty state ── */
  .lb-empty {
    padding: 60px 20px; text-align: center;
    font-size: 12px; color: rgba(28,20,9,.32);
    letter-spacing: .06em;
  }
  .lb-empty-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; color: rgba(28,20,9,.15);
    letter-spacing: .04em; margin-bottom: 8px;
  }

  /* ── loading ── */
  .lb-loading {
    padding: 60px 20px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .lb-spinner {
    width: 10px; height: 10px; background: #bf3509;
    border-radius: 50%; animation: lb-blink 1s step-end infinite;
  }
  .lb-loading-text {
    font-size: 9px; letter-spacing: .16em; text-transform: uppercase;
    color: rgba(28,20,9,.35);
  }

  @keyframes lb-blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── responsive ── */
  @media (max-width: 900px) {
    .lb-nations-grid { grid-template-columns: repeat(2, 1fr); }
    .lb-td { padding: 10px 8px; }
  }
  @media (max-width: 600px) {
    .lb-nations-grid { grid-template-columns: 1fr; }
    .lb-table { font-size: 11px; }
    .lb-td { padding: 9px 6px; }
    .lb-rank { font-size: 16px; width: 36px; }
    .lb-weighted-score { font-size: 18px; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function rankClass(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return '';
}

function diffClass(d: string): string {
  if (d === 'easy')   return 'lb-diff-easy';
  if (d === 'hard')   return 'lb-diff-hard';
  return 'lb-diff-medium';
}

function diffLabel(d: string): string {
  if (d === 'easy')   return 'Easy';
  if (d === 'hard')   return 'Hard';
  return 'Medium';
}

function weightLabel(d: string): string {
  if (d === 'easy')   return '×1.0';
  if (d === 'hard')   return '×2.0';
  return '×1.4';
}

function formatScore(n: number): string {
  return Math.round(n).toLocaleString();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LeaderboardPanel() {
  const [tab,          setTab]     = useState<'global' | 'nations'>('global');
  const [global,       setGlobal]  = useState<GlobalEntry[]>([]);
  const [nations,      setNations] = useState<NationGroup[]>([]);
  const [loading,      setLoading] = useState(true);
  const [lastUpdated,  setLast]    = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      // global: top 50 by weighted score, one entry per player (their best nation)
      const globalRes = await fetch('/api/leaderboard/global');
      const nationRes = await fetch('/api/leaderboard/nations');

      if (globalRes.ok) {
        const d = await globalRes.json();
        setGlobal(d.entries ?? []);
        setLast(new Date().toLocaleTimeString());
      }
      if (nationRes.ok) {
        const d = await nationRes.json();
        setNations(d.nations ?? []);
      }
    } catch {
      // silent — show empty state
    }
    setLoading(false);
  }

  return (
    <>
      <style>{css}</style>
      <div className="lb-root">

        {/* Tabs */}
        <div className="lb-tabs">
          <button
            className={`lb-tab${tab === 'global' ? ' active' : ''}`}
            onClick={() => setTab('global')}
          >
            ◈ Global Rankings
          </button>
          <button
            className={`lb-tab${tab === 'nations' ? ' active' : ''}`}
            onClick={() => setTab('nations')}
          >
            ◎ Nation Hall of Fame
          </button>
        </div>

        {loading ? (
          <div className="lb-loading">
            <div className="lb-spinner" />
            <p className="lb-loading-text">Loading rankings…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'global' && (
              <motion.div key="global"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

                <div className="lb-section-head">
                  <div className="lb-section-title">Global Rankings</div>
                  <div className="lb-section-meta">
                    Top score per nation · Weighted by difficulty
                    {lastUpdated && ` · Updated ${lastUpdated}`}
                  </div>
                </div>

                {/* Difficulty weight legend */}
                <div className="lb-legend">
                  {(['easy','medium','hard'] as const).map(d => (
                    <div key={d} className="lb-legend-item">
                      <div className={`lb-legend-dot lb-diff-${d}`}
                        style={{ width: 8, height: 8, display: 'inline-block' }} />
                      <span className={`lb-diff-badge lb-diff-${d}`}>{diffLabel(d)}</span>
                      <span>{weightLabel(d)} multiplier</span>
                    </div>
                  ))}
                </div>

                {global.length === 0 ? (
                  <div className="lb-empty">
                    <div className="lb-empty-title">No Scores Yet</div>
                    <p>Complete a mandate to appear on the leaderboard.</p>
                  </div>
                ) : (
                  <table className="lb-table">
                    <thead className="lb-thead">
                      <tr>
                        <th style={{ width: 48 }}>#</th>
                        <th>Leader</th>
                        <th>Nation</th>
                        <th style={{ textAlign: 'right' }}>Raw</th>
                        <th style={{ textAlign: 'right' }}>Weighted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {global.map((entry, i) => (
                        <motion.tr
                          key={`${entry.player_name}-${entry.nation_name}`}
                          className={`lb-row${i < 3 ? ' top3' : ''}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.15 }}
                        >
                          <td className="lb-td">
                            <div className={`lb-rank ${rankClass(i + 1)}`}>
                              {i + 1}
                            </div>
                          </td>
                          <td className="lb-td">
                            <div className="lb-player-name">{entry.player_name}</div>
                            {entry.archetype && (
                              <div className="lb-archetype">{entry.archetype}</div>
                            )}
                          </td>
                          <td className="lb-td">
                            <div className="lb-nation-name">{entry.nation_name}</div>
                            <span className={`lb-diff-badge ${diffClass(entry.difficulty)}`}>
                              {diffLabel(entry.difficulty)} {weightLabel(entry.difficulty)}
                            </span>
                          </td>
                          <td className="lb-td">
                            <div className="lb-raw-score">{entry.raw_score}</div>
                            <div className="lb-score-label">raw</div>
                          </td>
                          <td className="lb-td">
                            <div className="lb-weighted-score">
                              {formatScore(entry.weighted_score)}
                            </div>
                            <div className="lb-score-label">weighted</div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </motion.div>
            )}

            {tab === 'nations' && (
              <motion.div key="nations"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

                <div className="lb-section-head">
                  <div className="lb-section-title">Nation Hall of Fame</div>
                  <div className="lb-section-meta">Top 3 leaders per nation</div>
                </div>

                {nations.length === 0 ? (
                  <div className="lb-empty">
                    <div className="lb-empty-title">No Records Yet</div>
                    <p>Complete a mandate to enter a nation's hall of fame.</p>
                  </div>
                ) : (
                  <div className="lb-nations-grid">
                    {nations.map((nation, ni) => (
                      <motion.div
                        key={nation.nation_name}
                        className="lb-nation-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ni * 0.05, duration: 0.18 }}
                      >
                        <div className="lb-nation-card-head">
                          <div className="lb-nation-card-diff">
                            <span className={`lb-diff-badge ${diffClass(nation.difficulty)}`}>
                              {diffLabel(nation.difficulty)} · {weightLabel(nation.difficulty)}
                            </span>
                          </div>
                          <div className="lb-nation-card-name">{nation.nation_name}</div>
                          <div className="lb-nation-card-record">
                            Best: {formatScore(nation.top_score)} pts
                          </div>
                        </div>
                        <div className="lb-nation-podium">
                          {nation.top_entries.map((e, i) => (
                            <div key={e.player_name} className="lb-podium-row">
                              <div className={`lb-podium-rank ${rankClass(i + 1)}`}>
                                {i + 1}
                              </div>
                              <div className="lb-podium-name">{e.player_name}</div>
                              {e.archetype && (
                                <div className="lb-podium-arch">
                                  {e.archetype.replace('The ', '')}
                                </div>
                              )}
                              <div className="lb-podium-score">{e.raw_score}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}