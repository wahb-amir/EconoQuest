'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'eq_auth_popup_shown';

const GUEST_FEATURES = [
  { label: 'Full simulation engine',     available: true  },
  { label: 'All policy levers',          available: true  },
  { label: 'Economic metrics dashboard', available: true  },
  { label: 'View Hall of Fame',          available: true  },
  { label: 'AI Economic Advisor',        available: false },
  { label: 'Save progress & history',   available: false },
  { label: 'Appear on leaderboard',      available: false },
  { label: 'Post-game archetype card',   available: false },
  { label: 'Hall of Fame eligibility',   available: false },
];

const AUTH_FEATURES = [
  { label: 'Full simulation engine',     available: true },
  { label: 'All policy levers',          available: true },
  { label: 'Economic metrics dashboard', available: true },
  { label: 'View Hall of Fame',          available: true },
  { label: 'AI Economic Advisor',        available: true },
  { label: 'Save progress & history',   available: true },
  { label: 'Appear on leaderboard',      available: true },
  { label: 'Post-game archetype card',   available: true },
  { label: 'Hall of Fame eligibility',   available: true },
];

const CSS = `
  .aq-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(28,20,9,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 12px;
    animation: aq-fade-in .2s ease both;
  }
  @keyframes aq-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes aq-slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .aq-modal {
    background: #f2ebe0;
    border: 2px solid rgba(28,20,9,0.22);
    box-shadow: 0 4px 0 rgba(28,20,9,0.18), 0 20px 60px rgba(28,20,9,0.22);
    width: 100%;
    max-width: 680px;
    max-height: calc(100vh - 24px);
    display: flex;
    flex-direction: column;
    font-family: 'DM Mono','Courier New',monospace;
    animation: aq-slide-up .25s ease both;
    overflow: hidden;
  }
  .aq-header {
    padding: 18px 20px 16px;
    border-bottom: 1px solid rgba(28,20,9,0.15);
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-shrink: 0;
  }
  .aq-eyebrow {
    font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
    color: #bf3509; margin-bottom: 5px; font-weight: 500;
  }
  .aq-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; letter-spacing: .04em; color: #1c1409; line-height: 1;
  }
  .aq-close {
    background: transparent; border: 1.5px solid rgba(28,20,9,0.2);
    width: 28px; height: 28px; min-width: 28px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: rgba(28,20,9,0.4);
    flex-shrink: 0; margin-top: 2px;
    transition: border-color .12s, color .12s;
  }
  .aq-close:hover { border-color: #bf3509; color: #bf3509; }

  /* scrollable body */
  .aq-body {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .aq-cols {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 1px; background: rgba(28,20,9,0.12);
  }
  .aq-col {
    background: #f2ebe0; padding: 16px 18px;
  }
  .aq-col-head {
    font-size: 9px; letter-spacing: .18em; text-transform: uppercase;
    font-weight: 500; margin-bottom: 14px; padding-bottom: 9px;
    border-bottom: 1px solid rgba(28,20,9,0.12);
    display: flex; align-items: center; gap: 8px;
  }
  .aq-col-head.guest { color: rgba(28,20,9,0.45); }
  .aq-col-head.member { color: #bf3509; }
  .aq-col-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }
  .aq-col-dot.guest  { background: rgba(28,20,9,0.3); }
  .aq-col-dot.member { background: #bf3509; }

  .aq-feature-list { display: flex; flex-direction: column; gap: 7px; }
  .aq-feature {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; line-height: 1.4;
  }
  .aq-feature-icon {
    width: 15px; height: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 500;
  }
  .aq-feature-icon.yes {
    background: rgba(45,106,45,0.12); color: #2d6a2d;
    border: 1px solid rgba(45,106,45,0.25);
  }
  .aq-feature-icon.no {
    background: rgba(191,53,9,0.08); color: #bf3509;
    border: 1px solid rgba(191,53,9,0.2);
  }
  .aq-feature-label.locked { color: rgba(28,20,9,0.35); }
  .aq-feature-label.active { color: #1c1409; }

  .aq-missing-count {
    background: rgba(191,53,9,0.08);
    border-top: 1px solid rgba(191,53,9,0.15);
    padding: 9px 18px;
    font-size: 10px; color: rgba(28,20,9,0.5);
    flex-shrink: 0;
  }
  .aq-missing-count span { color: #bf3509; font-weight: 500; }

  .aq-footer {
    padding: 14px 20px;
    border-top: 1px solid rgba(28,20,9,0.12);
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
    flex-shrink: 0;
  }
  .aq-footer-note {
    font-size: 10px; color: rgba(28,20,9,0.4); line-height: 1.5;
    flex: 1; min-width: 0;
  }
  .aq-footer-note strong { color: #1c1409; }
  .aq-actions { display: flex; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }

  .aq-btn-primary {
    background: #bf3509; color: #fff; border: none;
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: .09em; text-transform: uppercase;
    padding: 10px 18px; cursor: pointer;
    transition: background .12s; white-space: nowrap;
    text-decoration: none; display: inline-flex; align-items: center;
  }
  .aq-btn-primary:hover { background: #d94010; }

  .aq-btn-ghost {
    background: transparent; color: rgba(28,20,9,0.55);
    border: 1.5px solid rgba(28,20,9,0.2);
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: .09em; text-transform: uppercase;
    padding: 10px 18px; cursor: pointer;
    transition: border-color .12s, color .12s; white-space: nowrap;
  }
  .aq-btn-ghost:hover { border-color: rgba(28,20,9,0.4); color: #1c1409; }

  .aq-skip {
    font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
    color: rgba(28,20,9,0.32); background: transparent; border: none;
    cursor: pointer; font-family: 'DM Mono', monospace;
    padding: 0; transition: color .12s;
  }
  .aq-skip:hover { color: rgba(28,20,9,0.6); }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .aq-overlay { padding: 8px; }

    .aq-modal { max-height: calc(100vh - 16px); }

    .aq-header { padding: 14px 14px 12px; gap: 10px; }
    .aq-title  { font-size: 22px; }

    /* stack the two feature columns */
    .aq-cols { grid-template-columns: 1fr; }
    .aq-col  { padding: 14px 14px; }

    /* tighten feature rows */
    .aq-feature { font-size: 10.5px; gap: 7px; }

    .aq-missing-count { padding: 8px 14px; }

    /* footer stacks vertically */
    .aq-footer {
      flex-direction: column;
      align-items: flex-start;
      padding: 12px 14px;
      gap: 10px;
    }
    .aq-footer-note { font-size: 9.5px; }

    /* buttons fill width */
    .aq-actions { width: 100%; }
    .aq-btn-primary,
    .aq-btn-ghost {
      flex: 1;
      justify-content: center;
      text-align: center;
      padding: 10px 10px;
      font-size: 10px;
    }
  }
`;

