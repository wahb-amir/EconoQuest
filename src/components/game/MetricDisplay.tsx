'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Banknote, 
  Globe, 
  Zap, 
  Scale,
  TrendingDown,
  Minus,
  Coins,
  ShieldCheck,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EconomicMetrics } from '@/lib/simulation-engine';

interface MetricProps {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  colorClass: string;
  description: string;
  isCurrency?: boolean;
}

const MetricCard: React.FC<MetricProps> = ({ label, value, unit, trend, icon, colorClass, description, isCurrency }) => {
  const safeValue = value ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Card className="overflow-hidden glass-morphism border-none shadow-xl transition-all hover:bg-white/10 group h-full">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", colorClass.replace('text-', 'bg-').replace('400', '400/20'))}>
              <div className={colorClass}>{icon}</div>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-white/5">
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
              {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
              <span className={cn("text-[10px] font-bold", trend === 'up' ? "text-emerald-400" : trend === 'down' ? "text-rose-400" : "text-slate-400")}>
                {trend === 'stable' ? '0.0%' : '±' + (Math.random() * 2).toFixed(1) + '%'}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] font-headline">{label}</p>
            <div className="flex items-baseline space-x-1.5">
              <AnimatePresence mode="wait">
                <motion.h3 
                  key={safeValue}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold font-headline tracking-tighter"
                >
                  {isCurrency ? `$${safeValue.toLocaleString()}` : safeValue.toFixed(1)}
                </motion.h3>
              </AnimatePresence>
              <span className="text-xs font-medium text-muted-foreground/60">{unit}</span>
            </div>
            <p className="text-[10px] mt-2 text-muted-foreground/70 leading-relaxed font-light line-clamp-2 italic">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const MetricDashboard: React.FC<{ 
  metrics: EconomicMetrics,
  previousMetrics?: EconomicMetrics
}> = ({ metrics, previousMetrics }) => {
  
  const getTrend = (curr: number, prev?: number) => {
    if (!prev) return 'stable';
    if (Math.abs(curr - prev) < 0.05) return 'stable';
    return curr > prev ? 'up' : 'down';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood > 80) return '🤩';
    if (mood > 60) return '😃';
    if (mood > 40) return '😐';
    if (mood > 20) return '😡';
    return '💀';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
      <MetricCard 
        label="Nat. Reserves"
        value={metrics.reserves}
        unit="B"
        isCurrency={true}
        trend={getTrend(metrics.reserves, previousMetrics?.reserves)}
        icon={<Coins className="w-5 h-5" />}
        colorClass="text-yellow-400"
        description="Total liquid wealth in the Sovereign Fund."
      />
      <MetricCard 
        label="GDP Growth"
        value={metrics.gdp}
        unit="%"
        trend={getTrend(metrics.gdp, previousMetrics?.gdp)}
        icon={<TrendingUp className="w-5 h-5" />}
        colorClass="text-emerald-400"
        description="Quarterly change in economic output."
      />
      <MetricCard 
        label="Inflation"
        value={metrics.inflation}
        unit="%"
        trend={getTrend(metrics.inflation, previousMetrics?.inflation)}
        icon={<Activity className="w-5 h-5" />}
        colorClass="text-rose-400"
        description="Purchasing power erosion rate."
      />
      <MetricCard 
        label="Currency"
        value={metrics.currencyStrength}
        unit="idx"
        trend={getTrend(metrics.currencyStrength, previousMetrics?.currencyStrength)}
        icon={<Globe className="w-5 h-5" />}
        colorClass="text-blue-400"
        description="Value relative to global reserve assets."
      />
      <MetricCard 
        label="Debt/GDP"
        value={metrics.debtToGDP}
        unit="%"
        trend={getTrend(metrics.debtToGDP, previousMetrics?.debtToGDP)}
        icon={<Building className="w-5 h-5" />}
        colorClass="text-orange-400"
        description="National leverage vs productivity."
      />
      <MetricCard 
        label="Unemployment"
        value={metrics.unemployment}
        unit="%"
        trend={getTrend(metrics.unemployment, previousMetrics?.unemployment)}
        icon={<Users className="w-5 h-5" />}
        colorClass="text-amber-400"
        description="Percentage of workforce without jobs."
      />
      <MetricCard 
        label="Trade Balance"
        value={metrics.tradeBalance}
        unit="%"
        trend={getTrend(metrics.tradeBalance, previousMetrics?.tradeBalance)}
        icon={<Scale className="w-5 h-5" />}
        colorClass="text-purple-400"
        description="Net export efficiency (exports - imports)."
      />
      <MetricCard 
        label="Innovation"
        value={metrics.innovationIndex}
        unit="pts"
        trend={getTrend(metrics.innovationIndex, previousMetrics?.innovationIndex)}
        icon={<Zap className="w-5 h-5" />}
        colorClass="text-cyan-400"
        description="Technological and scientific output."
      />
      <MetricCard 
        label="Avg Salary"
        value={metrics.avgSalary}
        unit="/yr"
        isCurrency={true}
        trend={getTrend(metrics.avgSalary, previousMetrics?.avgSalary)}
        icon={<Banknote className="w-5 h-5" />}
        colorClass="text-indigo-400"
        description="Mean household purchasing power."
      />
      <MetricCard 
        label={`Public Mood ${getMoodEmoji(metrics.publicMood)}`}
        value={metrics.publicMood}
        unit="/100"
        trend={getTrend(metrics.publicMood, previousMetrics?.publicMood)}
        icon={<ShieldCheck className="w-5 h-5" />}
        colorClass="text-pink-400"
        description="Citizen stability and approval index."
      />
    </div>
  );
};