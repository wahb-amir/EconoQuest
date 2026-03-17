'use client';

/**
 * CountrySelector — Performance-optimised
 * ─────────────────────────────────────────
 * Problems fixed:
 *
 * 1. Section + renderCard defined INSIDE the parent render function
 *    → Moved outside as module-level components, accepting only what they need
 *    → React.memo prevents re-render unless their specific props change
 *
 * 2. Every useState update re-created ARCHETYPES, SLIDERS, CUSTOM_DEFAULTS
 *    → Moved outside the component (module-level constants, created once)
 *
 * 3. handleFilter / handleStart / loadArchetype / updateMetric recreated on
 *    every render → wrapped in useCallback with correct deps
 *
 * 4. byDiff() ran a full filter on every render → useMemo per tier
 *
 * 5. previewStats array recreated on every render → useMemo on custom values
 *
 * 6. Filter buttons re-rendered as a group even when only active state changed
 *    → FilterButton is a memo'd component; only the button whose active state
 *    changed will re-render
 *
 * 7. The slider onChange fired parseFloat on every event + caused the whole
 *    metrics section to re-render → SliderRow is memo'd, receives only its
 *    own value; updateMetric is stable via useCallback
 */

import React, {
  useState, useMemo, useCallback, memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_TEMPLATES, CountryTemplate, Difficulty } from '@/lib/simulation-engine';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE-LEVEL CONSTANTS  (created once, never recreated)
// ─────────────────────────────────────────────────────────────────────────────

interface CustomMetrics {
  name:             string;
  gdp:              number;
  inflation:        number;
  unemployment:     number;
  debtToGDP:        number;
  publicMood:       number;
  currencyStrength: number;
  reserves:         number;
  innovationIndex:  number;
  avgSalary:        number;
  tradeBalance:     number;
}

const CUSTOM_DEFAULTS: CustomMetrics = {
  name: '', gdp: 2.5, inflation: 3.0, unemployment: 5.0,
  debtToGDP: 50, publicMood: 70, currencyStrength: 100,
  reserves: 100, innovationIndex: 50, avgSalary: 40000, tradeBalance: 0,
};

const ARCHETYPES = [
  {
    label: 'Oil State', icon: '◈',
    desc: 'Flush with reserves, fixed currency, no income tax.',
    metrics: { gdp: 4.0, inflation: 2.5, unemployment: 2.5, debtToGDP: 20,
               publicMood: 65, currencyStrength: 135, reserves: 600,
               innovationIndex: 28, avgSalary: 48000, tradeBalance: 10 },
  },
  {
    label: 'Debt Crisis', icon: '▼',
    desc: 'High growth, crumbling currency, clock is ticking.',
    metrics: { gdp: 5.2, inflation: 14.0, unemployment: 13.0, debtToGDP: 155,
               publicMood: 34, currencyStrength: 52, reserves: 14,
               innovationIndex: 20, avgSalary: 12000, tradeBalance: -7 },
  },
  {
    label: 'Tech Hub', icon: '◉',
    desc: 'Innovation-led, low debt, high wages, expensive imports.',
    metrics: { gdp: 3.8, inflation: 3.4, unemployment: 3.2, debtToGDP: 42,
               publicMood: 72, currencyStrength: 118, reserves: 180,
               innovationIndex: 84, avgSalary: 78000, tradeBalance: -2.5 },
  },
  {
    label: 'Stagnation', icon: '—',
    desc: 'Flat growth, aging population, deflation creeping in.',
    metrics: { gdp: 0.4, inflation: 0.6, unemployment: 6.8, debtToGDP: 112,
               publicMood: 48, currencyStrength: 98, reserves: 240,
               innovationIndex: 55, avgSalary: 44000, tradeBalance: 4.2 },
  },
] as const;

