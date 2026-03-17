'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EconomicMetrics,
  PolicyDecisions,
  QuarterData,
  calculateNextQuarter,
  calculateWisdomScore,
  CountryTemplate
} from '@/lib/simulation-engine';
import { MetricDashboard } from './MetricDisplay';
import { PolicyControls } from './PolicyControls';
import { EconomicChart } from './EconomicChart';
import { AIHintSystem } from './AIHintSystem';
import { CountrySelector } from './CountrySelector';
import { Leaderboard } from './Leaderboard';
import { ArrowRight, Activity, Trophy, TrendingUp, TrendingDown, LogOut, Cpu } from 'lucide-react';

const S: React.CSSProperties = {};

const INITIAL_POLICY: PolicyDecisions = {
  taxRate: 25, interestRate: 2, spending: 30,
  moneyPrinting: false, rdInvestment: 2,
  tariffLevel: 5, foreignLending: 0, investmentRisk: 10
};

const GLOBAL_EVENTS = [
  { title: 'Market Boom',       multiplier: 0.8, description: 'Global demand surging. Efficiency up.', dir: 'up'     },
  { title: 'Supply Crisis',     multiplier: 1.4, description: 'Logistics jammed. Input costs rising.',  dir: 'down'   },
  { title: 'Tech Breakthrough', multiplier: 1.1, description: 'New productivity wave underway.',        dir: 'up'     },
  { title: 'Calm Quarter',      multiplier: 1.0, description: 'No major shocks in global markets.',     dir: 'stable' },
];

const css = `
  .db-root{--bg:#f2ebe0;--bg2:#e9e0d2;--bg3:#dfd4c4;--ink:#1c1409;--acc:#bf3509;--acc2:#d94010;--muted:rgba(28,20,9,.52);--border:rgba(28,20,9,.13);--border2:rgba(28,20,9,.22);--D:'Bebas Neue',sans-serif;--M:'DM Mono','Courier New',monospace;background:var(--bg);color:var(--ink);font-family:var(--M);min-height:100vh}
  .db-root *{box-sizing:border-box;margin:0;padding:0}
  .db-header{border-bottom:2px solid var(--border2);padding:20px 40px;display:flex;align-items:center;justify-content:space-between;background:var(--bg);gap:16px;flex-wrap:wrap}
  .db-header-left{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
  .db-country-name{font-family:var(--D);font-size:clamp(32px,5vw,56px);letter-spacing:.04em;line-height:1;color:var(--ink)}
  .db-quarter-badge{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);border:1px solid var(--acc);padding:4px 10px;white-space:nowrap}
  .db-exit-btn{background:transparent;border:1px solid var(--border2);color:var(--muted);font-family:var(--M);font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s}
  .db-exit-btn:hover{border-color:var(--ink);color:var(--ink)}
  .db-event-bar{background:var(--bg2);border-bottom:1px solid var(--border2);padding:10px 40px;display:flex;align-items:center;gap:16px}
  .db-event-label{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);flex-shrink:0}
  .db-event-pipe{width:1px;height:16px;background:var(--border2);flex-shrink:0}
  .db-event-title{font-family:var(--D);font-size:18px;letter-spacing:.04em;color:var(--ink);flex-shrink:0}
  .db-event-desc{font-size:11px;color:var(--muted)}
  .db-event-dir-up{color:#2d6a2d;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
  .db-event-dir-down{color:var(--acc);font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
  .db-event-dir-stable{color:var(--muted);font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
  .db-tabs-bar{border-bottom:1px solid var(--border2);padding:0 40px;display:flex;gap:0;background:var(--bg)}
  .db-tab{font-family:var(--M);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);background:transparent;border:none;border-bottom:2px solid transparent;padding:14px 20px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.12s;margin-bottom:-1px}
  .db-tab:hover{color:var(--ink)}
  .db-tab.active{color:var(--acc);border-bottom-color:var(--acc)}
  .db-body{padding:32px 40px;max-width:1400px;margin:0 auto}
  .db-sim-grid{display:grid;grid-template-columns:320px 1fr;gap:32px;align-items:start}
  .db-section-label{font-size:8px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)}
  .db-mandate-bar{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border:1px solid var(--border2);background:var(--bg2);margin-top:24px;flex-wrap:wrap;gap:16px}
  .db-mandate-left{display:flex;flex-direction:column;gap:4px}
  .db-mandate-prog-label{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .db-mandate-prog-track{width:200px;height:2px;background:var(--border2);margin-top:6px}
  .db-mandate-prog-fill{height:100%;background:var(--acc);transition:width .6s ease}
  .db-next-btn{background:var(--acc);color:#fff;border:none;font-family:var(--M);font-weight:500;font-size:13px;letter-spacing:.09em;text-transform:uppercase;padding:16px 40px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.12s}
  .db-next-btn:hover{background:var(--acc2)}
  .db-next-btn:disabled{opacity:.4;cursor:not-allowed}
  .db-over-overlay{position:fixed;inset:0;background:rgba(28,20,9,.7);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px}
  .db-over-modal{background:var(--bg);border:1px solid var(--border2);max-width:520px;width:100%;padding:0;overflow:hidden}
  .db-over-head-bar{background:var(--acc);height:4px;width:100%}
  .db-over-inner{padding:48px}
  .db-over-title{font-family:var(--D);font-size:56px;letter-spacing:.04em;line-height:.9;margin-bottom:8px;color:var(--ink)}
  .db-over-sub{font-size:12px;color:var(--muted);letter-spacing:.06em;margin-bottom:36px}
  .db-over-score-box{border:1px solid var(--border2);background:var(--bg2);padding:32px;text-align:center;margin-bottom:32px}
  .db-over-score-label{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--acc);margin-bottom:12px}
  .db-over-score-num{font-family:var(--D);font-size:96px;line-height:1;color:var(--ink)}
  .db-over-score-sub{font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:8px}
  .db-over-btn-primary{width:100%;background:var(--acc);color:#fff;border:none;font-family:var(--M);font-weight:500;font-size:13px;letter-spacing:.09em;text-transform:uppercase;padding:18px;cursor:pointer;margin-bottom:10px;transition:.12s}
  .db-over-btn-primary:hover{background:var(--acc2)}
  .db-over-btn-ghost{width:100%;background:transparent;color:var(--muted);border:1px solid var(--border);font-family:var(--M);font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:12px;cursor:pointer;transition:.12s}
  .db-over-btn-ghost:hover{border-color:var(--ink);color:var(--ink)}
  .db-setup-wrap{padding:40px;max-width:1000px;margin:0 auto}
  .db-setup-back{background:transparent;border:1px solid var(--border2);color:var(--muted);font-family:var(--M);font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:6px;margin-bottom:32px;transition:.12s}
  .db-setup-back:hover{color:var(--ink);border-color:var(--ink)}
  .db-leaderboard-wrap{padding:0}
  @media(max-width:900px){
    .db-sim-grid{grid-template-columns:1fr}
    .db-header{padding:16px 20px}
    .db-body{padding:20px}
    .db-event-bar{padding:10px 20px}
    .db-tabs-bar{padding:0 20px;overflow-x:auto}
  }
`;

