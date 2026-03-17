/**
 * src/components/game/panels/MetricsPanel.tsx
 * ─────────────────────────────────────────────
 * Right column of the strategy console.
 * Contains:  MetricDashboard  +  EconomicChart  +  MandateBar
 *
 * Receives all metric/history data as props.
 * No game logic — layout + delegation only.
 */
'use client';

import React from 'react';
import { MetricDashboard } from '@/components/game/MetricDisplay';
import { EconomicChart }   from '@/components/game/EconomicChart';
import { EconomicMetrics, QuarterData } from '@/lib/simulation-engine';
import { ArrowRight } from 'lucide-react';

const css = `
  .mp-root{display:flex;flex-direction:column;gap:24px}
  .mp-label{font-size:8px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.45);margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid rgba(28,20,9,.1);font-family:'DM Mono',monospace}
  .mp-mandate{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border:1px solid rgba(28,20,9,.22);background:#e9e0d2;flex-wrap:wrap;gap:14px}
  .mp-prog-wrap{display:flex;flex-direction:column;gap:5px}
  .mp-prog-label{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,20,9,.45);font-family:'DM Mono',monospace}
  .mp-prog-track{width:180px;height:2px;background:rgba(28,20,9,.15)}
  .mp-prog-fill{height:100%;background:#bf3509;transition:width .55s ease}
  .mp-next-btn{background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-weight:500;font-size:12px;letter-spacing:.09em;text-transform:uppercase;padding:13px 30px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:.12s;white-space:nowrap}
  .mp-next-btn:hover{background:#d94010}
  .mp-over-note{font-size:11px;color:rgba(28,20,9,.45);letter-spacing:.05em;font-family:'DM Mono',monospace}
`;

interface MetricsPanelProps {
  metrics:          EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history:          QuarterData[];
  quarter:          number;
  progress:         number;
  isOver:           boolean;
  onNextQuarter:    () => void;
}

export function MetricsPanel({
  metrics, previousMetrics, history,
  quarter, progress, isOver, onNextQuarter
}: MetricsPanelProps) {
  return (
    <>
      <style>{css}</style>
      <div className="mp-root">

        <div>
          <div className="mp-label">Live Metrics</div>
          <MetricDashboard metrics={metrics} previousMetrics={previousMetrics} />
        </div>

        <div>
          <div className="mp-label">Performance History</div>
          <EconomicChart history={history} />
        </div>

        {/* Mandate bar */}
        <div className="mp-mandate">
          <div className="mp-prog-wrap">
            <span className="mp-prog-label">Mandate Progress — {progress}%</span>
            <div className="mp-prog-track">
              <div className="mp-prog-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {!isOver ? (
            <button className="mp-next-btn" onClick={onNextQuarter}>
              Apply Q{quarter} Mandate <ArrowRight size={14} />
            </button>
          ) : (
            <span className="mp-over-note">
              Mandate complete — review your results above.
            </span>
          )}
        </div>

      </div>
    </>
  );
}