/**
 * src/components/game/panels/GameOverModal.tsx
 * ──────────────────────────────────────────────
 * End-of-simulation overlay modal.
 * Purely presentational — receives score, country name,
 * and two callbacks. Zero game logic.
 */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const css = `
  .gom-overlay{position:fixed;inset:0;background:rgba(28,20,9,.72);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px}
  .gom-modal{background:#f2ebe0;border:1px solid rgba(28,20,9,.22);max-width:480px;width:100%;overflow:hidden}
  .gom-stripe{background:#bf3509;height:4px;width:100%}
  .gom-inner{padding:40px}
  .gom-title{font-family:'Bebas Neue',sans-serif;font-size:50px;letter-spacing:.04em;line-height:.9;margin-bottom:7px;color:#1c1409}
  .gom-sub{font-size:12px;color:rgba(28,20,9,.52);letter-spacing:.06em;margin-bottom:28px;font-family:'DM Mono',monospace}
  .gom-score-box{border:1px solid rgba(28,20,9,.22);background:#e9e0d2;padding:26px;text-align:center;margin-bottom:24px}
  .gom-score-label{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#bf3509;margin-bottom:10px;font-family:'DM Mono',monospace}
  .gom-score-num{font-family:'Bebas Neue',sans-serif;font-size:84px;line-height:1;color:#1c1409}
  .gom-score-sub{font-size:10px;color:rgba(28,20,9,.4);letter-spacing:.1em;text-transform:uppercase;margin-top:5px;font-family:'DM Mono',monospace}
  .gom-btn-p{width:100%;background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-weight:500;font-size:12px;letter-spacing:.09em;text-transform:uppercase;padding:15px;cursor:pointer;margin-bottom:8px;transition:.12s}
  .gom-btn-p:hover{background:#d94010}
  .gom-btn-g{width:100%;background:transparent;color:rgba(28,20,9,.52);border:1px solid rgba(28,20,9,.18);font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:10px;cursor:pointer;transition:.12s}
  .gom-btn-g:hover{border-color:#1c1409;color:#1c1409}
`;

interface GameOverModalProps {
  open:        boolean;
  score:       number;
  countryName: string;
  onNewGame:   () => void;
  onExit:      () => void;
}

export function GameOverModal({ open, score, countryName, onNewGame, onExit }: GameOverModalProps) {
  return (
    <>
      <style>{css}</style>
      <AnimatePresence>
        {open && (
          <motion.div
            className="gom-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="gom-modal"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <div className="gom-stripe" />
              <div className="gom-inner">
                <div className="gom-title">Simulation<br />Complete.</div>
                <div className="gom-sub">
                  Eight quarters concluded for {countryName}.
                </div>
                <div className="gom-score-box">
                  <div className="gom-score-label">Wisdom Score</div>
                  <div className="gom-score-num">{score}</div>
                  <div className="gom-score-sub">Growth · Stability · Public welfare</div>
                </div>
                <button className="gom-btn-p" onClick={onNewGame}>▶ New Mandate</button>
                <button className="gom-btn-g" onClick={onExit}>Exit Platform</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}