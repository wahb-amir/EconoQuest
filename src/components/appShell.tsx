/**
 * src/components/shared/AppShell.tsx
 * ─────────────────────────────────────
 * Shared nav + page wrapper used by /setup and /rankings.
 * Keeps the ECONOQUEST logo + consistent nav structure
 * without duplicating markup in every page.
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
  .shell-root{--bg:#f2ebe0;--bg2:#e9e0d2;--ink:#1c1409;--border2:rgba(28,20,9,.22);--D:'Bebas Neue',sans-serif;--M:'DM Mono','Courier New',monospace;background:var(--bg);color:var(--ink);font-family:var(--M);min-height:100vh}
  .shell-root *{box-sizing:border-box;margin:0;padding:0}
  .shell-nav{border-bottom:2px solid var(--border2);padding:0 44px;height:60px;display:flex;align-items:center;justify-content:space-between;background:var(--bg)}
  .shell-logo{display:flex;align-items:center;gap:10px;cursor:pointer}
  .shell-logo-dot{width:6px;height:6px;background:#bf3509;border-radius:50%;animation:shell-blink 2s step-end infinite}
  .shell-logo-name{font-family:var(--D);font-size:20px;letter-spacing:.05em;color:var(--ink)}
  .shell-step{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.4);border:1px solid var(--border2);padding:3px 8px}
  .shell-nav-right{display:flex;align-items:center;gap:10px}
  .shell-body{padding:32px 44px;max-width:1100px;margin:0 auto}
  @keyframes shell-blink{0%,100%{opacity:1}50%{opacity:0}}
  @media(max-width:600px){.shell-nav{padding:0 20px;height:52px}.shell-body{padding:20px}}
`;

interface AppShellProps {
  children: React.ReactNode;
  navRight?: React.ReactNode;
  step?: string;
}

export function AppShell({ children, navRight, step }: AppShellProps) {
  const router = useRouter();

  return (
    <>
      <style>{css}</style>
      <div className="shell-root">
        <nav className="shell-nav">
          <div className="shell-logo" onClick={() => router.push('/')}>
            <div className="shell-logo-dot" />
            <span className="shell-logo-name">ECONOQUEST</span>
          </div>
          <div className="shell-nav-right">
            {step && <span className="shell-step">{step}</span>}
            {navRight}
          </div>
        </nav>
        <div className="shell-body">{children}</div>
      </div>
    </>
  );
}