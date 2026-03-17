/**
 * src/components/game/panels/GameHeader.tsx
 * ───────────────────────────────────────────
 * Top bar of the game page.
 * Shows: country name · quarter badge · New Game + Exit buttons.
 * No game logic — purely presentational.
 */
'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
  .gh-bar{border-bottom:2px solid rgba(28,20,9,.22);padding:18px 40px;display:flex;align-items:center;justify-content:space-between;background:#f2ebe0;gap:14px;flex-wrap:wrap}
  .gh-left{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
  .gh-name{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,4vw,50px);letter-spacing:.04em;line-height:1;color:#1c1409}
  .gh-badge{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#bf3509;border:1px solid #bf3509;padding:3px 9px;white-space:nowrap;font-family:'DM Mono',monospace}
  .gh-actions{display:flex;align-items:center;gap:8px}
  .gh-btn{background:transparent;border:1px solid rgba(28,20,9,.22);color:rgba(28,20,9,.52);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.09em;text-transform:uppercase;padding:7px 13px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:.14s;white-space:nowrap}
  .gh-btn:hover{border-color:#1c1409;color:#1c1409}
  @media(max-width:600px){.gh-bar{padding:14px 20px}}
`;

interface GameHeaderProps {
  countryName: string;
  quarter: number;
  isOver: boolean;
  onNewGame: () => void;
  onExit: () => void;
}

export function GameHeader({ countryName, quarter, isOver, onNewGame, onExit }: GameHeaderProps) {
  return (
    <>
      <style>{css}</style>
      <div className="gh-bar">
        <div className="gh-left">
          <span className="gh-name">{countryName}</span>
          <span className="gh-badge">
            {isOver ? 'Term End' : `FY2024 · Q${quarter}`}
          </span>
        </div>
        <div className="gh-actions">
          <button className="gh-btn" onClick={onNewGame}>↺ New Game</button>
          <button className="gh-btn" onClick={onExit}>
            <LogOut size={11} /> Exit
          </button>
        </div>
      </div>
    </>
  );
}