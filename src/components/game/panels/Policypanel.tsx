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
  metrics:   EconomicMetrics;
  quarter:   number;
}

export function PolicyPanel({ policy, onChange, disabled, metrics, quarter }: PolicyPanelProps) {
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
          <AIHintSystem metrics={metrics} quarter={quarter} policy={policy} />
        </div>
      </div>
    </>
  );
}