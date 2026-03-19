'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EconomicMetrics,
  PolicyDecisions,
  QuarterData,
  calculateNextQuarter,
  calculateWisdomScore,
  CountryTemplate,
} from '@/lib/simulation-engine';

import { GameHeader }       from '@/components/game/panels/GameHeader';
import { EventBar }         from '@/components/game/panels/Eventbar';
import { FlagsBar }         from '@/components/game/panels/FlagBar';
import { PolicyPanel }      from '@/components/game/panels/Policypanel';
import { MetricsPanel }     from '@/components/game/panels/MetricsPanel';
import { LeaderboardPanel } from '@/components/game/panels/LeaderBoardPanel';
import { GameOverModal }    from '@/components/game/panels/GameOver';
import { AuthFeaturePopup } from '@/components/game/Authfeaturepopup';

// ── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_POLICY: PolicyDecisions = {
  taxRate: 25, interestRate: 2, spending: 30,
  moneyPrinting: false, rdInvestment: 2,
  tariffLevel: 5, foreignLending: 0, investmentRisk: 10,
};

const GLOBAL_EVENTS = [
  { title: 'Market Boom',       multiplier: 0.8, description: 'Global demand surging. Efficiency up.',  dir: 'up'     },
  { title: 'Supply Crisis',     multiplier: 1.4, description: 'Logistics jammed. Input costs rising.',  dir: 'down'   },
  { title: 'Tech Breakthrough', multiplier: 1.1, description: 'New productivity wave underway.',        dir: 'up'     },
  { title: 'Calm Quarter',      multiplier: 1.0, description: 'No major shocks in global markets.',     dir: 'stable' },
];

// ── Layout CSS ────────────────────────────────────────────────────────────────
// Strategy:
// Desktop (>1100px): side-by-side  policy(300px) | metrics(flex)
// Mobile  (<1100px): full-width stacked — metrics first, then policy, no tab switching
// Metrics grid: 4col → 3col → 2col as screen shrinks

