'use client';

import React, { useEffect, useState } from 'react';

const TICKER = [
  'Global GDP $105T (2023)', 'US CPI 3.4% YoY', 'Crude Oil ~$85/bbl',
  'Fed Funds Rate 5.25–5.5%', 'Global Unemployment ~5.1%', 'World Trade Volume -1.2%',
  'Emerging Market Debt at Record', 'EconoQuest — Open Beta',
];

const DATA_ROWS = [
  { label: 'Global Debt / GDP',      val: '238%',   delta: 'World Bank 2023',        warn: false },
  { label: 'Population in Poverty',  val: '~700M',  delta: 'World Bank estimate',     warn: false },
  { label: 'Trade as % of GDP',      val: '57%',    delta: 'Down from 61% (2018)',    warn: true  },
  { label: 'G20 Avg. Inflation',     val: '5.8%',   delta: 'IMF 2024 projection',     warn: true  },
  { label: 'Global CO₂ Growth',      val: '+1.1%',  delta: 'IEA 2023',               warn: false },
];

const FEATURES = [
  {
    num: '01', title: 'Macro Engine',   sub: 'Linked-variable model',
    body: 'Set interest rates, fiscal policy, and money supply. Watch inflation, unemployment, and growth respond in real time with transparent cause-and-effect.',
    tag: 'GDP · CPI · Unemployment · Rates',
  },
  {
    num: '02', title: 'Trade Network', sub: 'Global commerce',
    body: 'Negotiate tariffs, manage currency regimes, and take on sovereign debt. Every policy ripples outward into partner economies.',
    tag: 'Tariffs · FX · Trade Balances',
  },
  {
    num: '03', title: 'R&D Matrix',    sub: 'Innovation system',
    body: 'Invest in research and education to shift your productivity frontier. Model the long-run effects of technology on growth and competitiveness.',
    tag: 'TFP · Human Capital · Innovation',
  },
];

