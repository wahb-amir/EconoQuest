/**
 * src/app/rankings/page.tsx
 * ─────────────────────────
 * Route: /rankings
 *
 * Standalone leaderboard page.
 * No game state needed — just reads MOCK_LEADERBOARD.
 */
'use client';

import { useRouter } from 'next/navigation';
import { MOCK_LEADERBOARD } from '@/lib/simulation-engine';
import { AppShell } from '@/components/appShell';

const css = `
  .rp-hero{padding:40px 44px 28px;border-bottom:1px solid rgba(28,20,9,.22)}
  .rp-overtitle{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(28,20,9,.4);margin-bottom:8px;font-family:'DM Mono',monospace}
  .rp-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(44px,7vw,72px);line-height:.9;letter-spacing:.03em;color:#1c1409;margin-bottom:10px}
  .rp-title .acc{color:#bf3509}
  .rp-sub{font-size:13px;color:rgba(28,20,9,.52);line-height:1.7;max-width:460px;font-family:'DM Mono',monospace}
  .rp-body{padding:32px 44px;max-width:760px}
  .rp-row{display:grid;grid-template-columns:36px 1fr 100px;gap:0;padding:14px 18px;border-bottom:1px solid rgba(28,20,9,.08);align-items:center;transition:background .12s;font-family:'DM Mono',monospace}
  .rp-row:hover{background:#e9e0d2}
  .rp-row.gold{border-left:3px solid #bf3509;padding-left:15px}
  .rp-row.silver{border-left:3px solid rgba(28,20,9,.5);padding-left:15px}
  .rp-row.bronze{border-left:3px solid rgba(28,20,9,.22);padding-left:15px}
  .rp-rank{font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1;color:rgba(28,20,9,.18)}
  .rp-rank.gold{color:#bf3509}
  .rp-rank.silver{color:#1c1409}
  .rp-rank.bronze{color:rgba(28,20,9,.45)}
  .rp-name{font-size:13px;font-weight:500;color:#1c1409;margin-bottom:2px}
  .rp-badge{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.38);border:1px solid rgba(28,20,9,.15);padding:1px 6px;display:inline-block}
  .rp-score{font-family:'Bebas Neue',sans-serif;font-size:26px;line-height:1;color:#1c1409;text-align:right}
  .rp-score-lbl{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.35);text-align:right;font-family:'DM Mono',monospace}
  .rp-row.gold .rp-score{color:#bf3509}
  .rp-cta{margin-top:24px;padding:18px 20px;background:#e9e0d2;border:1px solid rgba(28,20,9,.22);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .rp-cta-text{font-size:12px;color:rgba(28,20,9,.52);font-family:'DM Mono',monospace}
  .rp-cta-btn{background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:11px 24px;cursor:pointer;transition:.12s}
  .rp-cta-btn:hover{background:#d94010}
  @media(max-width:600px){.rp-hero{padding:28px 20px}.rp-body{padding:20px}}
`;

export default function RankingsPage() {
  const router = useRouter();

  return (
    <>
      <style>{css}</style>
      <AppShell navRight={
        <button
          onClick={() => router.push('/')}
          style={{ background:'transparent', border:'1px solid rgba(28,20,9,.22)', color:'rgba(28,20,9,.52)', fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', padding:'8px 14px', cursor:'pointer' }}
        >
          ← Home
        </button>
      }>
        <div className="rp-hero">
          <div className="rp-overtitle">Global Rankings</div>
          <h1 className="rp-title">Hall of <span className="acc">Fame.</span></h1>
          <p className="rp-sub">
            Ranked by Wisdom Score — composite of growth, stability,
            public welfare and debt sustainability over 8 quarters.
          </p>
        </div>

        <div className="rp-body">
          {MOCK_LEADERBOARD.map((user, i) => {
            const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return (
              <div key={user.name} className={`rp-row ${cls}`}>
                <div className={`rp-rank ${cls}`}>{i + 1}</div>
                <div>
                  <div className="rp-name">{user.name}</div>
                  <span className="rp-badge">{user.badge}</span>
                </div>
                <div>
                  <div className="rp-score">{user.score}</div>
                  <div className="rp-score-lbl">pts</div>
                </div>
              </div>
            );
          })}

          <div className="rp-cta">
            <span className="rp-cta-text">Think you can do better?</span>
            <button className="rp-cta-btn" onClick={() => router.push('/setup')}>
              ▶ Start Simulation
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
}