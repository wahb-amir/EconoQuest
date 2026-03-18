/**
 * src/components/game/panels/PolicyPanel.tsx
 * ────────────────────────────────────────────
 * Left column of the strategy console.
 * Contains:  PolicyControls  +  AIHintSystem
 *
 * Receives policy state + onChange from the game page.
 * No game logic here — just layout + delegation.
 */
'use client';

import React from 'react';
import { PolicyControls } from '@/components/game/PolicyControls';
import { AIHintSystem }   from '@/components/game/AIHintSystem';
import { PolicyDecisions, EconomicMetrics } from '@/lib/simulation-engine';

const css = `
  .pp-root{display:flex;flex-direction:column;gap:20px}
  .pp-label{font-size:8px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.45);margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid rgba(28,20,9,.1);font-family:'DM Mono',monospace}
`;

interface PolicyPanelProps {
  policy:    PolicyDecisions;
  onChange:  (key: string, value: unknown) => void;
  disabled:  boolean;
  currentMetrics: EconomicMetrics;
  currentQuarter: number;
  totalQuarters:  number;
  wisdomScore:    number;
  hintsUsed:      number;
  hintsMax:       number;
  quarterHistory: any[];
  onHintUsed:     () => void;
  country:        any;
}

export function PolicyPanel(props: PolicyPanelProps) {
  const { policy, onChange, disabled, currentMetrics, currentQuarter } = props;
  return (
    <>
      <style>{css}</style>
      <div className="pp-root">
        <div>
          <div className="pp-label">Policy Levers</div>
          <PolicyControls values={policy} onChange={onChange} disabled={disabled} />
        </div>
        <div>
          <div className="pp-label">Economic Advisor</div>
          <AIHintSystem 
            country={props.country}
            currentQuarter={props.currentQuarter}
            totalQuarters={props.totalQuarters}
            wisdomScore={props.wisdomScore}
            hintsUsed={props.hintsUsed}
            hintsMax={props.hintsMax}
            currentMetrics={props.currentMetrics}
            currentPolicy={props.policy}
            quarterHistory={props.quarterHistory}
            onHintUsed={props.onHintUsed}
          />
        </div>
      </div>
    </>
  );
}