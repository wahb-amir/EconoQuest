'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_TEMPLATES, CountryTemplate } from '@/lib/simulation-engine';

const css = `
  .cs-root{font-family:'DM Mono','Courier New',monospace;color:#1c1409}
  .cs-masthead{margin-bottom:40px;border-bottom:2px solid rgba(28,20,9,.22);padding-bottom:28px}
  .cs-overtitle{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(28,20,9,.4);margin-bottom:8px}
  .cs-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,8vw,88px);line-height:.88;letter-spacing:.03em;color:#1c1409;margin-bottom:16px}
  .cs-title .acc{color:#bf3509}
  .cs-lead{font-size:13px;color:rgba(28,20,9,.55);line-height:1.75;max-width:480px}
  .cs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(28,20,9,.13);margin-bottom:1px}
  .cs-custom-row{background:rgba(28,20,9,.13);padding:1px}
  .cs-card{background:#f2ebe0;padding:24px;cursor:pointer;transition:background .15s;border-top:2px solid transparent;position:relative}
  .cs-card:hover{background:#e9e0d2}
  .cs-card.selected{border-top-color:#bf3509;background:#e9e0d2}
  .cs-card-num{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:rgba(28,20,9,.3);margin-bottom:14px}
  .cs-card-name{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.04em;color:#1c1409;margin-bottom:4px}
  .cs-card-desc{font-size:11px;color:rgba(28,20,9,.5);line-height:1.65;margin-bottom:16px;min-height:48px}
  .cs-card-stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(28,20,9,.1);border-top:1px solid rgba(28,20,9,.1)}
  .cs-stat{background:#f2ebe0;padding:10px 12px}
  .cs-card.selected .cs-stat{background:#e9e0d2}
  .cs-stat-label{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.35);margin-bottom:3px}
  .cs-stat-val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#bf3509;line-height:1}
  .cs-check{position:absolute;top:16px;right:16px;width:18px;height:18px;background:#bf3509;display:flex;align-items:center;justify-content:center}
  .cs-check-mark{color:#fff;font-size:10px}
  .cs-custom-card{background:#f2ebe0;padding:24px;cursor:pointer;transition:background .15s;border-top:2px solid transparent}
  .cs-custom-card:hover{background:#e9e0d2}
  .cs-custom-card.selected{border-top-color:#bf3509;background:#e9e0d2}
  .cs-custom-inner{display:flex;align-items:center;gap:20px}
  .cs-custom-plus{font-family:'Bebas Neue',sans-serif;font-size:32px;color:rgba(28,20,9,.25);line-height:1}
  .cs-custom-text{}
  .cs-custom-name{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.04em;color:rgba(28,20,9,.5)}
  .cs-custom-desc{font-size:11px;color:rgba(28,20,9,.35);margin-top:2px}
  .cs-form{background:#e9e0d2;border-top:1px solid rgba(28,20,9,.13);padding:24px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}
  .cs-form-group{flex:1;min-width:200px}
  .cs-form-label{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(28,20,9,.45);margin-bottom:8px;display:block}
  .cs-form-input{width:100%;background:#f2ebe0;border:1px solid rgba(28,20,9,.22);padding:12px 14px;font-family:'DM Mono',monospace;font-size:14px;color:#1c1409;outline:none;transition:border-color .12s}
  .cs-form-input:focus{border-color:#bf3509}
  .cs-form-input::placeholder{color:rgba(28,20,9,.3)}
  .cs-start-bar{margin-top:1px;background:#f2ebe0;border:1px solid rgba(28,20,9,.13);padding:20px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
  .cs-start-info{display:flex;flex-direction:column;gap:4px}
  .cs-start-country{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.04em;color:#1c1409}
  .cs-start-desc{font-size:10px;color:rgba(28,20,9,.45);letter-spacing:.05em}
  .cs-start-btn{background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.09em;text-transform:uppercase;padding:16px 40px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.12s;white-space:nowrap}
  .cs-start-btn:hover{background:#d94010}
  .cs-start-btn:disabled{opacity:.4;cursor:not-allowed}
  @media(max-width:720px){.cs-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:480px){.cs-grid{grid-template-columns:1fr}}
`;

interface CountrySelectorProps {
  onSelect: (country: CountryTemplate) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleStart = () => {
    if (isCustom) {
      if (!customName.trim()) return;
      onSelect({
        name: customName.trim(),
        description: 'A nation forged by your own design.',
        metrics: {
          inflation: 3.0, unemployment: 5.0, gdp: 2.5, publicMood: 70,
          avgSalary: 40000, debtToGDP: 50, currencyStrength: 100,
          tradeBalance: 0, innovationIndex: 50, reserves: 100
        }
      });
    } else if (selected) {
      onSelect(COUNTRY_TEMPLATES.find(t => t.name === selected)!);
    }
  };

  const canStart = isCustom ? customName.trim().length > 0 : selected !== null;
  const selectedTemplate = selected ? COUNTRY_TEMPLATES.find(t => t.name === selected) : null;

  return (
    <>
      <style>{css}</style>
      <div className="cs-root">
        <div className="cs-masthead">
          <div className="cs-overtitle">Mission Setup</div>
          <h2 className="cs-title">
            Choose Your<br /><span className="acc">Nation.</span>
          </h2>
          <p className="cs-lead">
            Select an economic baseline or define your own. Every decision from this point forward is your responsibility.
          </p>
        </div>

        {/* Country grid */}
        <div className="cs-grid">
          {COUNTRY_TEMPLATES.map((tpl, i) => (
            <motion.div
              key={tpl.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className={`cs-card${selected === tpl.name ? ' selected' : ''}`}
                onClick={() => { setSelected(tpl.name); setIsCustom(false); }}
              >
                <div className="cs-card-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="cs-card-name">{tpl.name}</div>
                <div className="cs-card-desc">{tpl.description}</div>
                <div className="cs-card-stats">
                  {[
                    { label: 'GDP Growth', val: `${tpl.metrics.gdp}%` },
                    { label: 'Debt / GDP', val: `${tpl.metrics.debtToGDP}%` },
                    { label: 'Inflation',  val: `${tpl.metrics.inflation}%` },
                    { label: 'Mood',       val: `${tpl.metrics.publicMood}/100` },
                  ].map(s => (
                    <div key={s.label} className="cs-stat">
                      <div className="cs-stat-label">{s.label}</div>
                      <div className="cs-stat-val">{s.val}</div>
                    </div>
                  ))}
                </div>
                {selected === tpl.name && (
                  <div className="cs-check"><span className="cs-check-mark">✓</span></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom nation */}
        <div className="cs-custom-row">
          <div
            className={`cs-custom-card${isCustom ? ' selected' : ''}`}
            onClick={() => { setIsCustom(true); setSelected(null); }}
          >
            <div className="cs-custom-inner">
              <div className="cs-custom-plus">+</div>
              <div className="cs-custom-text">
                <div className="cs-custom-name">Custom Nation</div>
                <div className="cs-custom-desc">Start from balanced defaults. Name it yourself.</div>
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
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start bar */}
        <AnimatePresence>
          {canStart && (
            <motion.div
              className="cs-start-bar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div className="cs-start-info">
                <div className="cs-start-country">
                  {isCustom ? (customName || '…') : selected}
                </div>
                <div className="cs-start-desc">
                  {isCustom ? 'Balanced starting conditions' : selectedTemplate?.description}
                </div>
              </div>
              <button className="cs-start-btn" onClick={handleStart}>
                Begin Simulation →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
