/**
 * src/components/game/panels/FlagsBar.tsx
 * ──────────────────────────────────────────
 * Shows live edge-case warning flags below the event bar.
 * Hidden entirely when there are no active flags.
 */
'use client';

import React from 'react';

const css = `
  .fb-bar{padding:7px 40px;background:rgba(191,53,9,.05);border-bottom:1px solid rgba(191,53,9,.15);display:flex;gap:10px;flex-wrap:wrap;font-family:'DM Mono',monospace}
  .fb-flag{font-size:9px;letter-spacing:.07em;color:#bf3509;display:flex;align-items:center;gap:4px}
  .fb-flag::before{content:'⚠';font-size:10px}
  @media(max-width:600px){.fb-bar{padding:7px 20px}}
`;

export function FlagsBar({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;
  return (
    <>
      <style>{css}</style>
      <div className="fb-bar">
        {flags.map(f => (
          <span key={f} className="fb-flag">{f}</span>
        ))}
      </div>
    </>
  );
}