const layoutCss = `
  /* ── wrapper ── */
  .gp-wrap {
    background: #f2ebe0;
    min-height: 100vh;
  }

  /* ── main content area ── */
  .gp-content {
    padding: 24px 40px 80px;
    max-width: 1440px;
    margin: 0 auto;
  }

  /* ── desktop: side by side ── */
  .gp-cols {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    align-items: start;
  }

  /* ── sticky next-quarter bar (mobile only) ── */
  .gp-sticky-bar {
    display: none;
  }

  /* ── section label (mobile only) ── */
  .gp-section-label {
    display: none;
  }

  /* ── metrics responsive grid override ── */
  /* These target whatever grid MetricsPanel uses internally */
  /* We override at breakpoints via wrapper classes */

  /* ── TABLET: 1100px ── */
  @media (max-width: 1100px) {
    .gp-content {
      padding: 16px 16px 100px; /* extra bottom padding for sticky bar */
    }

    /* stack everything vertically */
    .gp-cols {
      grid-template-columns: 1fr;
      gap: 0;
    }

    /* metrics go FIRST on mobile */
    .gp-col-metrics { order: 1; }
    .gp-col-policy  { order: 2; margin-top: 16px; }

    /* section divider labels */
    .gp-section-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: rgba(28,20,9,.35);
      margin: 20px 0 12px;
    }
    .gp-section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(28,20,9,.12);
    }

    /* sticky next-quarter + AI button bar at bottom */
    .gp-sticky-bar {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: #f2ebe0;
      border-top: 2px solid rgba(28,20,9,.18);
      padding: 10px 16px;
      gap: 10px;
      box-shadow: 0 -4px 20px rgba(28,20,9,.08);
    }

    .gp-sticky-btn {
      flex: 1;
      background: #1c1409;
      color: #f2ebe0;
      border: none;
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: .09em;
      text-transform: uppercase;
      padding: 14px 16px;
      cursor: pointer;
      transition: background .12s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .gp-sticky-btn:hover:not(:disabled) { background: #2d2010; }
    .gp-sticky-btn:disabled { opacity: .4; cursor: not-allowed; }
    .gp-sticky-btn.primary {
      background: #bf3509;
      flex: 2;
    }
    .gp-sticky-btn.primary:hover:not(:disabled) { background: #d94010; }

    /* quarter badge in sticky bar */
    .gp-sticky-quarter {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 18px;
      letter-spacing: .04em;
      color: #1c1409;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 4px;
      white-space: nowrap;
    }
    .gp-sticky-quarter span {
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      color: rgba(28,20,9,.4);
      letter-spacing: .1em;
      text-transform: uppercase;
    }
  }

  /* ── MOBILE: 600px ── */
  @media (max-width: 600px) {
    .gp-content {
      padding: 12px 12px 96px;
    }
    .gp-sticky-bar {
      padding: 8px 12px;
    }
    .gp-sticky-btn {
      font-size: 10px;
      padding: 13px 10px;
    }
  }

  /* ── tab bar ── */
  .tb-bar {
    border-bottom: 1px solid rgba(28,20,9,.22);
    padding: 0 40px;
    display: flex;
    background: #f2ebe0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .tb-bar::-webkit-scrollbar { display: none; }
  .tb-tab {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: rgba(28,20,9,.45);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 13px 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: .12s;
    margin-bottom: -1px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tb-tab.active  { color: #bf3509; border-bottom-color: #bf3509; }
  .tb-tab:hover:not(.active) { color: #1c1409; }
  @media (max-width: 1100px) { .tb-bar { padding: 0 16px; } }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectFlags(m: EconomicMetrics, printing: boolean): string[] {
  const f: string[] = [];
  if (m.inflation > 15)    f.push('Hyperinflation risk active');
  if (m.debtToGDP > 150)   f.push('Sovereign risk premium compounding');
  if (m.reserves < 20)     f.push('Reserves critically low');
  if (m.unemployment > 20) f.push('Social instability threshold');
  if (printing)             f.push('Currency printing active');
  if (m.debtToGDP > 200)   f.push('Default risk imminent');
  return f;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const router = useRouter();

  const [country,    setCountry]    = useState<CountryTemplate | null>(null);
  const [gameOver,   setGameOver]   = useState(false);
  const [activeTab,  setActiveTab]  = useState<'simulation' | 'leaderboard'>('simulation');
  const [quarter,    setQuarter]    = useState(1);
  const [metrics,    setMetrics]    = useState<EconomicMetrics | null>(null);
  const [history,    setHistory]    = useState<QuarterData[]>([]);
  const [policy,     setPolicy]     = useState<PolicyDecisions>(INITIAL_POLICY);
  const [prevPolicy, setPrevPolicy] = useState<PolicyDecisions>(INITIAL_POLICY);
  const [event,      setEvent]      = useState(GLOBAL_EVENTS[3]);
  const [flags,      setFlags]      = useState<string[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem('eq_country');
    if (!raw) { router.replace('/setup'); return; }
    try { setCountry(JSON.parse(raw)); }
    catch { router.replace('/setup'); }
  }, []);

  useEffect(() => {
    if (!country) return;
    setMetrics(country.metrics);
    setHistory([{ quarter: 1, metrics: country.metrics, policy: INITIAL_POLICY }]);
  }, [country]);

  const handleNextQuarter = () => {
    if (!metrics || gameOver) return;
    const nextEvent   = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
    const nextMetrics = calculateNextQuarter(metrics, prevPolicy, policy, nextEvent.multiplier);
    const nextQ       = quarter + 1;
    setEvent(nextEvent);
    setMetrics(nextMetrics);
    setPrevPolicy(policy);
    setQuarter(nextQ);
    setHistory(prev => [...prev, { quarter: nextQ, metrics: nextMetrics, policy, event: nextEvent.title }]);
    setFlags(detectFlags(nextMetrics, policy.moneyPrinting));
    if (nextQ >= 8) setGameOver(true);
    // scroll to top on mobile so user sees new metrics
    if (window.innerWidth <= 1100) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updatePolicy = (key: string, value: unknown) =>
    setPolicy(prev => ({ ...prev, [key]: value }));

  if (!country || !metrics) {
    return (
      <div style={{ background: '#f2ebe0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: 'rgba(28,20,9,.4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          Loading…
        </span>
      </div>
    );
  }

  const progress = Math.round((quarter / 8) * 100);
  const totalQuarters = 8;

  return (
    <>
      <style>{layoutCss}</style>
      <div className="gp-wrap">

        <AuthFeaturePopup />

        <GameHeader
          countryName={country.name}
          quarter={quarter}
          isOver={gameOver}
          onNewGame={() => router.push('/setup')}
          onExit={() => router.push('/')}
        />

        <EventBar event={event} />
        <FlagsBar flags={flags} />

        {/* Tab bar */}
        <div className="tb-bar">
          <button className={`tb-tab${activeTab === 'simulation' ? ' active' : ''}`} onClick={() => setActiveTab('simulation')}>
            ◈ Strategy Console
          </button>
          <button className={`tb-tab${activeTab === 'leaderboard' ? ' active' : ''}`} onClick={() => setActiveTab('leaderboard')}>
            ◎ Hall of Fame
          </button>
        </div>

        {/* Main content */}
        <div className="gp-content">

          {activeTab === 'simulation' && (
            <div className="gp-cols">

              {/* ── Left: Policy panel ── */}
              <div className="gp-col-policy">
                {/* Mobile label */}
                <div className="gp-section-label">Policy Controls</div>
                <PolicyPanel
                  policy={policy}
                  onChange={updatePolicy}
                  currentMetrics={metrics}
                  currentQuarter={quarter}
                  totalQuarters={totalQuarters}
                  wisdomScore={calculateWisdomScore(history)}
                  hintsUsed={0}
                  hintsMax={3}
                  quarterHistory={history}
                  onHintUsed={() => {}}
                  country={country}
                  disabled={gameOver}
                />
              </div>

              {/* ── Right: Metrics panel ── */}
              <div className="gp-col-metrics">
                {/* Mobile label */}
                <div className="gp-section-label">Economic Dashboard</div>
                <MetricsPanel
                  metrics={metrics}
                  previousMetrics={history.length > 1 ? history[history.length - 2].metrics : undefined}
                  history={history}
                  quarter={quarter}
                  progress={progress}
                  isOver={gameOver}
                  onNextQuarter={handleNextQuarter}
                />
              </div>

            </div>
          )}

          {activeTab === 'leaderboard' && <LeaderboardPanel />}

        </div>

        {/* ── Mobile sticky bottom bar ── */}
        {/* Hidden on desktop via CSS, visible on mobile */}
        {activeTab === 'simulation' && (
          <div className="gp-sticky-bar">
            <div className="gp-sticky-quarter">
              Q{quarter}<span>/ {totalQuarters}</span>
            </div>
            <button
              className="gp-sticky-btn primary"
              onClick={handleNextQuarter}
              disabled={gameOver}
            >
              {gameOver ? 'Game Over' : `Advance to Q${quarter + 1} →`}
            </button>
          </div>
        )}

        <GameOverModal
          open={gameOver}
          score={calculateWisdomScore(history)}
          countryName={country.name}
          onNewGame={() => router.push('/setup')}
          onExit={() => router.push('/')}
        />

      </div>
    </>
  );
}