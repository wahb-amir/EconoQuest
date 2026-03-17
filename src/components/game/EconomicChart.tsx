'use client';

import React, { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { QuarterData } from '@/lib/simulation-engine';

const css = `
  .ec-root{background:#f2ebe0;border:1px solid rgba(28,20,9,.22);font-family:'DM Mono','Courier New',monospace}
  .ec-toolbar{display:flex;border-bottom:1px solid rgba(28,20,9,.13);padding:0}
  .ec-toggle{background:transparent;border:none;border-right:1px solid rgba(28,20,9,.13);padding:10px 16px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,20,9,.45);cursor:pointer;transition:.12s}
  .ec-toggle:last-child{border-right:none}
  .ec-toggle.active{color:#bf3509;background:rgba(191,53,9,.04)}
  .ec-toggle:hover:not(.active){color:#1c1409}
  .ec-chart-wrap{padding:20px 16px 8px}
  .ec-legend{display:flex;gap:16px;padding:8px 16px 14px;flex-wrap:wrap}
  .ec-leg-item{display:flex;align-items:center;gap:6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.5)}
  .ec-leg-dot{width:8px;height:2px;flex-shrink:0}
  .ec-leg-dot.dashed{background:repeating-linear-gradient(90deg,currentColor 0,currentColor 3px,transparent 3px,transparent 6px)}
  .ec-empty{padding:48px;text-align:center;font-size:11px;color:rgba(28,20,9,.35);letter-spacing:.06em}
`;

const SERIES = [
  { key: 'gdp',          label: 'GDP Growth',   color: '#2d6a2d',              dashed: false },
  { key: 'inflation',    label: 'Inflation',    color: '#bf3509',              dashed: false },
  { key: 'unemployment', label: 'Unemployment', color: '#1c1409',              dashed: false },
  { key: 'debt',         label: 'Debt (scaled)', color: 'rgba(28,20,9,.35)',  dashed: true  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1c1409', border: 'none', padding: '10px 14px',
      fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#f2ebe0',
      lineHeight: 1.7
    }}>
      <div style={{ fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6, opacity: .6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: p.color, fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em' }}>{p.name}</span>
          <span style={{ fontWeight: 500 }}>{p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

export const EconomicChart: React.FC<{ history: QuarterData[] }> = ({ history }) => {
  const [mode, setMode] = useState<'area' | 'line'>('area');
  const [active, setActive] = useState<Set<string>>(new Set(['gdp', 'inflation', 'unemployment']));

  const toggle = (k: string) =>
    setActive(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const data = history.map(h => ({
    name: `Q${h.quarter}`,
    gdp:          parseFloat(h.metrics.gdp.toFixed(2)),
    inflation:    parseFloat(h.metrics.inflation.toFixed(2)),
    unemployment: parseFloat(h.metrics.unemployment.toFixed(2)),
    debt:         parseFloat((h.metrics.debtToGDP / 10).toFixed(2)),
  }));

  if (data.length < 2) {
    return (
      <>
        <style>{css}</style>
        <div className="ec-root"><div className="ec-empty">Data will appear after the first quarter advance.</div></div>
      </>
    );
  }

  const axisStyle = { fontSize: 9, fontFamily: 'DM Mono, monospace', fill: 'rgba(28,20,9,.4)', letterSpacing: '.06em' };
  const gridStroke = 'rgba(28,20,9,.07)';

  return (
    <>
      <style>{css}</style>
      <div className="ec-root">
        <div className="ec-toolbar">
          <button className={`ec-toggle${mode === 'area' ? ' active' : ''}`} onClick={() => setMode('area')}>Area</button>
          <button className={`ec-toggle${mode === 'line' ? ' active' : ''}`} onClick={() => setMode('line')}>Line</button>
          <div style={{ flex: 1 }} />
          {SERIES.map(s => (
            <button
              key={s.key}
              className={`ec-toggle${active.has(s.key) ? ' active' : ''}`}
              onClick={() => toggle(s.key)}
              style={{ color: active.has(s.key) ? s.color : undefined, borderRight: '1px solid rgba(28,20,9,.13)', borderLeft: 'none' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="ec-chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            {mode === 'area' ? (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  {SERIES.map(s => (
                    <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={s.color} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(28,20,9,.15)', strokeWidth: 1 }} />
                {SERIES.map(s => active.has(s.key) && (
                  <Area
                    key={s.key} type="monotone" dataKey={s.key} name={s.label}
                    stroke={s.color} strokeWidth={2}
                    strokeDasharray={s.dashed ? '5 5' : undefined}
                    fill={`url(#fill-${s.key})`} dot={false}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(28,20,9,.15)', strokeWidth: 1 }} />
                {SERIES.map(s => active.has(s.key) && (
                  <Line
                    key={s.key} type="monotone" dataKey={s.key} name={s.label}
                    stroke={s.color} strokeWidth={2}
                    strokeDasharray={s.dashed ? '5 5' : undefined}
                    dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: s.color }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="ec-legend">
          {SERIES.map(s => (
            <div key={s.key} className="ec-leg-item" style={{ opacity: active.has(s.key) ? 1 : .3 }}>
              <div className={`ec-leg-dot${s.dashed ? ' dashed' : ''}`} style={{ background: s.dashed ? undefined : s.color, color: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
