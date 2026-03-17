/**
 * src/components/game/panels/LeaderboardPanel.tsx
 * ─────────────────────────────────────────────────
 * Hall of Fame tab content within the game page.
 * Wraps the Leaderboard component with a header and
 * a CTA to the standalone /rankings page.
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Leaderboard } from '@/components/game/Leaderboard';

const css = `
  .lp-root{max-width:720px}
  .lp-head{margin-bottom:20px;display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:10px}
  .lp-title{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:.04em;color:#1c1409}
  .lp-link{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#bf3509;background:transparent;border:none;cursor:pointer;font-family:'DM Mono',monospace;text-decoration:underline;text-underline-offset:3px}
`;

export function LeaderboardPanel() {
  const router = useRouter();

  return (
    <>
      <style>{css}</style>
      <div className="lp-root">
        <div className="lp-head">
          <span className="lp-title">Hall of Fame</span>
          <button className="lp-link" onClick={() => router.push('/rankings')}>
            Full rankings page →
          </button>
        </div>
        <Leaderboard />
      </div>
    </>
  );
}