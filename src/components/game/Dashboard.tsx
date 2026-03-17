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
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Activity, 
  Landmark, 
  Trophy, 
  Cpu, 
  Newspaper, 
  TrendingUp, 
  TrendingDown,
  LogOut,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

const INITIAL_POLICY: PolicyDecisions = { 
  taxRate: 25, 
  interestRate: 2, 
  spending: 30, 
  moneyPrinting: false,
  rdInvestment: 2,
  tariffLevel: 5,
  foreignLending: 0,
  investmentRisk: 10
};

const GLOBAL_EVENTS = [
  { title: "Market Boom", multiplier: 0.8, description: "Global demand is surging! Efficiency is up.", icon: <TrendingUp className="text-emerald-400" /> },
  { title: "Supply Crisis", multiplier: 1.4, description: "Logistics lines are jammed. Prices are rising.", icon: <TrendingDown className="text-rose-400" /> },
  { title: "Tech Breakthrough", multiplier: 1.1, description: "A new AI breakthrough boosts output expectations.", icon: <Cpu className="text-blue-400" /> },
  { title: "Standard Quarter", multiplier: 1.0, description: "Calm waters in the global markets.", icon: <Activity className="text-muted-foreground" /> }
];

interface DashboardProps {
  onExit: () => void;
}

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
  
  const startNewGame = (selectedCountry: CountryTemplate) => {
    setCountry(selectedCountry);
    setMetrics(selectedCountry.metrics);
    setHistory([{ quarter: 1, metrics: selectedCountry.metrics, policy: INITIAL_POLICY }]);
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
    const nextQuarter = quarter + 1;

    const newHistory = [...history, { 
      quarter: nextQuarter, 
      metrics: nextMetrics, 
      policy,
      event: nextEvent.title 
    }];
    setHistory(newHistory);
    setMetrics(nextMetrics);
    setPrevPolicy(policy);
    setQuarter(nextQuarter);

    if (nextQuarter >= 8) {
      setGameState('finished');
    }
  };

  const updatePolicy = (key: string, value: any) => {
    setPolicy(prev => ({ ...prev, [key]: value }));
  };

  if (gameState === 'setup') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-start mb-8">
          <Button variant="ghost" onClick={onExit} className="text-muted-foreground hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
        <CountrySelector onSelect={startNewGame} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold font-headline text-white tracking-tighter">
              {country?.name}
            </h1>
            <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/20 font-mono text-primary animate-pulse">
              {gameState === 'playing' ? `FY2024 - Q${quarter}` : 'Term End'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl font-light italic leading-relaxed">
            "{country?.description}"
          </p>
        </div>

        {/* Global Event Ticker */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border-l-4 border-accent min-w-[300px]">
          <div className="p-2.5 rounded-xl bg-accent/10">
            {currentEvent.icon}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-accent/70">Terminal Intelligence</p>
            <p className="text-sm font-semibold">{currentEvent.title}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{currentEvent.description}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-black/20 border border-white/5 p-1 rounded-xl">
          <TabsTrigger value="simulation" className="data-[state=active]:bg-primary data-[state=active]:text-white font-headline text-xs px-6 py-2">
            <Activity className="w-3 h-3 mr-2" />
            Strategy Console
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="data-[state=active]:bg-primary data-[state=active]:text-white font-headline text-xs px-6 py-2">
            <Cpu className="w-3 h-3 mr-2" />
            Sandbox
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary data-[state=active]:text-white font-headline text-xs px-6 py-2">
            <Trophy className="w-3 h-3 mr-2" />
            Hall of Fame
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xs font-headline font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-accent/70">
                  <Landmark className="w-4 h-4" />
                  Policy Levers
                </h2>
                <PolicyControls 
                  values={policy} 
                  onChange={updatePolicy} 
                  disabled={gameState === 'finished'} 
                />
              </div>
              <AIHintSystem metrics={metrics!} quarter={quarter} />
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs font-headline font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-accent/70">
                  <Activity className="w-4 h-4" />
                  Live Metrics
                </h2>
                <MetricDashboard 
                  metrics={metrics!} 
                  previousMetrics={history.length > 1 ? history[history.length - 2].metrics : undefined} 
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-headline font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-accent/70">
                  <TrendingUp className="w-4 h-4" />
                  Performance History
                </h2>
                <EconomicChart history={history} />
              </div>

              {gameState === 'playing' && (
                <div className="flex justify-between items-center glass-card p-6 rounded-3xl border-primary/20">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-primary" />
                    Mandate progress: {Math.round((quarter / 8) * 100)}%
                  </div>
                  <Button 
                    onClick={handleNextQuarter} 
                    className="bg-primary text-white hover:bg-primary/90 neon-glow h-16 px-16 text-xl font-headline rounded-2xl transition-all hover:scale-105"
                  >
                    Apply Quarterly Mandate <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ... (Other Tabs Content) */}
      </Tabs>

      {/* Legacy Summary Dialog */}
      <Dialog open={gameState === 'finished'}>
        <DialogContent className="sm:max-w-xl bg-card border-none text-card-foreground p-0 overflow-hidden shadow-2xl rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x w-full" />
          <div className="p-10 space-y-10">
            <DialogHeader>
              <DialogTitle className="text-5xl font-headline font-bold text-white text-center tracking-tighter">Simulation Over</DialogTitle>
              <DialogDescription className="text-center py-2 text-lg text-muted-foreground font-light">
                Two fiscal years have concluded. Here is your final rating.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-[2.5rem] border-primary/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl" />
              <Award className="w-28 h-28 text-accent mb-8 drop-shadow-[0_0_20px_rgba(180,255,255,0.4)]" />
              <h4 className="text-xs font-medium text-accent uppercase tracking-[0.4em] mb-4">Final Wisdom Score</h4>
              <div className="text-9xl font-bold font-headline text-white drop-shadow-2xl">{calculateWisdomScore(history)}</div>
              <div className="mt-8 flex gap-2">
                 <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5">TOP 5% CHANCELLOR</Badge>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-col gap-4">
              <Button onClick={resetGame} className="w-full bg-primary text-white h-16 text-xl font-headline rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                New Mandate
              </Button>
              <Button variant="ghost" onClick={onExit} className="w-full h-12 text-muted-foreground/60">
                Exit Platform
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};