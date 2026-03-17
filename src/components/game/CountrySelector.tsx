'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, Check, ChevronRight } from 'lucide-react';
import { COUNTRY_TEMPLATES, CountryTemplate } from '@/lib/simulation-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CountrySelectorProps {
  onSelect: (country: CountryTemplate) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");

  const handleCustomStart = () => {
    if (!customName.trim()) return;
    onSelect({
      name: customName,
      description: "A nation forged by your own design.",
      metrics: {
        inflation: 3.0,
        unemployment: 5.0,
        gdp: 2.5,
        publicMood: 70,
        avgSalary: 40000,
        debtToGDP: 50,
        currencyStrength: 100,
        tradeBalance: 0,
        innovationIndex: 50,
        reserves: 100
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold font-headline text-accent"
        >
          Build Your Nation
        </motion.h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose a pre-defined economic baseline or create your own custom country to begin the simulation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COUNTRY_TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              className={cn(
                "h-full cursor-pointer border-2 transition-all group overflow-hidden relative",
                selected === tpl.name ? "border-accent bg-accent/5" : "border-white/10 bg-white/5 hover:border-white/30"
              )}
              onClick={() => {
                setSelected(tpl.name);
                setIsCustom(false);
              }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Globe className="w-6 h-6" />
                  </div>
                  {selected === tpl.name && <Check className="text-accent w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 h-12 overflow-hidden">{tpl.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">GDP</p>
                    <p className="text-sm font-bold">{tpl.metrics.gdp}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Debt</p>
                    <p className="text-sm font-bold">{tpl.metrics.debtToGDP}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            className={cn(
              "h-full cursor-pointer border-2 border-dashed transition-all bg-white/5",
              isCustom ? "border-accent bg-accent/5" : "border-white/10 hover:border-white/30"
            )}
            onClick={() => {
              setIsCustom(true);
              setSelected(null);
            }}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-3 rounded-full bg-white/10">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline text-muted-foreground">Custom Nation</h3>
                <p className="text-xs text-muted-foreground mt-1">Define your own destiny.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {isCustom ? (
          <motion.div 
            key="custom-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-white/10 p-8 rounded-2xl flex flex-col md:flex-row gap-4 items-end overflow-hidden"
          >
            <div className="flex-1 space-y-2">
              <label className="text-xs font-headline font-bold text-muted-foreground uppercase tracking-widest">Enter Country Name</label>
              <Input 
                placeholder="The Republic of..." 
                className="bg-white/5 border-white/10 h-14 text-lg" 
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <Button 
              size="lg" 
              className="h-14 px-8 bg-accent text-accent-foreground font-headline accent-glow"
              onClick={handleCustomStart}
            >
              Initialize Simulation <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        ) : selected ? (
          <motion.div 
            key="start-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex justify-center"
          >
            <Button 
              size="lg" 
              className="h-14 px-12 bg-accent text-accent-foreground font-headline accent-glow text-lg"
              onClick={() => onSelect(COUNTRY_TEMPLATES.find(t => t.name === selected)!)}
            >
              Start Simulation as {selected} <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};