const CHECKS = [
  { title: 'Transparent model',      desc: 'Every variable and its connections are visible. No magic — just economics.' },
  { title: 'Scenario-based learning', desc: 'Start from real-world crisis templates: 2008, hyperinflation, stagflation.' },
  { title: 'Built for educators',    desc: 'Designed for classroom use with structured debrief tools and scenario exports.' },
];

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Inject critical CSS immediately to prevent FOUC
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
      
      @keyframes eq-ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes eq-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
      @keyframes eq-fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      html, body { 
        background: #f2ebe0;
        color: #1c1409;
        font-family: 'DM Mono', 'Courier New', monospace;
        line-height: 1.6;
        min-height: 100vh;
      }
    `;
    document.head.insertBefore(styleTag, document.head.firstChild);
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent flash by not rendering until after styles are injected
  }

  return (
    <div className="min-h-screen bg-eq-bg text-eq-ink font-mono leading-relaxed">
      {/* TICKER */}
      <div className="h-[30px] bg-eq-accent text-white overflow-hidden flex items-center">
        <div className="px-[14px] text-[9px] leading-[30px] font-medium tracking-[0.18em] uppercase whitespace-nowrap border-r border-white/25 shrink-0">
          Live Feed
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap animate-ticker">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="px-[18px] text-[10px] tracking-[0.05em] opacity-88">
                {t}
                <span className="ml-[18px] opacity-40">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="border-b-2 border-eq-border2 px-[44px] h-[60px] flex items-center justify-between bg-eq-bg">
        <div className="flex items-center gap-[10px]">
          <div 
            className="w-[7px] h-[7px] bg-eq-accent rounded-full shrink-0 animate-blink"
          />
          <span className="font-display text-[21px] tracking-[0.05em] text-eq-ink">
            ECONOQUEST
          </span>
          <span className="text-[8px] tracking-[0.12em] text-eq-muted border border-eq-border2 px-[7px] py-[2px] uppercase">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-[22px]">
          <div className="hidden md:flex items-center gap-[22px]">
            <a href="#features" className="text-[11px] tracking-[0.08em] text-eq-muted uppercase hover:text-eq-accent transition-colors duration-150">
              Features
            </a>
            <a href="/leaderboard" className="text-[11px] tracking-[0.08em] text-eq-muted uppercase hover:text-eq-accent transition-colors duration-150">
              Rankings
            </a>
          </div>
          <button 
            onClick={onStart}
            className="bg-eq-accent text-white px-[22px] py-[10px] text-[11px] font-medium tracking-[0.09em] uppercase cursor-pointer hover:bg-eq-accent2 transition-colors duration-150 whitespace-nowrap"
          >
            Enter Platform →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section 
        className="grid grid-cols-[1fr_320px] gap-[52px] items-start px-[44px] py-[60px] pb-[72px] border-b border-eq-border2 animate-fade-up"
      >
        <div>
          <div className="flex items-center gap-[12px] flex-wrap mb-[24px]">
            <span className="text-[8px] font-medium tracking-[0.16em] text-eq-accent border border-eq-accent px-[9px] py-[3px] uppercase">
              ◉ Simulation Active
            </span>
            <span className="text-[9px] text-eq-muted tracking-[0.1em] uppercase">
              Mandate // Authority Granted
            </span>
          </div>

          <h1 className="font-display text-[clamp(64px,10vw,118px)] leading-[0.88] tracking-[0.025em] text-eq-ink mb-[30px]">
            THE WORLD<br />
            ECONOMY<br />
            IS <span className="text-eq-accent">YOURS</span>
            <span className="text-eq-accent" style={{ animation: 'eq-blink 1s step-end infinite' }}>█</span>
          </h1>

          <div className="border-l-[3px] border-eq-accent pl-[18px] mb-[30px] max-w-[520px]">
            <p className="text-[15px] leading-[1.85] text-eq-muted">
              Inflation. Debt spirals. Trade wars. Supply shocks.<br />
              You didn't cause this mess — but you've just been handed the keys.<br />
              <strong className="text-eq-ink font-medium">Build an empire. Crash the market. Find out what actually works.</strong>
            </p>
          </div>

          <div className="flex gap-[10px] flex-wrap">
            <button 
              onClick={onStart}
              className="bg-eq-accent text-white px-[40px] py-[17px] text-[14px] font-medium tracking-[0.09em] uppercase cursor-pointer hover:bg-eq-accent2 transition-colors duration-150 whitespace-nowrap"
            >
              ▶ Assume Command
            </button>
            <button className="bg-transparent text-eq-ink px-[40px] py-[17px] text-[14px] font-medium tracking-[0.09em] border-[1.5px] border-eq-border2 uppercase cursor-pointer hover:bg-black/5 hover:border-black/40 transition-all duration-150 whitespace-nowrap">
              Mission Briefing
            </button>
          </div>
        </div>

        {/* Data Panel */}
        <div className="border border-eq-border2 bg-eq-bg2">
          <div className="px-[18px] py-[16px] border-b border-eq-border2 text-[8px] font-medium tracking-[0.2em] text-eq-accent uppercase">
            World Economic Snapshot
          </div>
          {DATA_ROWS.map(({ label, val, delta, warn }) => (
            <div key={label} className="flex justify-between items-baseline px-[18px] py-[11px] border-b border-eq-border gap-[8px] last:border-b-0">
              <span className="text-[11px] text-eq-muted">{label}</span>
              <div className="text-right">
                <div className={`text-[12px] font-medium ${warn ? 'text-eq-accent' : ''}`}>
                  {val}
                </div>
                <div className={`text-[9px] mt-[1px] ${warn ? 'text-eq-accent' : 'text-eq-dim'}`}>
                  {delta}
                </div>
              </div>
            </div>
          ))}
          <div className="px-[18px] py-[13px] bg-eq-accent/5 border-t border-eq-accent/20">
            <div className="text-[8px] font-medium tracking-[0.14em] text-eq-accent uppercase mb-[4px]">
              Data from World Bank / IMF
            </div>
            <div className="text-[11px] text-eq-muted leading-[1.65]">
              Figures reflect 2024 estimates. Your simulation begins from this baseline.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-[44px] py-[64px] border-b border-eq-border2">
        <div className="flex justify-between items-baseline border-b border-eq-border2 pb-[18px] mb-[44px] flex-wrap gap-[8px]">
          <h2 className="font-display text-[36px] tracking-[0.05em] text-eq-ink">
            Simulation Modules
          </h2>
          <span className="text-[10px] text-eq-muted tracking-[0.09em] uppercase">
            Three core systems
          </span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-eq-border">
          {FEATURES.map(({ num, title, sub, body, tag }) => (
            <div 
              key={num} 
              className="bg-eq-bg px-[26px] py-[30px] hover:bg-eq-bg2 transition-colors duration-180"
            >
              <div className="text-[9px] tracking-[0.15em] text-eq-accent mb-[11px] font-medium">
                {num}
              </div>
              <div className="font-display text-[27px] tracking-[0.04em] text-eq-ink mb-[3px]">
                {title}
              </div>
              <div className="text-[10px] text-eq-muted tracking-[0.06em] mb-[13px] uppercase">
                {sub}
              </div>
              <p className="text-[13px] text-eq-muted leading-[1.8] mb-[18px]">
                {body}
              </p>
              <div className="text-[8px] text-eq-accent tracking-[0.1em] uppercase pt-[13px] border-t border-eq-border">
                {tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE + CHECKLIST */}
      <section className="grid grid-cols-2 gap-[56px] items-center px-[44px] py-[64px] border-b border-eq-border2 bg-eq-bg2">
        <div>
          <div className="font-display text-[72px] text-eq-accent leading-[0.8] opacity-22 mb-[6px]">
            "
          </div>
          <blockquote className="font-display text-[22px] leading-[1.25] tracking-[0.025em] text-eq-ink mb-[22px]">
            Not a game — a high-fidelity governance laboratory for the real world.
          </blockquote>
          <div className="flex items-center gap-[12px]">
            <div className="w-px h-[34px] bg-eq-accent shrink-0" />
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          {CHECKS.map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-[12px] px-[16px] py-[14px] border border-eq-border2 bg-eq-bg">
              <div className="w-[6px] h-[6px] bg-eq-accent rounded-full shrink-0 mt-[5px]" />
              <div>
                <div className="text-[12px] font-medium text-eq-ink mb-[3px]">
                  {title}
                </div>
                <div className="text-[11px] text-eq-muted leading-[1.6]">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-[44px] py-[64px] flex justify-between items-center gap-[40px] flex-wrap">
        <div>
          <div className="text-[9px] text-eq-muted tracking-[0.16em] uppercase mb-[10px]">
            Your mandate begins now
          </div>
          <h2 className="font-display text-[54px] leading-[0.9] tracking-[0.02em] text-eq-ink">
            READY TO<br />
            TAKE CONTROL?
          </h2>
        </div>
        <div className="flex flex-col items-center gap-[9px]">
          <button 
            onClick={onStart}
            className="bg-eq-accent text-white px-[40px] py-[17px] text-[14px] font-medium tracking-[0.09em] uppercase cursor-pointer hover:bg-eq-accent2 transition-colors duration-150 whitespace-nowrap"
          >
            ▶ Assume Command
          </button>
          <div className="text-[10px] text-eq-muted tracking-[0.08em] uppercase">
            Free to play · No account needed
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-eq-border2 px-[44px] py-[22px] flex justify-between items-center flex-wrap gap-[16px] bg-eq-bg2">
        <div className="flex items-center gap-[12px]">
          <span className="font-display text-[15px] tracking-[0.07em] text-eq-ink">
            ECONOQUEST
          </span>
          <span className="text-[9px] text-eq-muted tracking-[0.08em]">
            © 2025
          </span>
        </div>
        <div className="flex gap-[20px] flex-wrap">
          {['Simulation', 'Leaderboard', 'About', 'Terms'].map(item => (
            <a 
              key={item}
              href="#" 
              className="text-[11px] tracking-[0.08em] text-eq-muted uppercase hover:text-eq-accent transition-colors duration-150"
            >
              {item}
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes eq-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes eq-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes eq-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        .font-display {
          font-family: 'Bebas Neue', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;