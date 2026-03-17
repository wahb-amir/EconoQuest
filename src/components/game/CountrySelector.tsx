'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_TEMPLATES, CountryTemplate, Difficulty } from '@/lib/simulation-engine';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

  .cs-root{font-family:'DM Mono','Courier New',monospace;color:#1c1409}
  .cs-root *{box-sizing:border-box;margin:0;padding:0}

  /* Masthead */
  .cs-masthead{margin-bottom:28px;padding-bottom:22px;border-bottom:2px solid rgba(28,20,9,.2)}
  .cs-overtitle{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(28,20,9,.38);margin-bottom:8px}
  .cs-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(44px,7vw,72px);line-height:.88;letter-spacing:.03em;color:#1c1409;margin-bottom:12px}
  .cs-title .acc{color:#bf3509}
  .cs-lead{font-size:13px;color:rgba(28,20,9,.5);line-height:1.75;max-width:520px}

  /* Filters — spaced pill buttons, not a flush bar */
  .cs-filters{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap}
  .cs-fbtn{background:#f2ebe0;border:1.5px solid rgba(28,20,9,.18);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,20,9,.45);padding:8px 16px;cursor:pointer;transition:.14s;white-space:nowrap}
  .cs-fbtn:hover{border-color:rgba(28,20,9,.4);color:#1c1409}
  .cs-fbtn.fa{background:#1c1409;color:#f2ebe0;border-color:#1c1409}
  .cs-fbtn.fe{background:#2d6a2d;color:#fff;border-color:#2d6a2d}
  .cs-fbtn.fm{background:#1a4a8a;color:#fff;border-color:#1a4a8a}
  .cs-fbtn.fh{background:#bf3509;color:#fff;border-color:#bf3509}
  .cs-fcount{opacity:.65;margin-left:3px}

  /* Section rules between tiers */
  .cs-section-rule{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,20,9,.3);padding:14px 0 10px;display:flex;align-items:center;gap:10px}
  .cs-section-rule::after{content:'';flex:1;height:1px;background:rgba(28,20,9,.1)}

  /* Card grid — gap creates the separation */
  .cs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:6px}

  /* Card — raised with bottom shadow for 3D depth */
  .cs-card{
    background:#fff;
    border:1.5px solid rgba(28,20,9,.13);
    box-shadow:0 2px 0 rgba(28,20,9,.11), 0 4px 14px rgba(28,20,9,.06);
    cursor:pointer;
    transition:transform .14s, box-shadow .14s, border-color .14s;
    display:flex;flex-direction:column;
    position:relative;
    overflow:hidden;
  }
  /* Coloured top accent line */
  .cs-card::before{
    content:'';position:absolute;top:0;left:0;right:0;height:3px;
    background:rgba(28,20,9,.07);transition:background .14s;
  }
  .cs-card:hover{
    transform:translateY(-3px);
    box-shadow:0 5px 0 rgba(28,20,9,.11), 0 10px 24px rgba(28,20,9,.09);
    border-color:rgba(28,20,9,.26);
  }
  .cs-card:hover::before{background:rgba(28,20,9,.2)}
  .cs-card.sel{
    border-color:#bf3509;
    box-shadow:0 2px 0 #bf3509, 0 6px 20px rgba(191,53,9,.14);
  }
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

  /* Stats grid — sunken into bottom of card */
  .cs-stats{display:grid;grid-template-columns:1fr 1fr;border-top:1.5px solid rgba(28,20,9,.1);background:rgba(28,20,9,.025)}
  .cs-stat{padding:9px 12px;border-right:1px solid rgba(28,20,9,.08)}
  .cs-stat:nth-child(2){border-right:none}
  .cs-stat:nth-child(3){border-top:1px solid rgba(28,20,9,.08);border-right:1px solid rgba(28,20,9,.08)}
  .cs-stat:nth-child(4){border-top:1px solid rgba(28,20,9,.08);border-right:none}
  .cs-stat-lbl{font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.28);margin-bottom:2px}
  .cs-stat-val{font-family:'Bebas Neue',sans-serif;font-size:19px;line-height:1}
  .cs-sg{color:#2d6a2d}
  .cs-sw{color:#bf3509}
  .cs-sn{color:#1c1409}

  .cs-check{position:absolute;top:12px;right:12px;width:17px;height:17px;background:#bf3509;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff}

  /* Custom card — dashed border, same depth treatment */
  .cs-custom-wrap{margin-top:8px;margin-bottom:8px}
  .cs-custom{
    background:#fff;
    border:1.5px dashed rgba(28,20,9,.2);
    box-shadow:0 2px 0 rgba(28,20,9,.08), 0 4px 10px rgba(28,20,9,.04);
    padding:18px 20px;cursor:pointer;
    display:flex;align-items:center;gap:16px;
    transition:transform .14s,box-shadow .14s,border-color .14s;
  }
  .cs-custom:hover{
    transform:translateY(-2px);
    box-shadow:0 4px 0 rgba(28,20,9,.1),0 7px 18px rgba(28,20,9,.08);
    border-color:rgba(28,20,9,.36);
  }
  .cs-custom.sel{
    border-style:solid;border-color:#bf3509;
    box-shadow:0 2px 0 #bf3509,0 5px 14px rgba(191,53,9,.12);
  }
  .cs-custom-plus{font-family:'Bebas Neue',sans-serif;font-size:32px;color:rgba(28,20,9,.18);line-height:1;flex-shrink:0}
  .cs-custom-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.04em;color:rgba(28,20,9,.4)}
  .cs-custom-sub{font-size:11px;color:rgba(28,20,9,.3);margin-top:2px}

  /* Form */
  .cs-form{background:#e9e0d2;border:1.5px solid rgba(28,20,9,.15);padding:16px 18px;margin-bottom:8px;overflow:hidden}
  .cs-form-group{flex:1}
  .cs-form-label{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(28,20,9,.38);margin-bottom:7px;display:block}
  .cs-form-input{width:100%;background:#f2ebe0;border:1.5px solid rgba(28,20,9,.2);padding:10px 12px;font-family:'DM Mono',monospace;font-size:13px;color:#1c1409;outline:none;transition:border-color .12s}
  .cs-form-input:focus{border-color:#bf3509}
  .cs-form-input::placeholder{color:rgba(28,20,9,.25)}

  /* Start bar — raised, like a CTA panel */
  .cs-start-bar{
    background:#fff;
    border:1.5px solid rgba(28,20,9,.16);
    box-shadow:0 2px 0 rgba(28,20,9,.1),0 5px 14px rgba(28,20,9,.06);
    padding:18px 20px;
    display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;
    margin-top:8px;
  }
  .cs-start-name{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.04em;color:#1c1409;line-height:1;margin-bottom:4px}
  .cs-start-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .cs-start-region{font-size:9px;color:rgba(28,20,9,.36);letter-spacing:.08em;text-transform:uppercase}
  .cs-start-sep{color:rgba(28,20,9,.18);font-size:11px}
  .cs-start-btn{
    background:#bf3509;color:#fff;border:none;
    font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.09em;text-transform:uppercase;
    padding:14px 32px;cursor:pointer;
    box-shadow:0 2px 0 rgba(100,20,0,.28);
    transition:background .12s, transform .1s, box-shadow .1s;
    white-space:nowrap;
  }
  .cs-start-btn:hover{background:#d94010;transform:translateY(-1px);box-shadow:0 3px 0 rgba(100,20,0,.28)}
  .cs-start-btn:active{transform:translateY(0);box-shadow:0 1px 0 rgba(100,20,0,.28)}

  .cs-empty{padding:44px 20px;text-align:center;font-size:12px;color:rgba(28,20,9,.32);letter-spacing:.06em}

  @media(max-width:800px){.cs-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.cs-grid{grid-template-columns:1fr}.cs-filters{gap:4px}}
`;

type FilterMode = 'all' | Difficulty;

const DIFF_LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_CLASS: Record<Difficulty, string>  = { easy: 'cs-de', medium: 'cs-dm', hard: 'cs-dh' };
const FILTER_CLASS: Record<string, string>    = { all: 'fa', easy: 'fe', medium: 'fm', hard: 'fh' };

function diffColor(d: Difficulty) {
  return d === 'easy' ? '#2d6a2d' : d === 'medium' ? '#1a4a8a' : '#bf3509';
}

function statColor(key: string, val: number): string {
  if (key === 'gdp')       return val >= 3 ? 'cs-sg' : val < 0 ? 'cs-sw' : 'cs-sn';
  if (key === 'inflation') return val > 10  ? 'cs-sw' : val < 5 ? 'cs-sg' : 'cs-sn';
  if (key === 'debtToGDP') return val > 100 ? 'cs-sw' : val < 60 ? 'cs-sg' : 'cs-sn';
  if (key === 'publicMood')return val > 60  ? 'cs-sg' : val < 40 ? 'cs-sw' : 'cs-sn';
  return 'cs-sn';
}

interface CountrySelectorProps {
  onSelect: (country: CountryTemplate) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelect }) => {
  const [filter,     setFilter]     = useState<FilterMode>('all');
  const [selected,   setSelected]   = useState<string | null>(null);
  const [isCustom,   setIsCustom]   = useState(false);
  const [customName, setCustomName] = useState('');

  const counts = useMemo(() => ({
    easy:   COUNTRY_TEMPLATES.filter(t => t.difficulty === 'easy').length,
    medium: COUNTRY_TEMPLATES.filter(t => t.difficulty === 'medium').length,
    hard:   COUNTRY_TEMPLATES.filter(t => t.difficulty === 'hard').length,
  }), []);

  const byDiff = (d: Difficulty) =>
    COUNTRY_TEMPLATES.filter(t => t.difficulty === d &&
      (filter === 'all' || filter === d));

  const selectedTemplate = selected
    ? COUNTRY_TEMPLATES.find(t => t.name === selected) ?? null
    : null;

  const canStart = isCustom ? customName.trim().length > 0 : selected !== null;

  const handleFilter = (f: FilterMode) => {
    setFilter(f);
    setSelected(null);
    setIsCustom(false);
  };

  const handleStart = () => {
    if (isCustom && customName.trim()) {
      onSelect({
        name: customName.trim(), region: 'Custom', difficulty: 'medium',
        realBasis: 'User-defined',
        description: 'A nation forged by your own design. Balanced starting conditions.',
        metrics: {
          inflation: 3.0, unemployment: 5.0, gdp: 2.5, publicMood: 70,
          avgSalary: 40000, debtToGDP: 50, currencyStrength: 100,
          tradeBalance: 0, innovationIndex: 50, reserves: 100,
        },
      });
    } else if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  const renderCard = (tpl: CountryTemplate, idx: number) => {
    const sel = selected === tpl.name;
    const stats = [
      { label: 'GDP Growth', key: 'gdp',        val: `${tpl.metrics.gdp}%`,          raw: tpl.metrics.gdp },
      { label: 'Debt / GDP', key: 'debtToGDP',  val: `${tpl.metrics.debtToGDP}%`,    raw: tpl.metrics.debtToGDP },
      { label: 'Inflation',  key: 'inflation',  val: `${tpl.metrics.inflation}%`,     raw: tpl.metrics.inflation },
      { label: 'Mood',       key: 'publicMood', val: `${tpl.metrics.publicMood}/100`, raw: tpl.metrics.publicMood },
    ];

    return (
      <motion.div
        key={tpl.name}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ delay: idx * 0.04, duration: 0.18 }}
      >
        <div
          className={`cs-card${sel ? ' sel' : ''}`}
          onClick={() => { setSelected(tpl.name); setIsCustom(false); }}
        >
          {sel && <div className="cs-check">✓</div>}
          <div className="cs-card-inner">
            <div className="cs-card-top">
              <span className="cs-card-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className={`cs-dbadge ${DIFF_CLASS[tpl.difficulty]}`}>
                {DIFF_LABELS[tpl.difficulty]}
              </span>
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
  };

  const Section = ({ diff }: { diff: Difficulty }) => {
    const nations = byDiff(diff);
    if (nations.length === 0) return null;
    return (
      <>
        <div className="cs-section-rule">
          {DIFF_LABELS[diff]} — {nations.length} nation{nations.length !== 1 ? 's' : ''}
        </div>
        <div className="cs-grid">
          <AnimatePresence mode="popLayout">
            {nations.map((t, i) => renderCard(t, i))}
          </AnimatePresence>
        </div>
      </>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="cs-root">

        {/* Masthead */}
        <div className="cs-masthead">
          <div className="cs-overtitle">Mission Setup — Choose Your Nation</div>
          <h2 className="cs-title">Pick Your<br /><span className="acc">Mandate.</span></h2>
          <p className="cs-lead">
            Twelve economies across three difficulty tiers, each calibrated from real-world data.
            Select a baseline or define your own nation from scratch.
          </p>
        </div>

        {/* Filters */}
        <div className="cs-filters">
          {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
            <button
              key={f}
              className={`cs-fbtn${filter === f ? ' c' + FILTER_CLASS[f] : ''}`}
              style={filter === f ? {
                background: f === 'all' ? '#1c1409' : diffColor(f as Difficulty),
                color: '#fff',
                borderColor: f === 'all' ? '#1c1409' : diffColor(f as Difficulty),
              } : {}}
              onClick={() => handleFilter(f)}
            >
              {f === 'all' ? 'All Nations' : DIFF_LABELS[f]}
              <span className="cs-fcount">
                ({f === 'all' ? COUNTRY_TEMPLATES.length : counts[f as Difficulty]})
              </span>
            </button>
          ))}
        </div>

        {/* Nation sections by tier */}
        <Section diff="easy" />
        <Section diff="medium" />
        <Section diff="hard" />

        {COUNTRY_TEMPLATES.filter(t => filter === 'all' || t.difficulty === filter).length === 0 && (
          <div className="cs-empty">No nations match this filter.</div>
        )}

        {/* Custom nation */}
        <div className="cs-custom-wrap">
          <div
            className={`cs-custom${isCustom ? ' sel' : ''}`}
            onClick={() => { setIsCustom(true); setSelected(null); }}
          >
            <div className="cs-custom-plus">+</div>
            <div>
              <div className="cs-custom-name">Custom Nation</div>
              <div className="cs-custom-sub">
                Balanced defaults — inflation 3%, debt 50%, mood 70. Name it yourself.
              </div>
            </div>
          </div>
        </div>

        {/* Custom name form */}
        <AnimatePresence>
          {isCustom && (
            <motion.div
              className="cs-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="cs-form-group">
                <label className="cs-form-label">Nation Name</label>
                <input
                  className="cs-form-input"
                  placeholder="The Republic of…"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canStart && handleStart()}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start bar */}
        <AnimatePresence>
          {canStart && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div className="cs-start-bar">
                <div>
                  <div className="cs-start-name">
                    {isCustom ? (customName || '…') : selectedTemplate?.name}
                  </div>
                  <div className="cs-start-meta">
                    {!isCustom && selectedTemplate && (
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
                    {isCustom && (
                      <span className="cs-start-region">Custom · Balanced defaults</span>
                    )}
                  </div>
                </div>
                <button className="cs-start-btn" onClick={handleStart}>
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