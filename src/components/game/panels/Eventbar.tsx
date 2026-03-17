/**
 * src/components/game/panels/EventBar.tsx
 * ──────────────────────────────────────────
 * Displays the current global economic event.
 * Receives the event object as a prop — no internal state.
 */
'use client';

import React from 'react';

const css = `
  .eb-bar{background:#e9e0d2;border-bottom:1px solid rgba(28,20,9,.22);padding:9px 40px;display:flex;align-items:center;gap:14px;overflow:hidden;font-family:'DM Mono','Courier New',monospace}
  .eb-label{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,20,9,.4);flex-shrink:0}
  .eb-pipe{width:1px;height:14px;background:rgba(28,20,9,.2);flex-shrink:0}
  .eb-title{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.04em;color:#1c1409;flex-shrink:0}
  .eb-desc{font-size:11px;color:rgba(28,20,9,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .eb-dir{font-size:9px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;flex-shrink:0}
  .eb-dir.up{color:#2d6a2d}
  .eb-dir.down{color:#bf3509}
  .eb-dir.stable{color:rgba(28,20,9,.4)}
  @media(max-width:600px){.eb-bar{padding:9px 20px;flex-wrap:wrap}}
`;

interface Event {
  title: string;
  description: string;
  dir: string;
}

export function EventBar({ event }: { event: Event }) {
  const dirLabel =
    event.dir === 'up'   ? '▲ Positive' :
    event.dir === 'down' ? '▼ Negative' : '— Neutral';

  return (
    <>
      <style>{css}</style>
      <div className="eb-bar">
        <span className="eb-label">Global Event</span>
        <div className="eb-pipe" />
        <span className="eb-title">{event.title}</span>
        <span className="eb-desc">{event.description}</span>
        <span className={`eb-dir ${event.dir}`}>{dirLabel}</span>
      </div>
    </>
  );
}