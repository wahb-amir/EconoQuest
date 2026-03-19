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
import { EventBar } from '@/components/game/panels/Eventbar';
import { FlagsBar } from '@/components/game/panels/FlagBar';
import { PolicyPanel } from '@/components/game/panels/Policypanel';
import { MetricsPanel } from '@/components/game/panels/MetricsPanel';
import { LeaderboardPanel } from '@/components/game/panels/LeaderBoardPanel';
import { GameOverModal } from '@/components/game/panels/GameOver';

// ── Constants ────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectFlags(m: EconomicMetrics, printing: boolean): string[] {
  const f: string[] = [];
  if (m.inflation > 15)      f.push('Hyperinflation risk active');
  if (m.debtToGDP > 150)     f.push('Sovereign risk premium compounding');
  if (m.reserves < 20)       f.push('Reserves critically low');
  if (m.unemployment > 20)   f.push('Social instability threshold');
  if (printing)               f.push('Currency printing active');
  if (m.debtToGDP > 200)     f.push('Default risk imminent');
  return f;
}

// ── Page component ───────────────────────────────────────────────────────────

export default function GamePage() {
  const router = useRouter();

  // ── Load country from sessionStorage ──────────────────────────────────────
  const [country, setCountry] = useState<CountryTemplate | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('eq_country');
    if (!raw) { router.replace('/setup'); return; }
    try {
      setCountry(JSON.parse(raw));
    } catch {
      router.replace('/setup');
    }
  }, []);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [gameOver,    setGameOver]    = useState(false);
  const [activeTab,   setActiveTab]   = useState<'simulation' | 'leaderboard'>('simulation');
  const [quarter,     setQuarter]     = useState(1);
  const [metrics,     setMetrics]     = useState<EconomicMetrics | null>(null);
  const [history,     setHistory]     = useState<QuarterData[]>([]);
  const [policy,      setPolicy]      = useState<PolicyDecisions>(INITIAL_POLICY);
  const [prevPolicy,  setPrevPolicy]  = useState<PolicyDecisions>(INITIAL_POLICY);
  const [event,       setEvent]       = useState(GLOBAL_EVENTS[3]);
  const [flags,       setFlags]       = useState<string[]>([]);

  // Initialise metrics once country loads
  useEffect(() => {
    if (!country) return;
    setMetrics(country.metrics);
    setHistory([{ quarter: 1, metrics: country.metrics, policy: INITIAL_POLICY }]);
  }, [country]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleNextQuarter = () => {
    if (!metrics) return;
    const nextEvent = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
    const nextMetrics = calculateNextQuarter(metrics, prevPolicy, policy, nextEvent.multiplier);
    const nextQ = quarter + 1;
    setEvent(nextEvent);
    setMetrics(nextMetrics);
    setPrevPolicy(policy);
    setQuarter(nextQ);
    setHistory(prev => [...prev, { quarter: nextQ, metrics: nextMetrics, policy, event: nextEvent.title }]);
    setFlags(detectFlags(nextMetrics, policy.moneyPrinting));
    if (nextQ >= 8) setGameOver(true);
  };

  const updatePolicy = (key: string, value: unknown) =>
    setPolicy(prev => ({ ...prev, [key]: value }));

  // ── Guard ──────────────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f2ebe0', minHeight: '100vh' }}>

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
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div style={{ padding: '28px 40px', maxWidth: 1400, margin: '0 auto' }}>

        {activeTab === 'simulation' && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28, alignItems: 'start' }}>
            <PolicyPanel
              policy={policy}
              onChange={updatePolicy}
              currentMetrics={metrics}
              currentQuarter={quarter}
              totalQuarters={8}
              wisdomScore={calculateWisdomScore(history)}
              hintsUsed={0}
              hintsMax={3}
              quarterHistory={history}
              onHintUsed={() => {}}
              country={country}
              disabled={gameOver}
            />
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
        )}

        {activeTab === 'leaderboard' && <LeaderboardPanel />}

      </div>

      <GameOverModal
        open={gameOver}
        score={calculateWisdomScore(history)}
        countryName={country.name}
        onNewGame={() => router.push('/setup')}
        onExit={() => router.push('/')}
      />
    </div>
  );
}

// ── Inline tab bar (tiny, not worth its own file) ─────────────────────────────
const tabCss = `
  .tb-bar{border-bottom:1px solid rgba(28,20,9,.22);padding:0 40px;display:flex;background:#f2ebe0;overflow-x:auto}
  .tb-tab{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.45);background:transparent;border:none;border-bottom:2px solid transparent;padding:13px 18px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.12s;margin-bottom:-1px;white-space:nowrap;flex-shrink:0}
  .tb-tab.active{color:#bf3509;border-bottom-color:#bf3509}
  .tb-tab:hover:not(.active){color:#1c1409}
  @media(max-width:600px){.tb-bar{padding:0 16px}}
`;

function TabBar({
  active, onChange
}: {
  active: 'simulation' | 'leaderboard';
  onChange: (v: 'simulation' | 'leaderboard') => void;
}) {
  return (
    <>
      <style>{tabCss}</style>
      <div className="tb-bar">
        <button className={`tb-tab${active === 'simulation' ? ' active' : ''}`} onClick={() => onChange('simulation')}>
          ◈ Strategy Console
        </button>
        <button className={`tb-tab${active === 'leaderboard' ? ' active' : ''}`} onClick={() => onChange('leaderboard')}>
          ◎ Hall of Fame
        </button>
      </div>
    </>
  );
}