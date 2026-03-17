'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Landmark, Wallet, Banknote, Printer, Zap, ShieldCheck, HandCoins, BarChart4 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PolicyControlsProps {
  values: {
    taxRate: number;
    interestRate: number;
    spending: number;
    moneyPrinting: boolean;
    rdInvestment: number;
    tariffLevel: number;
    foreignLending: number;
    investmentRisk: number;
  };
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}

export const PolicyControls: React.FC<PolicyControlsProps> = ({ values, onChange, disabled }) => {
  return (
    <div className="space-y-8 p-6 glass-morphism rounded-2xl border-none shadow-2xl">
      {/* Fiscal Section */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest border-b border-accent/20 pb-2">Fiscal & Monetary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-accent" />
              <Label className="text-xs font-bold font-headline">Corporate Tax</Label>
            </div>
            <span className="text-sm font-bold font-headline text-accent">{values.taxRate}%</span>
          </div>
          <Slider 
            value={[values.taxRate]} 
            onValueChange={(v) => onChange('taxRate', v[0])}
            max={60} 
            step={1}
            disabled={disabled}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-accent" />
              <Label className="text-xs font-bold font-headline">Interest Rate</Label>
            </div>
            <span className="text-sm font-bold font-headline text-accent">{values.interestRate}%</span>
          </div>
          <Slider 
            value={[values.interestRate]} 
            onValueChange={(v) => onChange('interestRate', v[0])}
            max={30} 
            step={0.25}
            disabled={disabled}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Banknote className="w-4 h-4 text-accent" />
              <Label className="text-xs font-bold font-headline">Public Spending</Label>
            </div>
            <span className="text-sm font-bold font-headline text-accent">{values.spending}%</span>
          </div>
          <Slider 
            value={[values.spending]} 
            onValueChange={(v) => onChange('spending', v[0])}
            max={80} 
            step={1}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Strategic Section */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest border-b border-yellow-400/20 pb-2">Strategic Investment</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <Label className="text-xs font-bold font-headline">R&D Commitment</Label>
            </div>
            <span className="text-sm font-bold font-headline text-yellow-400">{values.rdInvestment}%</span>
          </div>
          <Slider 
            value={[values.rdInvestment]} 
            onValueChange={(v) => onChange('rdInvestment', v[0])}
            max={20} 
            step={0.5}
            disabled={disabled}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HandCoins className="w-4 h-4 text-emerald-400" />
              <Label className="text-xs font-bold font-headline">Foreign Lending</Label>
            </div>
            <span className="text-sm font-bold font-headline text-emerald-400">{values.foreignLending}%</span>
          </div>
          <Slider 
            value={[values.foreignLending]} 
            onValueChange={(v) => onChange('foreignLending', v[0])}
            max={10} 
            step={0.5}
            disabled={disabled}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart4 className="w-4 h-4 text-blue-400" />
              <Label className="text-xs font-bold font-headline">Wealth Fund Risk</Label>
            </div>
            <span className="text-sm font-bold font-headline text-blue-400">{values.investmentRisk}%</span>
          </div>
          <Slider 
            value={[values.investmentRisk]} 
            onValueChange={(v) => onChange('investmentRisk', v[0])}
            max={100} 
            step={1}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Warning Area */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <Label className="text-xs font-bold font-headline">Tariff Level</Label>
            </div>
            <span className="text-sm font-bold font-headline text-purple-400">{values.tariffLevel}%</span>
          </div>
          <Slider 
            value={[values.tariffLevel]} 
            onValueChange={(v) => onChange('tariffLevel', v[0])}
            max={50} 
            step={1}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-400/5 border border-rose-400/20">
          <div className="flex items-center space-x-3">
            <Printer className="w-5 h-5 text-rose-400 animate-pulse" />
            <div className="flex flex-col">
              <Label className="text-xs font-bold font-headline text-rose-400">Print Currency</Label>
              <span className="text-[9px] text-rose-400/70 font-mono uppercase tracking-tighter">Emergency Liquid Injection</span>
            </div>
          </div>
          <Switch 
            checked={values.moneyPrinting} 
            onCheckedChange={(v) => onChange('moneyPrinting', v)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