const SLIDERS = [
  { key: 'gdp',              label: 'GDP Growth',        unit: '%',   min: -10, max: 12,  step: 0.1 },
  { key: 'inflation',        label: 'Inflation Rate',    unit: '%',   min: 0,   max: 30,  step: 0.1 },
  { key: 'unemployment',     label: 'Unemployment',      unit: '%',   min: 0,   max: 30,  step: 0.1 },
  { key: 'debtToGDP',        label: 'Debt / GDP',        unit: '%',   min: 0,   max: 200, step: 1   },
  { key: 'publicMood',       label: 'Public Mood',       unit: '/100',min: 10,  max: 100, step: 1   },
  { key: 'currencyStrength', label: 'Currency Strength', unit: 'idx', min: 30,  max: 160, step: 1   },
  { key: 'reserves',         label: 'Reserves',          unit: '$B',  min: 0,   max: 800, step: 5   },
  { key: 'innovationIndex',  label: 'Innovation Index',  unit: 'pts', min: 0,   max: 100, step: 1   },
] as const;

const DIFF_LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_CLASS:  Record<Difficulty, string>  = { easy: 'cs-de', medium: 'cs-dm', hard: 'cs-dh' };

// ─────────────────────────────────────────────────────────────────────────────
// PURE HELPERS  (no closures, no deps)
// ─────────────────────────────────────────────────────────────────────────────

function diffColor(d: Difficulty) {
  return d === 'easy' ? '#2d6a2d' : d === 'medium' ? '#1a4a8a' : '#bf3509';
}

