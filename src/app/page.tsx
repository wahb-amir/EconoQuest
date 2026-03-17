'use client';

import React, { useState } from 'react';
import { LandingPage } from '@/components/landing/LandingPage';
import { Dashboard } from '@/components/game/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [view, setView] = useState<'landing' | 'game'>('landing');

  return (
    <main className="min-h-screen bg-background selection:bg-accent/30 selection:text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onStart={() => setView('game')} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard onExit={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Footer Credit */}
      <footer className="fixed bottom-0 left-0 w-full p-6 pointer-events-none z-[100] hidden md:block">
        <div className="container mx-auto flex justify-end">
          <div className="glass-card px-4 py-2 rounded-full text-[10px] text-muted-foreground/50 border-white/5 uppercase tracking-[0.3em] font-medium pointer-events-auto">
            Terminal Access: <span className="text-accent">Active-Q4-2024</span>
          </div>
        </div>
      </footer>
    </main>
  );
}