'use client';

import React, { useState } from 'react';
import { LandingPage } from '@/components/landing/LandingPage';
import { Dashboard } from '@/components/game/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [view, setView] = useState<'landing' | 'game'>('landing');

  return (
    <main
      style={{ minHeight: '100vh', background: '#f2ebe0' }}
      className="eq-selection"
    >
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <LandingPage onStart={() => setView('game')} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <Dashboard onExit={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status pill — matches newsprint theme */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 24,
          zIndex: 100,
          pointerEvents: 'none',
        }}
        className="eq-status-pill hidden md:flex"
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#e9e0d2',
            border: '1px solid rgba(28,20,9,0.22)',
            padding: '5px 14px',
            fontFamily: "'DM Mono', 'Courier New', monospace",
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(28,20,9,0.5)',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#bf3509',
              display: 'inline-block',
              animation: 'eq-blink 2s step-end infinite',
            }}
          />
          Terminal Active
        </span>
      </div>
    </main>
  );
}