function statColor(key: string, val: number): string {
  if (key === 'gdp')         return val >= 3 ? 'cs-sg' : val < 0 ? 'cs-sw' : 'cs-sn';
  if (key === 'inflation')   return val > 10  ? 'cs-sw' : val < 5 ? 'cs-sg' : 'cs-sn';
  if (key === 'debtToGDP')   return val > 100 ? 'cs-sw' : val < 60 ? 'cs-sg' : 'cs-sn';
  if (key === 'publicMood')  return val > 60  ? 'cs-sg' : val < 40 ? 'cs-sw' : 'cs-sn';
  return 'cs-sn';
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOMIC MEMO COMPONENTS
// Each re-renders ONLY when its own props change
// ─────────────────────────────────────────────────────────────────────────────

// ── Filter button ─────────────────────────────────────────────────────────────
interface FilterBtnProps {
  f: 'all' | Difficulty;
  active: boolean;
  count: number;
  onClick: (f: 'all' | Difficulty) => void;
}
const FilterButton = memo(function FilterButton({ f, active, count, onClick }: FilterBtnProps) {
  const style = active
    ? { background: f === 'all' ? '#1c1409' : diffColor(f as Difficulty),
        color: '#fff',
        borderColor: f === 'all' ? '#1c1409' : diffColor(f as Difficulty) }
    : {};
  return (
    <button className="cs-fbtn" style={style} onClick={() => onClick(f)}>
      {f === 'all' ? 'All Nations' : DIFF_LABELS[f]}
      <span className="cs-fcount">({count})</span>
    </button>
  );
});

// ── Country card ──────────────────────────────────────────────────────────────
interface CardProps {
  tpl: CountryTemplate;
  idx: number;
  selected: boolean;
  onSelect: (name: string) => void;
}
const CountryCard = memo(function CountryCard({ tpl, idx, selected: sel, onSelect }: CardProps) {
  const stats = [
    { label: 'GDP Growth', key: 'gdp',        val: `${tpl.metrics.gdp}%`,          raw: tpl.metrics.gdp },
    { label: 'Debt / GDP', key: 'debtToGDP',  val: `${tpl.metrics.debtToGDP}%`,    raw: tpl.metrics.debtToGDP },
    { label: 'Inflation',  key: 'inflation',  val: `${tpl.metrics.inflation}%`,     raw: tpl.metrics.inflation },
    { label: 'Mood',       key: 'publicMood', val: `${tpl.metrics.publicMood}/100`, raw: tpl.metrics.publicMood },
  ];
  return (
    <motion.div layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: idx * 0.04, duration: 0.18 }}>
      <div className={`cs-card${sel ? ' sel' : ''}`} onClick={() => onSelect(tpl.name)}>
        {sel && <div className="cs-check">✓</div>}
        <div className="cs-card-inner">
          <div className="cs-card-top">
            <span className="cs-card-num">{String(idx + 1).padStart(2, '0')}</span>
            <span className={`cs-dbadge ${DIFF_CLASS[tpl.difficulty]}`}>{DIFF_LABELS[tpl.difficulty]}</span>
          </div>
          <div className="cs-card-name">{tpl.name}</div>
          <div className="cs-card-region">{tpl.region}</div>
          <div className="cs-card-desc">{tpl.description}</div>
          <div className="cs-card-basis">{tpl.realBasis}</div>
        </div>
        <div className="cs-stats">
          {stats.map(s => (
            <div key={s.label} className="cs-stat">
              <div className="cs-stat-lbl">{s.label}</div>
              <div className={`cs-stat-val ${statColor(s.key, s.raw)}`}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

// ── Tier section ──────────────────────────────────────────────────────────────
interface SectionProps {
  diff: Difficulty;
  nations: CountryTemplate[];
  selectedName: string | null;
  onSelect: (name: string) => void;
}
const TierSection = memo(function TierSection({ diff, nations, selectedName, onSelect }: SectionProps) {
  if (!nations.length) return null;
  return (
    <>
      <div className="cs-section-rule">
        {DIFF_LABELS[diff]} — {nations.length} nation{nations.length !== 1 ? 's' : ''}
      </div>
      <div className="cs-grid">
        <AnimatePresence mode="popLayout">
          {nations.map((t, i) => (
            <CountryCard
              key={t.name}
              tpl={t}
              idx={i}
              selected={selectedName === t.name}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
});

// ── Single slider row ────────────────────────────────────────────────────────
interface SliderRowProps {
  sliderKey: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (key: string, val: number) => void;
}
const SliderRow = memo(function SliderRow({
  sliderKey, label, unit, min, max, step, value, onChange,
}: SliderRowProps) {
  const color = statColor(sliderKey, value);
  return (
    <div className="cs-metric-group">
      <div className="cs-metric-row">
        <span className="cs-metric-name">{label}</span>
        <div className="cs-metric-val-box">
          <span className={`cs-metric-num ${color}`}>
            {step < 1 ? value.toFixed(1) : value}
          </span>
          <span className="cs-metric-unit">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        className="cs-slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(sliderKey, parseFloat(e.target.value))}
      />
    </div>
  );
});

// ── Archetype button ─────────────────────────────────────────────────────────
interface ArchBtnProps {
  arch: typeof ARCHETYPES[number];
  onLoad: (a: typeof ARCHETYPES[number]) => void;
}
const ArchetypeButton = memo(function ArchetypeButton({ arch, onLoad }: ArchBtnProps) {
  return (
    <button className="cs-arch-btn" onClick={() => onLoad(arch)}>
      <span className="cs-arch-icon">{arch.icon}</span>
      <span className="cs-arch-name">{arch.label}</span>
      <span className="cs-arch-desc">{arch.desc}</span>
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CSS  (injected once via useEffect in parent, defined outside component)
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
  .cs-root{font-family:'DM Mono','Courier New',monospace;color:#1c1409}
  .cs-root *{box-sizing:border-box;margin:0;padding:0}
  .cs-masthead{margin-bottom:28px;padding-bottom:22px;border-bottom:2px solid rgba(28,20,9,.2)}
  .cs-overtitle{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(28,20,9,.38);margin-bottom:8px}
  .cs-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(44px,7vw,72px);line-height:.88;letter-spacing:.03em;color:#1c1409;margin-bottom:12px}
  .cs-title .acc{color:#bf3509}
  .cs-lead{font-size:13px;color:rgba(28,20,9,.5);line-height:1.75;max-width:520px}
  .cs-filters{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap}
  .cs-fbtn{background:#f2ebe0;border:1.5px solid rgba(28,20,9,.18);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,20,9,.45);padding:8px 16px;cursor:pointer;transition:.14s;white-space:nowrap}
  .cs-fbtn:hover{border-color:rgba(28,20,9,.4);color:#1c1409}
  .cs-fcount{opacity:.65;margin-left:3px}
  .cs-section-rule{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.3);padding:14px 0 10px;display:flex;align-items:center;gap:10px}
  .cs-section-rule::after{content:'';flex:1;height:1px;background:rgba(28,20,9,.1)}
  .cs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:6px}
  .cs-card{background:#fff;border:1.5px solid rgba(28,20,9,.13);box-shadow:0 2px 0 rgba(28,20,9,.11),0 4px 14px rgba(28,20,9,.06);cursor:pointer;transition:transform .14s,box-shadow .14s,border-color .14s;display:flex;flex-direction:column;position:relative;overflow:hidden}
  .cs-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:rgba(28,20,9,.07);transition:background .14s}
  .cs-card:hover{transform:translateY(-3px);box-shadow:0 5px 0 rgba(28,20,9,.11),0 10px 24px rgba(28,20,9,.09);border-color:rgba(28,20,9,.26)}
  .cs-card:hover::before{background:rgba(28,20,9,.2)}
  .cs-card.sel{border-color:#bf3509;box-shadow:0 2px 0 #bf3509,0 6px 20px rgba(191,53,9,.14)}
  .cs-card.sel::before{background:#bf3509}
  .cs-card-inner{padding:18px 16px 14px;flex:1;display:flex;flex-direction:column}
  .cs-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
  .cs-card-num{font-size:9px;letter-spacing:.15em;color:rgba(28,20,9,.22)}
  .cs-dbadge{font-size:7px;letter-spacing:.1em;text-transform:uppercase;padding:2px 8px;font-weight:500}
  .cs-de{background:#eaf3de;color:#3b6d11;border:1px solid #c0dd97}
  .cs-dm{background:#e6f1fb;color:#0c447c;border:1px solid #85b7eb}
  .cs-dh{background:#fcebeb;color:#791f1f;border:1px solid #f09595}
  .cs-card-name{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.04em;color:#1c1409;line-height:1;margin-bottom:2px}
  .cs-card-region{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.3);margin-bottom:9px}
  .cs-card-desc{font-size:11px;color:rgba(28,20,9,.48);line-height:1.65;flex:1;margin-bottom:10px}
  .cs-card-basis{font-size:9px;color:rgba(28,20,9,.26);font-style:italic;padding-top:8px;border-top:1px dashed rgba(28,20,9,.1)}
  .cs-stats{display:grid;grid-template-columns:1fr 1fr;border-top:1.5px solid rgba(28,20,9,.1);background:rgba(28,20,9,.025)}
  .cs-stat{padding:9px 12px;border-right:1px solid rgba(28,20,9,.08)}
  .cs-stat:nth-child(2){border-right:none}
  .cs-stat:nth-child(3){border-top:1px solid rgba(28,20,9,.08);border-right:1px solid rgba(28,20,9,.08)}
  .cs-stat:nth-child(4){border-top:1px solid rgba(28,20,9,.08);border-right:none}
  .cs-stat-lbl{font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.28);margin-bottom:2px}
  .cs-stat-val{font-family:'Bebas Neue',sans-serif;font-size:19px;line-height:1}
  .cs-sg{color:#2d6a2d}.cs-sw{color:#bf3509}.cs-sn{color:#1c1409}
  .cs-check{position:absolute;top:12px;right:12px;width:17px;height:17px;background:#bf3509;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff}
  .cs-empty{padding:44px 20px;text-align:center;font-size:12px;color:rgba(28,20,9,.32);letter-spacing:.06em}
  .cs-custom-wrap{margin-top:8px;margin-bottom:8px}
  .cs-custom-trigger{background:#fff;border:1.5px dashed rgba(28,20,9,.2);box-shadow:0 2px 0 rgba(28,20,9,.08),0 4px 10px rgba(28,20,9,.04);padding:18px 20px;cursor:pointer;display:flex;align-items:center;gap:16px;transition:transform .14s,box-shadow .14s,border-color .14s}
  .cs-custom-trigger:hover{transform:translateY(-2px);box-shadow:0 4px 0 rgba(28,20,9,.1),0 7px 18px rgba(28,20,9,.08);border-color:rgba(28,20,9,.36)}
  .cs-custom-trigger.open{border-style:solid;border-color:#bf3509;box-shadow:0 2px 0 #bf3509,0 5px 14px rgba(191,53,9,.12)}
  .cs-custom-plus{font-family:'Bebas Neue',sans-serif;font-size:32px;color:rgba(28,20,9,.18);line-height:1;flex-shrink:0;transition:transform .2s,color .2s}
  .cs-custom-trigger.open .cs-custom-plus{transform:rotate(45deg);color:#bf3509}
  .cs-custom-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.04em;color:rgba(28,20,9,.4);transition:color .15s}
  .cs-custom-sub{font-size:11px;color:rgba(28,20,9,.3);margin-top:2px}
  .cs-custom-trigger.open .cs-custom-name{color:#bf3509}
  .cs-builder{background:#fff;border:1.5px solid rgba(28,20,9,.15);border-top:none;box-shadow:0 3px 0 rgba(28,20,9,.1),0 6px 16px rgba(28,20,9,.06);overflow:hidden;margin-bottom:8px}
  .cs-builder-name-row{padding:18px 20px 14px;border-bottom:1px solid rgba(28,20,9,.1)}
  .cs-name-input{width:100%;background:#f2ebe0;border:1.5px solid rgba(28,20,9,.18);padding:11px 14px;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.04em;color:#1c1409;outline:none;transition:border-color .12s}
  .cs-name-input:focus{border-color:#bf3509}
  .cs-name-input::placeholder{color:rgba(28,20,9,.2)}
  .cs-field-label{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(28,20,9,.36);margin-bottom:7px;display:block}
  .cs-archetypes{padding:14px 20px;border-bottom:1px solid rgba(28,20,9,.1);display:flex;flex-direction:column;gap:8px}
  .cs-arch-label{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.3);margin-bottom:2px}
  .cs-arch-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .cs-arch-btn{background:#f2ebe0;border:1.5px solid rgba(28,20,9,.14);padding:10px 10px 8px;cursor:pointer;text-align:left;transition:.14s;font-family:'DM Mono',monospace}
  .cs-arch-btn:hover{background:#e9e0d2;border-color:rgba(28,20,9,.3)}
  .cs-arch-icon{font-size:14px;color:#bf3509;margin-bottom:4px;display:block}
  .cs-arch-name{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.04em;color:#1c1409;display:block;margin-bottom:2px}
  .cs-arch-desc{font-size:9px;color:rgba(28,20,9,.42);line-height:1.4}
  .cs-metrics-section{padding:16px 20px}
  .cs-metrics-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  .cs-metrics-title{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.3)}
  .cs-reset-btn{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.4);background:transparent;border:1px solid rgba(28,20,9,.18);padding:3px 10px;cursor:pointer;font-family:'DM Mono',monospace;transition:.12s}
  .cs-reset-btn:hover{color:#bf3509;border-color:#bf3509}
  .cs-metric-groups{display:grid;grid-template-columns:1fr 1fr;gap:0 32px}
  .cs-metric-group{border-bottom:1px solid rgba(28,20,9,.08);padding:11px 0}
  .cs-metric-group:nth-last-child(-n+2){border-bottom:none}
  .cs-metric-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
  .cs-metric-name{font-size:11px;color:#1c1409}
  .cs-metric-val-box{display:flex;align-items:center;gap:8px}
  .cs-metric-num{font-family:'Bebas Neue',sans-serif;font-size:18px;line-height:1;min-width:52px;text-align:right}
  .cs-metric-unit{font-size:9px;color:rgba(28,20,9,.35)}
  .cs-slider{width:100%;height:3px;-webkit-appearance:none;appearance:none;background:rgba(28,20,9,.12);outline:none;cursor:pointer;border-radius:0}
  .cs-slider::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;background:#bf3509;cursor:pointer;border-radius:0;box-shadow:0 1px 0 rgba(100,20,0,.3)}
  .cs-slider::-moz-range-thumb{width:13px;height:13px;background:#bf3509;cursor:pointer;border-radius:0;box-shadow:0 1px 0 rgba(100,20,0,.3);border:none}
  .cs-slider:hover::-webkit-slider-thumb{background:#d94010}
  .cs-preview-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1.5px solid rgba(28,20,9,.1);background:rgba(28,20,9,.025)}
  .cs-preview-cell{padding:9px 14px;border-right:1px solid rgba(28,20,9,.07)}
  .cs-preview-cell:last-child{border-right:none}
  .cs-preview-label{font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.3);margin-bottom:2px}
  .cs-preview-val{font-family:'Bebas Neue',sans-serif;font-size:18px;line-height:1}
  .cs-start-bar{background:#fff;border:1.5px solid rgba(28,20,9,.16);box-shadow:0 2px 0 rgba(28,20,9,.1),0 5px 14px rgba(28,20,9,.06);padding:18px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-top:8px}
  .cs-start-name{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.04em;color:#1c1409;line-height:1;margin-bottom:4px}
  .cs-start-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .cs-start-region{font-size:9px;color:rgba(28,20,9,.36);letter-spacing:.08em;text-transform:uppercase}
  .cs-start-sep{color:rgba(28,20,9,.18);font-size:11px}
  .cs-start-btn{background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.09em;text-transform:uppercase;padding:14px 32px;cursor:pointer;box-shadow:0 2px 0 rgba(100,20,0,.28);transition:background .12s,transform .1s,box-shadow .1s;white-space:nowrap}
  .cs-start-btn:hover{background:#d94010;transform:translateY(-1px);box-shadow:0 3px 0 rgba(100,20,0,.28)}
  .cs-start-btn:active{transform:translateY(0);box-shadow:0 1px 0 rgba(100,20,0,.28)}
  .cs-start-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
  @media(max-width:800px){.cs-grid{grid-template-columns:repeat(2,1fr)}.cs-arch-grid{grid-template-columns:repeat(2,1fr)}.cs-metric-groups{grid-template-columns:1fr}}
  @media(max-width:520px){.cs-grid{grid-template-columns:1fr}.cs-filters{gap:4px}.cs-preview-strip{grid-template-columns:repeat(2,1fr)}.cs-preview-cell:nth-child(2){border-right:none}.cs-preview-cell:nth-child(3){border-top:1px solid rgba(28,20,9,.07)}.cs-preview-cell:nth-child(4){border-top:1px solid rgba(28,20,9,.07);border-right:none}}
`;

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type FilterMode = 'all' | Difficulty;

interface CountrySelectorProps {
  onSelect: (country: CountryTemplate) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelect }) => {

  // ── State ──────────────────────────────────────────────────────────────────
  const [filter,      setFilter]      = useState<FilterMode>('all');
  const [selected,    setSelected]    = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [custom,      setCustom]      = useState<CustomMetrics>({ ...CUSTOM_DEFAULTS });

  // ── Derived / memoised values ──────────────────────────────────────────────

  // Nation counts — never changes (COUNTRY_TEMPLATES is static)
  const counts = useMemo(() => ({
    all:    COUNTRY_TEMPLATES.length,
    easy:   COUNTRY_TEMPLATES.filter(t => t.difficulty === 'easy').length,
    medium: COUNTRY_TEMPLATES.filter(t => t.difficulty === 'medium').length,
    hard:   COUNTRY_TEMPLATES.filter(t => t.difficulty === 'hard').length,
  }), []);

  // Filtered lists per tier — only changes when `filter` changes
  const easyNations   = useMemo(() => COUNTRY_TEMPLATES.filter(t => t.difficulty === 'easy'   && (filter === 'all' || filter === 'easy')),   [filter]);
  const mediumNations = useMemo(() => COUNTRY_TEMPLATES.filter(t => t.difficulty === 'medium' && (filter === 'all' || filter === 'medium')), [filter]);
  const hardNations   = useMemo(() => COUNTRY_TEMPLATES.filter(t => t.difficulty === 'hard'   && (filter === 'all' || filter === 'hard')),   [filter]);

  // Selected template ref — only recomputes when `selected` changes
  const selectedTemplate = useMemo(
    () => selected ? (COUNTRY_TEMPLATES.find(t => t.name === selected) ?? null) : null,
    [selected]
  );

  // Preview strip — only recomputes when relevant custom fields change
  const previewStats = useMemo(() => [
    { label: 'GDP',       key: 'gdp',        val: `${custom.gdp}%`           },
    { label: 'Inflation', key: 'inflation',  val: `${custom.inflation}%`     },
    { label: 'Debt/GDP',  key: 'debtToGDP',  val: `${custom.debtToGDP}%`     },
    { label: 'Mood',      key: 'publicMood', val: `${custom.publicMood}/100` },
  ], [custom.gdp, custom.inflation, custom.debtToGDP, custom.publicMood]);

  const canStart = builderOpen ? custom.name.trim().length > 0 : selected !== null;

  const totalVisible = easyNations.length + mediumNations.length + hardNations.length;

  // ── Stable callbacks (recreated only when deps change) ─────────────────────

  const handleFilter = useCallback((f: FilterMode) => {
    setFilter(f);
    setSelected(null);
    setBuilderOpen(false);
  }, []);

  const handleCardSelect = useCallback((name: string) => {
    setSelected(name);
    setBuilderOpen(false);
  }, []);

  const toggleBuilder = useCallback(() => {
    setBuilderOpen(v => !v);
    setSelected(null);
  }, []);

  // `updateMetric` is passed to each SliderRow — stable reference prevents
  // all 8 sliders re-rendering when one value changes
  const updateMetric = useCallback((key: string, val: number) => {
    setCustom(prev => ({ ...prev, [key]: val }));
  }, []);

  const loadArchetype = useCallback((a: typeof ARCHETYPES[number]) => {
    setCustom(prev => ({ ...prev, ...a.metrics }));
  }, []);

  const resetCustom = useCallback(() => {
    setCustom(prev => ({ ...CUSTOM_DEFAULTS, name: prev.name }));
  }, []);

  const handleStart = useCallback(() => {
    if (builderOpen && custom.name.trim()) {
      onSelect({
        name: custom.name.trim(),
        region: 'Custom',
        difficulty: 'medium',
        realBasis: 'User-defined',
        description: 'A nation forged by your own design.',
        metrics: {
          gdp: custom.gdp, inflation: custom.inflation,
          unemployment: custom.unemployment, debtToGDP: custom.debtToGDP,
          publicMood: custom.publicMood, currencyStrength: custom.currencyStrength,
          reserves: custom.reserves, innovationIndex: custom.innovationIndex,
          avgSalary: custom.avgSalary, tradeBalance: custom.tradeBalance,
        },
      });
    } else if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  }, [builderOpen, custom, selectedTemplate, onSelect]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="cs-root">

        {/* Masthead */}
        <div className="cs-masthead">
          <div className="cs-overtitle">Mission Setup — Choose Your Nation</div>
          <h2 className="cs-title">Pick Your<br /><span className="acc">Mandate.</span></h2>
          <p className="cs-lead">
            Twelve economies across three difficulty tiers, each calibrated from real-world data.
            Select a baseline or build a custom nation with your own starting conditions.
          </p>
        </div>

        {/* Filter buttons — each memo'd; only the toggled one re-renders */}
        <div className="cs-filters">
          {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
            <FilterButton
              key={f}
              f={f}
              active={filter === f}
              count={counts[f]}
              onClick={handleFilter}
            />
          ))}
        </div>

        {/* Nation grids — each TierSection memo'd */}
        <TierSection diff="easy"   nations={easyNations}   selectedName={selected} onSelect={handleCardSelect} />
        <TierSection diff="medium" nations={mediumNations} selectedName={selected} onSelect={handleCardSelect} />
        <TierSection diff="hard"   nations={hardNations}   selectedName={selected} onSelect={handleCardSelect} />

        {totalVisible === 0 && (
          <div className="cs-empty">No nations match this filter.</div>
        )}

        {/* Custom builder */}
        <div className="cs-custom-wrap">
          <div
            className={`cs-custom-trigger${builderOpen ? ' open' : ''}`}
            onClick={toggleBuilder}
          >
            <div className="cs-custom-plus">+</div>
            <div>
              <div className="cs-custom-name">Build a Custom Nation</div>
              <div className="cs-custom-sub">
                {builderOpen
                  ? 'Set every starting metric yourself — name it, tune it, run it.'
                  : 'Define GDP, inflation, debt, mood and more from scratch.'}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {builderOpen && (
              <motion.div className="cs-builder"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}>

                {/* Nation name */}
                <div className="cs-builder-name-row">
                  <label className="cs-field-label">Nation Name</label>
                  <input
                    className="cs-name-input"
                    placeholder="The Republic of…"
                    value={custom.name}
                    onChange={e => setCustom(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && canStart && handleStart()}
                    autoFocus
                  />
                </div>

                {/* Archetype presets — each memo'd */}
                <div className="cs-archetypes">
                  <div className="cs-arch-label">Load a preset — or tune the sliders yourself</div>
                  <div className="cs-arch-grid">
                    {ARCHETYPES.map(a => (
                      <ArchetypeButton key={a.label} arch={a} onLoad={loadArchetype} />
                    ))}
                  </div>
                </div>

                {/* Metric sliders — each SliderRow memo'd, only its own row re-renders */}
                <div className="cs-metrics-section">
                  <div className="cs-metrics-head">
                    <span className="cs-metrics-title">Starting Conditions</span>
                    <button className="cs-reset-btn" onClick={resetCustom}>
                      Reset to Defaults
                    </button>
                  </div>
                  <div className="cs-metric-groups">
                    {SLIDERS.map(s => (
                      <SliderRow
                        key={s.key}
                        sliderKey={s.key}
                        label={s.label}
                        unit={s.unit}
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={custom[s.key as keyof CustomMetrics] as number}
                        onChange={updateMetric}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview strip */}
                <div className="cs-preview-strip">
                  {previewStats.map(p => (
                    <div key={p.label} className="cs-preview-cell">
                      <div className="cs-preview-label">{p.label}</div>
                      <div className={`cs-preview-val ${statColor(p.key, custom[p.key as keyof CustomMetrics] as number)}`}>
                        {p.val}
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Start bar */}
        <AnimatePresence>
          {canStart && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <div className="cs-start-bar">
                <div>
                  <div className="cs-start-name">
                    {builderOpen ? (custom.name.trim() || '…') : selectedTemplate?.name}
                  </div>
                  <div className="cs-start-meta">
                    {builderOpen ? (
                      <span className="cs-start-region">Custom · Your conditions</span>
                    ) : selectedTemplate && (
                      <>
                        <span className="cs-start-region">{selectedTemplate.region}</span>
                        <span className="cs-start-sep">·</span>
                        <span className={`cs-dbadge ${DIFF_CLASS[selectedTemplate.difficulty]}`}>
                          {DIFF_LABELS[selectedTemplate.difficulty]}
                        </span>
                        <span className="cs-start-sep">·</span>
                        <span className="cs-start-region" style={{ fontStyle: 'italic' }}>
                          {selectedTemplate.realBasis}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="cs-start-btn"
                  onClick={handleStart}
                  disabled={builderOpen && !custom.name.trim()}>
                  Begin Simulation →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};