export function AuthFeaturePopup() {
  const { isAuthenticated, isLoading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;

    const already = sessionStorage.getItem(STORAGE_KEY);
    if (already) return;

    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, [isLoading, isAuthenticated]);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const lockedCount = GUEST_FEATURES.filter(f => !f.available).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
        ${CSS}
      `}</style>

      <div className="aq-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}>
        <div className="aq-modal">

          {/* Header */}
          <div className="aq-header">
            <div>
              <p className="aq-eyebrow">Playing as Guest</p>
              <h2 className="aq-title">Unlock the Full Experience</h2>
            </div>
            <button className="aq-close" onClick={dismiss}>✕</button>
          </div>

          {/* Scrollable body */}
          <div className="aq-body">

            {/* Feature comparison */}
            <div className="aq-cols">
              {/* Guest column */}
              <div className="aq-col">
                <div className="aq-col-head guest">
                  <span className="aq-col-dot guest" />
                  Guest Access
                </div>
                <div className="aq-feature-list">
                  {GUEST_FEATURES.map(f => (
                    <div key={f.label} className="aq-feature">
                      <span className={`aq-feature-icon ${f.available ? 'yes' : 'no'}`}>
                        {f.available ? '✓' : '✕'}
                      </span>
                      <span className={`aq-feature-label ${f.available ? 'active' : 'locked'}`}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member column */}
              <div className="aq-col" style={{ background: '#ede5d8' }}>
                <div className="aq-col-head member">
                  <span className="aq-col-dot member" />
                  Registered Leader
                </div>
                <div className="aq-feature-list">
                  {AUTH_FEATURES.map(f => (
                    <div key={f.label} className="aq-feature">
                      <span className="aq-feature-icon yes">✓</span>
                      <span className="aq-feature-label active">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Missing count strip */}
            <div className="aq-missing-count">
              You are missing <span>{lockedCount} features</span> — all free, no card required.
            </div>

          </div>{/* /aq-body */}

          {/* Footer — always visible, never scrolls away */}
          <div className="aq-footer">
            <p className="aq-footer-note">
              <strong>Free forever.</strong> Create an account to unlock AI hints,
              leaderboard ranking, and your post-game archetype.
            </p>
            <div className="aq-actions">
              <button className="aq-btn-ghost" onClick={dismiss}>
                Continue as Guest
              </button>
              <a href="/register" className="aq-btn-primary">
                Create Account →
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
