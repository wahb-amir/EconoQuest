'use client';

import React, { useEffect } from 'react';

function useEconoStyles() {
  useEffect(() => {
    const id = 'econoquest-v4-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
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

      .eq-root * { box-sizing: border-box; margin: 0; padding: 0; }

      .eq-root {
        --bg:      #f2ebe0;
        --bg2:     #e9e0d2;
        --bg3:     #dfd4c4;
        --ink:     #1c1409;
        --acc:     #bf3509;
        --acc2:    #d94010;
        --muted:   rgba(28,20,9,0.52);
        --dim:     rgba(28,20,9,0.32);
        --border:  rgba(28,20,9,0.13);
        --border2: rgba(28,20,9,0.22);
        --mono:    'DM Mono', 'Courier New', monospace;
        --display: 'Bebas Neue', sans-serif;
        background: var(--bg);
        color: var(--ink);
        font-family: var(--mono);
        line-height: 1.6;
        min-height: 100vh;
      }

      /* TICKER */
      .eq-ticker-wrap {
        background: var(--acc);
        color: #fff;
        height: 30px;
        overflow: hidden;
        display: flex;
        align-items: center;
      }
      .eq-ticker-label {
        padding: 0 14px;
        font-size: 9px;
        letter-spacing: .18em;
        text-transform: uppercase;
        white-space: nowrap;
        border-right: 1px solid rgba(255,255,255,.25);
        height: 100%;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      .eq-ticker-track {
        display: flex;
        animation: eq-ticker 44s linear infinite;
        white-space: nowrap;
      }
      .eq-ticker-item {
        padding: 0 18px;
        font-size: 10px;
        letter-spacing: .05em;
        opacity: .88;
      }
      .eq-ticker-item::after {
        content: '·';
        margin-left: 18px;
        opacity: .4;
      }

      /* NAV */
      .eq-nav {
        border-bottom: 2px solid var(--border2);
        padding: 0 44px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--bg);
      }
      .eq-logo { display: flex; align-items: center; gap: 10px; }
      .eq-logo-dot {
        width: 7px; height: 7px;
        background: var(--acc);
        border-radius: 50%;
        animation: eq-blink 2s step-end infinite;
        flex-shrink: 0;
      }
      .eq-logo-name {
        font-family: var(--display);
        font-size: 21px;
        letter-spacing: .05em;
        color: var(--ink);
      }
      .eq-logo-badge {
        font-size: 8px;
        letter-spacing: .12em;
        color: var(--muted);
        border: 1px solid var(--border2);
        padding: 2px 7px;
        text-transform: uppercase;
      }
      .eq-nav-links { display: flex; align-items: center; gap: 22px; }
      .eq-nav-desktop { display: flex; align-items: center; gap: 22px; }
      .eq-nav-link {
        font-size: 11px;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--muted);
        text-decoration: none;
        transition: color .15s;
      }
      .eq-nav-link:hover { color: var(--acc); }

      /* BUTTONS */
      .eq-btn-primary {
        background: var(--acc);
        color: #fff;
        border: none;
        font-family: var(--mono);
        font-weight: 500;
        font-size: 11px;
        letter-spacing: .09em;
        text-transform: uppercase;
        cursor: pointer;
        padding: 10px 22px;
        transition: background .12s;
        white-space: nowrap;
      }
      .eq-btn-primary:hover { background: var(--acc2); }
      .eq-btn-primary.lg { font-size: 14px; padding: 17px 40px; }

      .eq-btn-ghost {
        background: transparent;
        color: var(--ink);
        border: 1.5px solid var(--border2);
        font-family: var(--mono);
        font-weight: 500;
        font-size: 11px;
        letter-spacing: .09em;
        text-transform: uppercase;
        cursor: pointer;
        padding: 10px 22px;
        transition: background .12s, border-color .12s;
        white-space: nowrap;
      }
      .eq-btn-ghost:hover { background: rgba(28,20,9,.05); border-color: rgba(28,20,9,.4); }
      .eq-btn-ghost.lg { font-size: 14px; padding: 17px 40px; }

      /* HERO */
      .eq-hero {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 52px;
        align-items: start;
        padding: 60px 44px 72px;
        border-bottom: 1px solid var(--border2);
        animation: eq-fade-up .6s ease both;
      }
      .eq-classify-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      .eq-classify-badge {
        font-size: 8px;
        font-weight: 500;
        letter-spacing: .16em;
        color: var(--acc);
        border: 1px solid var(--acc);
        padding: 3px 9px;
        text-transform: uppercase;
      }
      .eq-classify-sub {
        font-size: 9px;
        color: var(--muted);
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .eq-headline {
        font-family: var(--display);
        font-size: clamp(64px, 10vw, 118px);
        line-height: .88;
        letter-spacing: .025em;
        color: var(--ink);
        margin-bottom: 30px;
      }
      .eq-headline .acc { color: var(--acc); }
      .eq-headline .cursor::after {
        content: '█';
        color: var(--acc);
        font-size: .58em;
        animation: eq-blink 1s step-end infinite;
      }
      .eq-lead {
        border-left: 3px solid var(--acc);
        padding-left: 18px;
        margin-bottom: 30px;
        max-width: 520px;
      }
      .eq-lead p {
        font-size: 15px;
        line-height: 1.85;
        color: var(--muted);
      }
      .eq-lead strong { color: var(--ink); font-weight: 500; }
      .eq-ctas { display: flex; gap: 10px; flex-wrap: wrap; }

      /* DATA PANEL */
      .eq-panel { border: 1px solid var(--border2); background: var(--bg2); }
      .eq-panel-head {
        padding: 16px 18px;
        border-bottom: 1px solid var(--border2);
        font-size: 8px;
        font-weight: 500;
        letter-spacing: .2em;
        color: var(--acc);
        text-transform: uppercase;
      }
      .eq-data-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 11px 18px;
        border-bottom: 1px solid var(--border);
        gap: 8px;
      }
      .eq-data-row:last-of-type { border-bottom: none; }
      .eq-data-label { font-size: 11px; color: var(--muted); }
      .eq-data-val { font-size: 12px; font-weight: 500; text-align: right; }
      .eq-data-delta { font-size: 9px; text-align: right; margin-top: 1px; color: var(--dim); }
      .eq-data-val.warn { color: var(--acc); }
      .eq-data-delta.warn { color: var(--acc); }
      .eq-note-box {
        padding: 13px 18px;
        background: rgba(191,53,9,.06);
        border-top: 1px solid rgba(191,53,9,.18);
      }
      .eq-note-title {
        font-size: 8px;
        font-weight: 500;
        letter-spacing: .14em;
        color: var(--acc);
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .eq-note-body { font-size: 11px; color: var(--muted); line-height: 1.65; }

      /* FEATURES */
      .eq-features { padding: 64px 44px; border-bottom: 1px solid var(--border2); }
      .eq-section-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid var(--border2);
        padding-bottom: 18px;
        margin-bottom: 44px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .eq-section-title {
        font-family: var(--display);
        font-size: 36px;
        letter-spacing: .05em;
        color: var(--ink);
      }
      .eq-section-meta { font-size: 10px; color: var(--muted); letter-spacing: .09em; text-transform: uppercase; }
      .eq-feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: var(--border);
      }
      .eq-feature-card { background: var(--bg); padding: 30px 26px; transition: background .18s; }
      .eq-feature-card:hover { background: var(--bg2); }
      .eq-feature-num { font-size: 9px; letter-spacing: .15em; color: var(--acc); margin-bottom: 11px; font-weight: 500; }
      .eq-feature-title { font-family: var(--display); font-size: 27px; letter-spacing: .04em; color: var(--ink); margin-bottom: 3px; }
      .eq-feature-sub { font-size: 10px; color: var(--muted); letter-spacing: .06em; margin-bottom: 13px; text-transform: uppercase; }
      .eq-feature-body { font-size: 13px; color: var(--muted); line-height: 1.8; margin-bottom: 18px; }
      .eq-feature-tag { font-size: 8px; color: var(--acc); letter-spacing: .1em; text-transform: uppercase; padding-top: 13px; border-top: 1px solid var(--border); }

      /* QUOTE */
      .eq-quote-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 56px;
        align-items: center;
        padding: 64px 44px;
        border-bottom: 1px solid var(--border2);
        background: var(--bg2);
      }
      .eq-big-quote { font-family: var(--display); font-size: 72px; color: var(--acc); line-height: .8; opacity: .22; margin-bottom: 6px; }
      .eq-blockquote { font-family: var(--display); font-size: 22px; line-height: 1.25; letter-spacing: .025em; color: var(--ink); margin-bottom: 22px; }
      .eq-attribution { display: flex; align-items: center; gap: 12px; }
      .eq-attr-line { width: 1px; height: 34px; background: var(--acc); flex-shrink: 0; }
      .eq-attr-name { font-size: 13px; font-weight: 500; color: var(--ink); }
      .eq-attr-role { font-size: 9px; color: var(--muted); letter-spacing: .09em; text-transform: uppercase; margin-top: 2px; }
      .eq-checklist { display: flex; flex-direction: column; gap: 14px; }
      .eq-check-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border: 1px solid var(--border2); background: var(--bg); }
      .eq-check-dot { width: 6px; height: 6px; background: var(--acc); border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
      .eq-check-title { font-size: 12px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
      .eq-check-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }

      /* CTA */
      .eq-cta-band {
        padding: 64px 44px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 40px;
        flex-wrap: wrap;
      }
      .eq-cta-eyebrow { font-size: 9px; color: var(--muted); letter-spacing: .16em; text-transform: uppercase; margin-bottom: 10px; }
      .eq-cta-headline { font-family: var(--display); font-size: 54px; line-height: .9; letter-spacing: .02em; color: var(--ink); }
      .eq-cta-aside { display: flex; flex-direction: column; align-items: center; gap: 9px; }
      .eq-cta-note { font-size: 10px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }

      /* FOOTER */
      .eq-footer {
        border-top: 2px solid var(--border2);
        padding: 22px 44px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        background: var(--bg2);
      }
      .eq-footer-left { display: flex; align-items: center; gap: 12px; }
      .eq-footer-wm { font-family: var(--display); font-size: 15px; letter-spacing: .07em; color: var(--ink); }
      .eq-footer-copy { font-size: 9px; color: var(--muted); letter-spacing: .08em; }
      .eq-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }

      /* RESPONSIVE */
      @media (max-width: 720px) {
        .eq-nav { padding: 0 20px; height: 52px; }
        .eq-nav-desktop { display: none; }
        .eq-hero { grid-template-columns: 1fr; gap: 32px; padding: 36px 20px 48px; }
        .eq-features { padding: 44px 20px; }
        .eq-feature-grid { grid-template-columns: 1fr; }
        .eq-quote-section { grid-template-columns: 1fr; gap: 32px; padding: 44px 20px; }
        .eq-cta-band { flex-direction: column; align-items: flex-start; gap: 24px; padding: 44px 20px; }
        .eq-footer { padding: 20px; flex-direction: column; align-items: flex-start; }
      }
      @media (max-width: 440px) {
        .eq-headline { font-size: clamp(52px, 16vw, 80px); }
        .eq-ctas { flex-direction: column; }
        .eq-btn-primary.lg, .eq-btn-ghost.lg { width: 100%; text-align: center; }
      }
    `;
    document.head.appendChild(el);
  }, []);
}

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
  useEconoStyles();

  return (
    <div className="eq-root">

      {/* TICKER */}
      <div className="eq-ticker-wrap">
        <div className="eq-ticker-label">Live Feed</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="eq-ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span className="eq-ticker-item" key={i}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="eq-nav">
        <div className="eq-logo">
          <div className="eq-logo-dot" />
          <span className="eq-logo-name">ECONOQUEST</span>
          <span className="eq-logo-badge">Beta</span>
        </div>
        <div className="eq-nav-links">
          <div className="eq-nav-desktop">
            <a href="#features" className="eq-nav-link">Features</a>
            <a href="#rankings" className="eq-nav-link">Rankings</a>
          </div>
          <button className="eq-btn-primary" onClick={onStart}>Enter Platform →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="eq-hero">
        <div>
          <div className="eq-classify-row">
            <span className="eq-classify-badge">◉ Simulation Active</span>
            <span className="eq-classify-sub">Mandate // Authority Granted</span>
          </div>
          <h1 className="eq-headline">
            THE WORLD<br />
            ECONOMY<br />
            IS <span className="acc">YOURS</span>.<span className="cursor" />
          </h1>
          <div className="eq-lead">
            <p>
              Inflation. Debt spirals. Trade wars. Supply shocks.<br />
              You didn't cause this mess — but you've just been handed the keys.<br />
              <strong>Build an empire. Crash the market. Find out what actually works.</strong>
            </p>
          </div>
          <div className="eq-ctas">
            <button className="eq-btn-primary lg" onClick={onStart}>▶ Assume Command</button>
            <button className="eq-btn-ghost lg">Mission Briefing</button>
          </div>
        </div>

        <div className="eq-panel">
          <div className="eq-panel-head">World Economic Snapshot</div>
          {DATA_ROWS.map(({ label, val, delta, warn }) => (
            <div className="eq-data-row" key={label}>
              <span className="eq-data-label">{label}</span>
              <div>
                <div className={`eq-data-val${warn ? ' warn' : ''}`}>{val}</div>
                <div className={`eq-data-delta${warn ? ' warn' : ''}`}>{delta}</div>
              </div>
            </div>
          ))}
          <div className="eq-note-box">
            <div className="eq-note-title">Data from World Bank / IMF</div>
            <div className="eq-note-body">Figures reflect 2024 estimates. Your simulation begins from this baseline.</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="eq-features">
        <div className="eq-section-header">
          <h2 className="eq-section-title">Simulation Modules</h2>
          <span className="eq-section-meta">Three core systems</span>
        </div>
        <div className="eq-feature-grid">
          {FEATURES.map(({ num, title, sub, body, tag }) => (
            <div className="eq-feature-card" key={num}>
              <div className="eq-feature-num">{num}</div>
              <div className="eq-feature-title">{title}</div>
              <div className="eq-feature-sub">{sub}</div>
              <p className="eq-feature-body">{body}</p>
              <div className="eq-feature-tag">{tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE + CHECKLIST */}
      <section className="eq-quote-section">
        <div>
          <div className="eq-big-quote">"</div>
          <blockquote className="eq-blockquote">
            Not a game — a high-fidelity governance laboratory for the real world.
          </blockquote>
          <div className="eq-attribution">
            <div className="eq-attr-line" />
            <div>
              <div className="eq-attr-name">Dr. Elena Volkov</div>
              <div className="eq-attr-role">Head of Macro, Global Institute</div>
            </div>
          </div>
        </div>
        <div className="eq-checklist">
          {CHECKS.map(({ title, desc }) => (
            <div className="eq-check-item" key={title}>
              <div className="eq-check-dot" />
              <div>
                <div className="eq-check-title">{title}</div>
                <div className="eq-check-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="eq-cta-band">
        <div>
          <div className="eq-cta-eyebrow">Your mandate begins now</div>
          <h2 className="eq-cta-headline">READY TO<br />TAKE CONTROL?</h2>
        </div>
        <div className="eq-cta-aside">
          <button className="eq-btn-primary lg" onClick={onStart}>▶ Assume Command</button>
          <div className="eq-cta-note">Free to play · No account needed</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="eq-footer">
        <div className="eq-footer-left">
          <span className="eq-footer-wm">ECONOQUEST</span>
          <span className="eq-footer-copy">© 2025</span>
        </div>
        <div className="eq-footer-links">
          {['Simulation', 'Leaderboard', 'About', 'Terms'].map(item => (
            <a href="#" className="eq-nav-link" key={item}>{item}</a>
          ))}
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;