'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const css = `
  .pc-root{font-family:'DM Mono','Courier New',monospace;background:#f2ebe0;border:1px solid rgba(28,20,9,.22)}
  .pc-section{border-bottom:1px solid rgba(28,20,9,.13);padding:20px 20px 16px}
  .pc-section:last-child{border-bottom:none}
  .pc-section-head{font-size:8px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.4);margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .pc-section-head::after{content:'';flex:1;height:1px;background:rgba(28,20,9,.1)}
  .pc-lever{margin-bottom:16px}
  .pc-lever:last-child{margin-bottom:0}
  .pc-lever-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .pc-lever-label{font-size:11px;color:#1c1409;display:flex;align-items:center;gap:7px;letter-spacing:.02em}
  .pc-lever-icon{width:14px;height:14px;flex-shrink:0;opacity:.6}
  .pc-lever-val{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.03em;color:#bf3509;line-height:1}
  .pc-lever-desc{font-size:9px;color:rgba(28,20,9,.38);margin-top:4px;line-height:1.5}
  .pc-danger-box{background:rgba(191,53,9,.05);border:1px solid rgba(191,53,9,.2);padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px}
  .pc-danger-left{display:flex;align-items:center;gap:10px}
  .pc-danger-icon{color:#bf3509;flex-shrink:0;animation:eq-blink 2s step-end infinite}
  .pc-danger-text{}
  .pc-danger-title{font-size:11px;font-weight:500;color:#bf3509;letter-spacing:.04em}
  .pc-danger-sub{font-size:9px;color:rgba(191,53,9,.6);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}
  .pc-disabled{opacity:.45;pointer-events:none}
`;

interface PolicyControlsProps {
  values: {
    taxRate: number; interestRate: number; spending: number;
    moneyPrinting: boolean; rdInvestment: number; tariffLevel: number;
    foreignLending: number; investmentRisk: number;
  };
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}

function Lever({
  icon, label, desc, value, unit, field, max, step, color = '#bf3509', onChange, disabled
}: {
  icon: React.ReactNode; label: string; desc: string;
  value: number; unit: string; field: string;
  max: number; step: number; color?: string;
  onChange: (k: string, v: any) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`pc-lever${disabled ? ' pc-disabled' : ''}`}>
      <div className="pc-lever-head">
        <span className="pc-lever-label">
          <span className="pc-lever-icon">{icon}</span>
          {label}
        </span>
        <span className="pc-lever-val" style={{ color }}>{value}{unit}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={v => onChange(field, v[0])}
        max={max} step={step}
        disabled={disabled}
      />
      <div className="pc-lever-desc">{desc}</div>
    </div>
  );
}

const I = (char: string) => (
  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, opacity: .7 }}>{char}</span>
);

export const PolicyControls: React.FC<PolicyControlsProps> = ({ values, onChange, disabled }) => (
  <>
    <style>{css}</style>
    <div className={`pc-root${disabled ? ' pc-disabled' : ''}`}>
      <div className="pc-section">
        <div className="pc-section-head">Fiscal &amp; Monetary</div>
        <Lever icon={I('¶')} label="Corporate Tax" desc="Higher tax funds spending but dampens business investment." value={values.taxRate} unit="%" field="taxRate" max={60} step={1} onChange={onChange} disabled={disabled} />
        <Lever icon={I('∫')} label="Interest Rate" desc="Controls borrowing cost. Raise to cool inflation; lower to stimulate." value={values.interestRate} unit="%" field="interestRate" max={30} step={0.25} onChange={onChange} disabled={disabled} />
        <Lever icon={I('Σ')} label="Public Spending" desc="Government expenditure as % of GDP. Multiplier effect applies." value={values.spending} unit="%" field="spending" max={80} step={1} onChange={onChange} disabled={disabled} />
      </div>

      <div className="pc-section">
        <div className="pc-section-head">Strategic Investment</div>
        <Lever icon={I('λ')} label="R&amp;D Commitment" desc="Shifts productivity frontier over time. Long-run payoff." value={values.rdInvestment} unit="%" field="rdInvestment" max={20} step={0.5} color="#2d6a2d" onChange={onChange} disabled={disabled} />
        <Lever icon={I('↯')} label="Foreign Lending" desc="Interest income vs. geopolitical exposure trade-off." value={values.foreignLending} unit="%" field="foreignLending" max={10} step={0.5} color="#2d6a2d" onChange={onChange} disabled={disabled} />
        <Lever icon={I('∆')} label="Wealth Fund Risk" desc="Higher risk allocation increases potential returns and volatility." value={values.investmentRisk} unit="%" field="investmentRisk" max={100} step={1} color="#1a4a8a" onChange={onChange} disabled={disabled} />
      </div>

      <div className="pc-section">
        <div className="pc-section-head">Trade &amp; Emergency</div>
        <Lever icon={I('⊗')} label="Tariff Level" desc="Protects domestic industry. Risks retaliatory trade action." value={values.tariffLevel} unit="%" field="tariffLevel" max={50} step={1} color="#6b3fa0" onChange={onChange} disabled={disabled} />

        <div className={`pc-danger-box${disabled ? ' pc-disabled' : ''}`} style={{ marginTop: 16 }}>
          <div className="pc-danger-left">
            <span className="pc-danger-icon">
              <span style={{ fontSize: 18 }}>⚠</span>
            </span>
            <div className="pc-danger-text">
              <div className="pc-danger-title">Print Currency</div>
              <div className="pc-danger-sub">Emergency liquidity injection</div>
            </div>
          </div>
          <Switch
            checked={values.moneyPrinting}
            onCheckedChange={v => onChange('moneyPrinting', v)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  </>
);
