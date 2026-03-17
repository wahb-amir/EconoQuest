'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MOCK_LEADERBOARD } from '@/lib/simulation-engine';

const css = `
  .lb-root{font-family:'DM Mono','Courier New',monospace;color:#1c1409}
  .lb-head{display:grid;grid-template-columns:32px 1fr auto auto;gap:0;border-bottom:2px solid rgba(28,20,9,.22);padding:0 20px 12px;align-items:end}
  .lb-col-label{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,20,9,.4)}
  .lb-list{display:flex;flex-direction:column}
  .lb-row{display:grid;grid-template-columns:32px 1fr auto;gap:12px;padding:14px 20px;border-bottom:1px solid rgba(28,20,9,.08);align-items:center;transition:background .12s;cursor:default}
  .lb-row:hover{background:#e9e0d2}
  .lb-row.top1{border-left:3px solid #bf3509}
  .lb-row.top2{border-left:3px solid rgba(28,20,9,.35)}
  .lb-row.top3{border-left:3px solid rgba(28,20,9,.2)}
  .lb-rank{font-family:'Bebas Neue',sans-serif;font-size:22px;line-height:1;color:rgba(28,20,9,.25);text-align:center}
  .lb-rank.top1{color:#bf3509}
  .lb-rank.top2{color:#1c1409}
  .lb-rank.top3{color:rgba(28,20,9,.55)}
  .lb-info{}
  .lb-name{font-size:13px;font-weight:500;color:#1c1409;letter-spacing:.02em;margin-bottom:3px}
  .lb-badge{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.4);border:1px solid rgba(28,20,9,.15);padding:1px 6px;display:inline-block}
  .lb-score-col{text-align:right}
  .lb-score{font-family:'Bebas Neue',sans-serif;font-size:28px;line-height:1;color:#1c1409;letter-spacing:.03em}
  .lb-row.top1 .lb-score{color:#bf3509}
  .lb-score-label{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.35);margin-top:2px}
  .lb-masthead{padding:24px 20px 20px;border-bottom:1px solid rgba(28,20,9,.13)}
  .lb-masthead-title{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:.04em;color:#1c1409;margin-bottom:4px}
  .lb-masthead-sub{font-size:10px;color:rgba(28,20,9,.45);letter-spacing:.06em}
  .lb-empty{padding:40px 20px;text-align:center;font-size:11px;color:rgba(28,20,9,.35);letter-spacing:.06em}
`;

export const Leaderboard: React.FC = () => {
  const entries = MOCK_LEADERBOARD ?? [];

  return (
    <>
      <style>{css}</style>
      <div className="lb-root">
        <div className="lb-masthead">
          <div className="lb-masthead-title">Hall of Fame</div>
          <div className="lb-masthead-sub">Ranked by wisdom score across all completed mandates</div>
        </div>

        {entries.length === 0 ? (
          <div className="lb-empty">No entries yet. Complete a simulation to appear here.</div>
        ) : (
          <div className="lb-list">
            {entries.map((user: any, i: number) => {
              const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
              return (
                <motion.div
                  key={user.name}
                  className={`lb-row ${rankClass}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className={`lb-rank ${rankClass}`}>
                    {i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : i + 1}
                  </div>
                  <div className="lb-info">
                    <div className="lb-name">{user.name}</div>
                    <span className="lb-badge">{user.badge}</span>
                  </div>
                  <div className="lb-score-col">
                    <div className="lb-score">{user.score}</div>
                    <div className="lb-score-label">pts</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
