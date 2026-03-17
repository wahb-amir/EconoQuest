'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EconomicMetrics } from '@/lib/simulation-engine';

const css = `
  .mx-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:rgba(28,20,9,.13)}
  .mx-cell{background:#f2ebe0;padding:18px 16px;transition:background .15s;cursor:default;position:relative;overflow:hidden}
  .mx-cell:hover{background:#e9e0d2}
  .mx-cell::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:transparent;transition:background .15s}
  .mx-cell:hover::before{background:#bf3509}
  .mx-cell.warn::before{background:#bf3509}
  .mx-cell.good::before{background:#2d6a2d}
  .mx-label{font-size:8px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,20,9,.45);margin-bottom:8px;font-family:'DM Mono','Courier New',monospace}
  .mx-value-row{display:flex;align-items:baseline;gap:4px;margin-bottom:4px}
  .mx-value{font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;color:#1c1409;letter-spacing:.03em}
  .mx-value.warn{color:#bf3509}
  .mx-value.good{color:#2d6a2d}
  .mx-unit{font-size:10px;color:rgba(28,20,9,.45);font-family:'DM Mono',monospace}
  .mx-trend-row{display:flex;align-items:center;gap:5px}
  .mx-trend-badge{font-size:8px;font-weight:500;letter-spacing:.06em;padding:1px 5px;font-family:'DM Mono',monospace}
  .mx-trend-up{color:#2d6a2d;background:rgba(45,106,45,.08)}
  .mx-trend-down{color:#bf3509;background:rgba(191,53,9,.08)}
  .mx-trend-stable{color:rgba(28,20,9,.4);background:rgba(28,20,9,.05)}
  .mx-desc{font-size:9px;color:rgba(28,20,9,.38);line-height:1.5;margin-top:6px;font-family:'DM Mono',monospace}
  @media(max-width:900px){.mx-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:480px){.mx-grid{grid-template-columns:1fr 1fr}}
`;

interface Metric {
  label: string;
  value: number;
  unit: string;
  isCurrency?: boolean;
  desc: string;
  status: 'warn' | 'good' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  delta?: number;
}

function getTrend(curr: number, prev?: number): 'up' | 'down' | 'stable' {
  if (prev === undefined) return 'stable';
  if (Math.abs(curr - prev) < 0.05) return 'stable';
  return curr > prev ? 'up' : 'down';
}

function getDelta(curr: number, prev?: number): number {
  if (prev === undefined) return 0;
  return parseFloat((curr - prev).toFixed(2));
}

function Cell({ m }: { m: Metric }) {
  const formattedValue = m.isCurrency
    ? `$${m.value.toLocaleString()}`
    : m.value.toFixed(1);

  const trendLabel =
    m.trend === 'stable' ? '— flat'
    : m.delta !== undefined
      ? `${m.trend === 'up' ? '▲' : '▼'} ${Math.abs(m.delta)}`
      : m.trend === 'up' ? '▲' : '▼';

  return (
    <motion.div
      className={`mx-cell${m.status !== 'neutral' ? ` ${m.status}` : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <div className="mx-label">{m.label}</div>
      <div className="mx-value-row">
        <AnimatePresence mode="wait">
          <motion.span
            key={formattedValue}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className={`mx-value${m.status !== 'neutral' ? ` ${m.status}` : ''}`}
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
        <span className="mx-unit">{m.unit}</span>
      </div>
      <div className="mx-trend-row">
        <span className={`mx-trend-badge mx-trend-${m.trend}`}>{trendLabel}</span>
      </div>
      <div className="mx-desc">{m.desc}</div>
    </motion.div>
  );
}

export const MetricDashboard: React.FC<{
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
}> = ({ metrics: m, previousMetrics: p }) => {
  const cells: Metric[] = [
    {
      label: 'Reserves',
      value: m.reserves, unit: 'B', isCurrency: true,
      desc: 'Sovereign wealth fund balance',
      trend: getTrend(m.reserves, p?.reserves),
      delta: getDelta(m.reserves, p?.reserves),
      status: m.reserves < 50 ? 'warn' : 'good',
    },
    {
      label: 'GDP Growth',
      value: m.gdp, unit: '%',
      desc: 'Quarterly output change',
      trend: getTrend(m.gdp, p?.gdp),
      delta: getDelta(m.gdp, p?.gdp),
      status: m.gdp < 0 ? 'warn' : m.gdp > 3 ? 'good' : 'neutral',
    },
    {
      label: 'Inflation',
      value: m.inflation, unit: '%',
      desc: 'Purchasing power erosion',
      trend: getTrend(m.inflation, p?.inflation),
      delta: getDelta(m.inflation, p?.inflation),
      status: m.inflation > 8 ? 'warn' : m.inflation < 4 ? 'good' : 'neutral',
    },
    {
      label: 'Unemployment',
      value: m.unemployment, unit: '%',
      desc: 'Workforce without jobs',
      trend: getTrend(m.unemployment, p?.unemployment),
      delta: getDelta(m.unemployment, p?.unemployment),
      status: m.unemployment > 10 ? 'warn' : m.unemployment < 4 ? 'good' : 'neutral',
    },
    {
      label: 'Debt / GDP',
      value: m.debtToGDP, unit: '%',
      desc: 'National leverage ratio',
      trend: getTrend(m.debtToGDP, p?.debtToGDP),
      delta: getDelta(m.debtToGDP, p?.debtToGDP),
      status: m.debtToGDP > 120 ? 'warn' : m.debtToGDP < 60 ? 'good' : 'neutral',
    },
    {
      label: 'Currency',
      value: m.currencyStrength, unit: 'idx',
      desc: 'Relative to reserve basket',
      trend: getTrend(m.currencyStrength, p?.currencyStrength),
      delta: getDelta(m.currencyStrength, p?.currencyStrength),
      status: m.currencyStrength < 70 ? 'warn' : m.currencyStrength > 105 ? 'good' : 'neutral',
    },
    {
      label: 'Trade Balance',
      value: m.tradeBalance, unit: '%',
      desc: 'Exports minus imports',
      trend: getTrend(m.tradeBalance, p?.tradeBalance),
      delta: getDelta(m.tradeBalance, p?.tradeBalance),
      status: m.tradeBalance < -5 ? 'warn' : m.tradeBalance > 2 ? 'good' : 'neutral',
    },
    {
      label: 'Innovation',
      value: m.innovationIndex, unit: 'pts',
      desc: 'Tech and research output',
      trend: getTrend(m.innovationIndex, p?.innovationIndex),
      delta: getDelta(m.innovationIndex, p?.innovationIndex),
      status: m.innovationIndex < 30 ? 'warn' : m.innovationIndex > 70 ? 'good' : 'neutral',
    },
    {
      label: 'Avg Salary',
      value: m.avgSalary, unit: '/yr', isCurrency: true,
      desc: 'Mean household income',
      trend: getTrend(m.avgSalary, p?.avgSalary),
      delta: getDelta(m.avgSalary, p?.avgSalary),
      status: m.avgSalary < 25000 ? 'warn' : m.avgSalary > 55000 ? 'good' : 'neutral',
    },
    {
      label: 'Public Mood',
      value: m.publicMood, unit: '/100',
      desc: 'Citizen approval index',
      trend: getTrend(m.publicMood, p?.publicMood),
      delta: getDelta(m.publicMood, p?.publicMood),
      status: m.publicMood < 35 ? 'warn' : m.publicMood > 70 ? 'good' : 'neutral',
    },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="mx-grid">
        {cells.map(c => <Cell key={c.label} m={c} />)}
      </div>
    </>
  );
};