interface DashboardProps { onExit: () => void; }

export const Dashboard: React.FC<DashboardProps> = ({ onExit }) => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [activeTab, setActiveTab] = useState('simulation');
  const [quarter, setQuarter] = useState(1);
  const [country, setCountry] = useState<CountryTemplate | null>(null);
  const [metrics, setMetrics] = useState<EconomicMetrics | null>(null);
  const [history, setHistory] = useState<QuarterData[]>([]);
  const [policy, setPolicy] = useState<PolicyDecisions>(INITIAL_POLICY);
  const [prevPolicy, setPrevPolicy] = useState<PolicyDecisions>(INITIAL_POLICY);
  const [currentEvent, setCurrentEvent] = useState(GLOBAL_EVENTS[3]);

  const startNewGame = (c: CountryTemplate) => {
    setCountry(c);
    setMetrics(c.metrics);
    setHistory([{ quarter: 1, metrics: c.metrics, policy: INITIAL_POLICY }]);
    setQuarter(1);
    setGameState('playing');
    setActiveTab('simulation');
    setPolicy(INITIAL_POLICY);
    setPrevPolicy(INITIAL_POLICY);
    setCurrentEvent(GLOBAL_EVENTS[3]);
  };

  const resetGame = () => {
    setGameState('setup');
    setCountry(null);
    setMetrics(null);
    setHistory([]);
  };

  const handleNextQuarter = () => {
    if (!metrics) return;
    const nextEvent = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
    setCurrentEvent(nextEvent);
    const nextMetrics = calculateNextQuarter(metrics, prevPolicy, policy, nextEvent.multiplier);
    const nextQ = quarter + 1;
    const newHistory = [...history, { quarter: nextQ, metrics: nextMetrics, policy, event: nextEvent.title }];
    setHistory(newHistory);
    setMetrics(nextMetrics);
    setPrevPolicy(policy);
    setQuarter(nextQ);
    if (nextQ >= 8) setGameState('finished');
  };

  const updatePolicy = (key: string, value: any) =>
    setPolicy(prev => ({ ...prev, [key]: value }));

  if (gameState === 'setup') {
    return (
      <div className="db-root">
        <style>{css}</style>
        <div className="db-setup-wrap">
          <button className="db-setup-back" onClick={onExit}>
            <LogOut size={12} /> Back to Home
          </button>
          <CountrySelector onSelect={startNewGame} />
        </div>
      </div>
    );
  }

  const progress = Math.round((quarter / 8) * 100);

  return (
    <div className="db-root">
      <style>{css}</style>

      {/* Header */}
      <div className="db-header">
        <div className="db-header-left">
          <span className="db-country-name">{country?.name}</span>
          <span className="db-quarter-badge">
            {gameState === 'playing' ? `FY2024 · Q${quarter}` : 'Term End'}
          </span>
        </div>
        <button className="db-exit-btn" onClick={onExit}>
          <LogOut size={12} /> Exit
        </button>
      </div>

      {/* Event bar */}
      <div className="db-event-bar">
        <span className="db-event-label">Global Event</span>
        <div className="db-event-pipe" />
        <span className="db-event-title">{currentEvent.title}</span>
        <span className="db-event-desc">{currentEvent.description}</span>
        <span className={`db-event-dir-${currentEvent.dir}`}>
          {currentEvent.dir === 'up' ? '▲ Positive' : currentEvent.dir === 'down' ? '▼ Negative' : '— Neutral'}
        </span>
      </div>

      {/* Tabs */}
      <div className="db-tabs-bar">
        {[
          { key: 'simulation', label: 'Strategy Console' },
          { key: 'leaderboard', label: 'Hall of Fame' },
        ].map(t => (
          <button
            key={t.key}
            className={`db-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.key === 'simulation' ? <Activity size={10} /> : <Trophy size={10} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="db-body">
        {activeTab === 'simulation' && metrics && (
          <div>
            <div className="db-sim-grid">
              {/* Left col */}
              <div>
                <div className="db-section-label">Policy Levers</div>
                <PolicyControls values={policy} onChange={updatePolicy} disabled={gameState === 'finished'} />
                <div style={{ marginTop: 24 }}>
                  <div className="db-section-label">Economic Advisor</div>
                  <AIHintSystem metrics={metrics} quarter={quarter} />
                </div>
              </div>

              {/* Right col */}
              <div>
                <div className="db-section-label">Live Metrics</div>
                <MetricDashboard
                  metrics={metrics}
                  previousMetrics={history.length > 1 ? history[history.length - 2].metrics : undefined}
                />
                <div style={{ marginTop: 28 }}>
                  <div className="db-section-label">Performance History</div>
                  <EconomicChart history={history} />
                </div>

                {gameState === 'playing' && (
                  <div className="db-mandate-bar">
                    <div className="db-mandate-left">
                      <span className="db-mandate-prog-label">Mandate Progress — {progress}%</span>
                      <div className="db-mandate-prog-track">
                        <div className="db-mandate-prog-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <button className="db-next-btn" onClick={handleNextQuarter}>
                      Apply Q{quarter} Mandate <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="db-leaderboard-wrap">
            <Leaderboard />
          </div>
        )}
      </div>

      {/* Game over */}
      <AnimatePresence>
        {gameState === 'finished' && (
          <motion.div
            className="db-over-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="db-over-modal"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="db-over-head-bar" />
              <div className="db-over-inner">
                <div className="db-over-title">Simulation<br />Complete.</div>
                <div className="db-over-sub">Two fiscal years concluded. Final assessment below.</div>
                <div className="db-over-score-box">
                  <div className="db-over-score-label">Wisdom Score</div>
                  <div className="db-over-score-num">{calculateWisdomScore(history)}</div>
                  <div className="db-over-score-sub">Based on stability, growth &amp; public welfare</div>
                </div>
                <button className="db-over-btn-primary" onClick={resetGame}>▶ New Mandate</button>
                <button className="db-over-btn-ghost" onClick={onExit}>Exit Platform</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
