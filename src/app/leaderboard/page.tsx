'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalEntry {
  player_name:    string;
  nation_name:    string;
  difficulty:     string;
  raw_score:      number;
  weighted_score: number;
  archetype:      string;
}

interface NationEntry {
  rank:        number;
  player_name: string;
  raw_score:   number;
  archetype:   string;
  difficulty:  string;
}

interface NationGroup {
  nation_name: string;
  difficulty:  string;
  top_score:   number;
  top_entries: NationEntry[];
}

const DIFF = {
  easy:   { label: 'Easy',   mult: '×1.0', bg: '#eaf3de', fg: '#3b6d11', br: '#c0dd97' },
  medium: { label: 'Medium', mult: '×1.4', bg: '#e6f1fb', fg: '#0c447c', br: '#85b7eb' },
  hard:   { label: 'Hard',   mult: '×2.0', bg: '#fcebeb', fg: '#791f1f', br: '#f09595' },
};

const ARCH_ICON: Record<string, string> = {
  'The Balanced Steward': '⊕',
  'The Inflation Hawk':   '◈',
  'The Tech Visionary':   '◉',
  'The Populist':         '▼',
  'The Debt Architect':   '∑',
  'The Isolationist':     '◻',
  'The Gambler':          '◆',
};

function dc(d: string) { return DIFF[d as keyof typeof DIFF] ?? DIFF.medium; }
function fmt(n: number) { return Math.round(n).toLocaleString(); }
function rcl(r: number) { return r===1?'g':r===2?'s':r===3?'b':''; }
function medal(r: number) {
  return r===1?'Champion':r===2?'Runner-up':r===3?'Third Place':`#${r}`;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.p{
  --bg:#f2ebe0;--bg2:#e9e0d2;--bg3:#dfd4c4;
  --ink:#1c1409;--acc:#bf3509;--acc2:#d94010;
  --muted:rgba(28,20,9,.5);--dim:rgba(28,20,9,.3);
  --b1:rgba(28,20,9,.1);--b2:rgba(28,20,9,.2);
  --mono:'DM Mono','Courier New',monospace;
  --disp:'Bebas Neue',sans-serif;
  background:var(--bg);color:var(--ink);
  font-family:var(--mono);min-height:100vh;
}

/* ticker */
.tick{background:var(--acc);height:28px;overflow:hidden;display:flex;align-items:center}
.tick-lbl{padding:0 16px;font-size:8px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(255,255,255,.8);border-right:1px solid rgba(255,255,255,.2);
  height:100%;display:flex;align-items:center;flex-shrink:0;white-space:nowrap}
.tick-track{display:flex;animation:scroll 60s linear infinite;white-space:nowrap}
.tick-item{padding:0 24px;font-size:9px;color:rgba(255,255,255,.75);letter-spacing:.05em}
.tick-item::after{content:'·';margin-left:24px;opacity:.4}
@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* nav */
.nav{border-bottom:2px solid var(--b2);padding:0 48px;height:60px;
  display:flex;align-items:center;justify-content:space-between;background:var(--bg)}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.nav-dot{width:7px;height:7px;background:var(--acc);border-radius:50%;
  animation:blink 2s step-end infinite}
.nav-name{font-family:var(--disp);font-size:22px;letter-spacing:.05em;color:var(--ink)}
.nav-right{display:flex;align-items:center;gap:24px}
.nav-link{font-size:10px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--muted);text-decoration:none;transition:color .14s}
.nav-link:hover{color:var(--acc)}
.nav-cta{background:var(--acc);color:#f2ebe0;padding:9px 18px;font-family:var(--mono);
  font-size:10px;letter-spacing:.09em;text-transform:uppercase;text-decoration:none;
  transition:background .12s}
.nav-cta:hover{background:var(--acc2)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

/* hero */
.hero{padding:56px 48px 48px;border-bottom:1px solid var(--b2);
  display:grid;grid-template-columns:1fr auto;gap:48px;align-items:end}
.hero-eye{font-size:9px;letter-spacing:.22em;text-transform:uppercase;
  color:var(--acc);margin-bottom:12px}
.hero-h{font-family:var(--disp);font-size:clamp(56px,9vw,100px);
  line-height:.86;letter-spacing:.02em;margin-bottom:20px}
.hero-h .r{color:var(--acc)}
.hero-desc{font-size:12px;color:var(--muted);line-height:1.85;max-width:460px;
  border-left:3px solid var(--acc);padding-left:16px}
.hero-stats{display:flex;flex-direction:column;gap:8px}
.hstat{padding:14px 20px;border:1.5px solid var(--b2);background:var(--bg2);
  min-width:150px;text-align:right}
.hstat-n{font-family:var(--disp);font-size:36px;letter-spacing:.03em;line-height:1}
.hstat-n .r{color:var(--acc)}
.hstat-l{font-size:8px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted);margin-top:2px}

/* controls */
.ctrl{padding:14px 48px;border-bottom:1px solid var(--b1);
  display:flex;align-items:center;gap:20px;flex-wrap:wrap;background:var(--bg2)}
.ctrl-lbl{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);white-space:nowrap}
.ctrl-btns{display:flex;gap:6px;flex-wrap:wrap}
.cbtn{background:transparent;border:1.5px solid var(--b2);font-family:var(--mono);
  font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
  padding:7px 15px;cursor:pointer;transition:.12s}
.cbtn:hover{border-color:rgba(28,20,9,.4);color:var(--ink)}
.cbtn.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}

/* tabs */
.tabs{padding:0 48px;border-bottom:2px solid var(--b2);display:flex}
.ttab{background:transparent;border:none;border-bottom:3px solid transparent;
  font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);padding:15px 20px;cursor:pointer;transition:.12s;
  display:flex;align-items:center;gap:7px;margin-bottom:-2px;white-space:nowrap}
.ttab.on{color:var(--acc);border-bottom-color:var(--acc)}
.ttab:hover:not(.on){color:var(--ink)}
.tcount{font-size:8px;background:rgba(28,20,9,.1);padding:1px 6px;color:var(--muted)}
.ttab.on .tcount{background:rgba(191,53,9,.14);color:var(--acc)}

/* main */
.main{padding:36px 48px 80px;max-width:1440px;margin:0 auto}

/* weight bar */
.wbar{border:1px solid var(--b2);background:var(--bg2);padding:18px 24px;
  margin-bottom:28px;display:flex;align-items:center;gap:0;flex-wrap:wrap}
.wbar-text{flex:1;min-width:200px;padding-right:24px}
.wbar-title{font-size:8px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--muted);margin-bottom:4px}
.wbar-desc{font-size:11px;color:var(--ink);line-height:1.65}
.wbar-item{padding:10px 22px;border-left:1px solid var(--b1);text-align:center}
.wbar-mult{font-family:var(--disp);font-size:30px;line-height:1;margin-bottom:1px}
.wbar-diff{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}

/* podium */
.podium{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:10px;
  margin-bottom:28px;align-items:end}
.pod{border:1.5px solid var(--b2);background:var(--bg2);padding:20px 20px 16px;
  position:relative;overflow:hidden;transition:transform .14s,box-shadow .14s}
.pod:hover{transform:translateY(-3px);
  box-shadow:0 6px 0 rgba(28,20,9,.1),0 12px 28px rgba(28,20,9,.08)}
.pod.p1{border-color:#b8860b;
  background:linear-gradient(155deg,#fdf8ec 0%,var(--bg2) 100%);
  box-shadow:0 2px 0 #b8860b,0 4px 16px rgba(184,134,11,.1)}
.pod.p1:hover{box-shadow:0 6px 0 #b8860b,0 16px 32px rgba(184,134,11,.15)}
.pod-stripe{position:absolute;top:0;left:0;right:0;height:3px}
.pod-bg-num{position:absolute;bottom:-10px;right:10px;font-family:var(--disp);
  font-size:72px;line-height:1;opacity:.07;pointer-events:none}
.pod-medal{font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  font-weight:500;margin-bottom:6px}
.pod-name{font-family:var(--disp);font-size:24px;letter-spacing:.03em;line-height:1.1;margin-bottom:3px}
.pod-nation{font-size:10px;color:var(--muted);letter-spacing:.04em;margin-bottom:4px}
.pod-arch{font-size:9px;color:var(--acc);letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px}
.pod-scores{padding-top:12px;border-top:1px solid var(--b1);
  display:flex;justify-content:space-between;align-items:flex-end}
.pod-ws{font-family:var(--disp);font-size:30px;color:var(--acc);line-height:1}
.pod-wl{font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.pod-rs{font-size:11px;color:var(--dim)}

/* table */
.tbl{border:1.5px solid var(--b2);overflow:hidden}
.tbl-head{display:grid;grid-template-columns:52px 1fr 180px 90px 120px;
  padding:10px 18px;background:var(--bg3);
  border-bottom:1.5px solid var(--b2)}
.th{font-size:7px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
.th:nth-child(4),.th:nth-child(5){text-align:right}
.trow{display:grid;grid-template-columns:52px 1fr 180px 90px 120px;
  padding:13px 18px;border-bottom:1px solid var(--b1);
  align-items:center;transition:background .1s}
.trow:last-child{border-bottom:none}
.trow:hover{background:rgba(28,20,9,.03)}
.rank{font-family:var(--disp);font-size:22px;letter-spacing:.02em;color:rgba(28,20,9,.18)}
.rank.g{color:#b8860b}.rank.s{color:#888}.rank.b{color:#8b5513}
.pname{font-size:13px;font-weight:500;margin-bottom:2px}
.parch{font-size:9px;color:var(--muted);display:flex;align-items:center;gap:5px}
.nname{font-size:12px;margin-bottom:3px}
.dpill{display:inline-flex;align-items:center;font-size:7px;
  letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;font-weight:500}
.rraw{font-size:13px;color:var(--dim);text-align:right}
.rws{font-family:var(--disp);font-size:22px;color:var(--acc);text-align:right;line-height:1}
.rwl{font-size:7px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--dim);text-align:right;margin-top:1px}

/* nations grid */
.ngrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ncard{border:1.5px solid var(--b2);background:var(--bg);overflow:hidden;
  transition:transform .14s,box-shadow .14s,border-color .14s}
.ncard:hover{transform:translateY(-3px);
  box-shadow:0 5px 0 rgba(28,20,9,.1),0 12px 24px rgba(28,20,9,.07);
  border-color:rgba(28,20,9,.3)}
.ncard-top{padding:16px 18px 14px;border-bottom:1px solid var(--b1);background:var(--bg2)}
.ncard-name{font-family:var(--disp);font-size:22px;letter-spacing:.04em;
  line-height:1;margin:5px 0 8px}
.ncard-meta{display:flex;align-items:baseline;justify-content:space-between}
.ncard-rec{font-family:var(--disp);font-size:22px;color:var(--acc);line-height:1}
.ncard-rl{font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:2px}
.nprow{display:flex;align-items:center;gap:10px;padding:9px 16px;
  border-bottom:1px solid var(--b1);transition:background .1s}
.nprow:last-child{border-bottom:none}
.nprow:hover{background:rgba(28,20,9,.03)}
.npr{font-family:var(--disp);font-size:15px;color:rgba(28,20,9,.2);width:20px;flex-shrink:0}
.npr.g{color:#b8860b}.npr.s{color:#888}.npr.b{color:#8b5513}
.npn{flex:1;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.npa{font-size:8px;color:var(--muted);white-space:nowrap;letter-spacing:.05em}
.nps{font-family:var(--disp);font-size:17px;color:var(--acc);flex-shrink:0}

/* empty / loading */
.empty{padding:72px 20px;text-align:center;border:1.5px dashed var(--b2)}
.empty-ico{font-family:var(--disp);font-size:60px;color:rgba(28,20,9,.08);line-height:1;margin-bottom:10px}
.empty-t{font-family:var(--disp);font-size:26px;color:rgba(28,20,9,.2);
  letter-spacing:.04em;margin-bottom:8px}
.empty-s{font-size:11px;color:var(--dim);line-height:1.7}
.spin{padding:72px 20px;display:flex;flex-direction:column;align-items:center;gap:14px}
.sdot{width:9px;height:9px;background:var(--acc);border-radius:50%;
  animation:blink 1s step-end infinite}
.stxt{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}

/* nations header */
.nh{display:flex;align-items:baseline;justify-content:space-between;
  margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--b1)}
.nh-t{font-family:var(--disp);font-size:24px;letter-spacing:.04em}
.nh-s{font-size:9px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}

/* responsive */
@media(max-width:1000px){
  .hero{grid-template-columns:1fr;gap:24px}
  .hero-stats{flex-direction:row;flex-wrap:wrap}
  .hstat{min-width:110px;text-align:left}
  .ngrid{grid-template-columns:repeat(2,1fr)}
  .podium{grid-template-columns:1fr;gap:8px;align-items:stretch}
  .tbl-head,.trow{grid-template-columns:44px 1fr 90px 100px}
  .tbl-head>*:nth-child(3),.trow>*:nth-child(3){display:none}
  .wbar{flex-direction:column;align-items:flex-start;gap:14px}
  .wbar-item{border-left:none;border-top:1px solid var(--b1);text-align:left;padding:10px 0 0}
}
@media(max-width:700px){
  .nav{padding:0 20px;height:52px}
  .hero{padding:32px 20px 28px}
  .ctrl{padding:12px 20px}
  .tabs{padding:0 20px}
  .main{padding:20px 20px 60px}
  .ngrid{grid-template-columns:1fr}
  .tbl-head,.trow{grid-template-columns:36px 1fr 84px}
  .tbl-head>*:nth-child(4),.trow>*:nth-child(4){display:none}
  .hero-stats{flex-wrap:wrap}
  .tick{display:none}
  .nav-cta{display:none}
}
`;

export default function LeaderboardPage() {
  const [tab,     setTab]     = useState<'global'|'nations'>('global');
  const [filter,  setFilter]  = useState<'all'|'easy'|'medium'|'hard'>('all');
  const [global,  setGlobal]  = useState<GlobalEntry[]>([]);
  const [nations, setNations] = useState<NationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [gr, nr] = await Promise.all([
        fetch('/api/leaderboard/global'),
        fetch('/api/leaderboard/nations'),
      ]);
      if (gr.ok) { const d = await gr.json(); setGlobal(d.entries ?? []); }
      if (nr.ok) { const d = await nr.json(); setNations(d.nations ?? []); }
    } catch {}
    setLoading(false);
  }

  const filtered = filter === 'all' ? global : global.filter(e => e.difficulty === filter);
  const top3     = filtered.slice(0, 3);
  const rest     = filtered.slice(3);

  // ticker items — repeat for seamless scroll
  const tItems = [...global.slice(0, 10), ...global.slice(0, 10)].map(
    (e, i) => <span key={i} className="tick-item">
      {e.player_name} · {e.nation_name} · {fmt(e.weighted_score)} pts
    </span>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="p">

        {/* Ticker */}
        <div className="tick">
          <span className="tick-lbl">Live Rankings</span>
          <div className="tick-track">{tItems}</div>
        </div>

        {/* Nav */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <span className="nav-dot" />
            <span className="nav-name">EconoQuest</span>
          </Link>
          <div className="nav-right">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/game" className="nav-cta">Play Now →</Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div>
            <p className="hero-eye">Global Economic Rankings · Season I</p>
            <h1 className="hero-h">HALL<br/>OF <span className="r">FAME</span></h1>
            <p className="hero-desc">
              Rankings weighted by difficulty. A perfect mandate on Hard
              is worth twice an Easy mandate. Only your best score per nation counts.
              Govern wisely.
            </p>
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <div className="hstat-n">{global.length}<span className="r">+</span></div>
              <div className="hstat-l">Leaders Ranked</div>
            </div>
            <div className="hstat">
              <div className="hstat-n">{nations.length}<span className="r">+</span></div>
              <div className="hstat-l">Nations Played</div>
            </div>
            {global[0] && (
              <div className="hstat">
                <div className="hstat-n">{fmt(global[0].weighted_score)}</div>
                <div className="hstat-l">Top Score</div>
              </div>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="ctrl">
          <span className="ctrl-lbl">Difficulty</span>
          <div className="ctrl-btns">
            {(['all','easy','medium','hard'] as const).map(f => {
              const cfg = f !== 'all' ? dc(f) : null;
              return (
                <button key={f} className={`cbtn${filter===f?' on':''}`} onClick={() => setFilter(f)}>
                  {f==='all' ? 'All Nations' : `${cfg!.label} ${cfg!.mult}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`ttab${tab==='global'?' on':''}`} onClick={() => setTab('global')}>
            ◈ Global Rankings <span className="tcount">{filtered.length}</span>
          </button>
          <button className={`ttab${tab==='nations'?' on':''}`} onClick={() => setTab('nations')}>
            ◎ Nation Hall of Fame <span className="tcount">{nations.length}</span>
          </button>
        </div>

        {/* Content */}
        <div className="main">
          {loading ? (
            <div className="spin">
              <div className="sdot" />
              <p className="stxt">Loading rankings…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* ── GLOBAL ── */}
              {tab === 'global' && (
                <motion.div key="g"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }} transition={{ duration:.18 }}>

                  {/* Weight explanation */}
                  <div className="wbar">
                    <div className="wbar-text">
                      <div className="wbar-title">How Scores Are Weighted</div>
                      <div className="wbar-desc">
                        Weighted score = raw score × difficulty multiplier.
                        Complete harder nations to climb higher.
                      </div>
                    </div>
                    {(['easy','medium','hard'] as const).map(d => {
                      const cfg = dc(d);
                      return (
                        <div key={d} className="wbar-item">
                          <div className="wbar-mult" style={{ color: cfg.fg }}>{cfg.mult}</div>
                          <div className="wbar-diff">{cfg.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="empty">
                      <div className="empty-ico">◈</div>
                      <div className="empty-t">No Rankings Yet</div>
                      <div className="empty-s">Complete a mandate to appear on the global leaderboard.</div>
                    </div>
                  ) : (
                    <>
                      {/* Podium */}
                      {top3.length > 0 && (
                        <div className="podium">
                          {[top3[1]??null, top3[0]??null, top3[2]??null].map((e, vi) => {
                            if (!e) return <div key={vi}/>;
                            const ar = vi===1?1:vi===0?2:3;
                            const cfg = dc(e.difficulty);
                            const icon = ARCH_ICON[e.archetype]??'◈';
                            const sc = ar===1?'p1':ar===2?'p2':'p3';
                            const stripe = ar===1?'#b8860b':ar===2?'#888':'#8b5513';
                            return (
                              <motion.div key={e.player_name} className={`pod ${sc}`}
                                initial={{ opacity:0, y:16 }}
                                animate={{ opacity:1, y:0 }}
                                transition={{ delay: vi*.08, duration:.2 }}>
                                <div className="pod-stripe" style={{ background: stripe }} />
                                <div className="pod-bg-num">{ar}</div>
                                <div className="pod-medal" style={{ color: stripe }}>{medal(ar)}</div>
                                <div className="pod-name">{e.player_name}</div>
                                <div className="pod-nation">{e.nation_name}</div>
                                <div className="pod-arch">{icon} {e.archetype}</div>
                                <span className="dpill" style={{ background:cfg.bg, color:cfg.fg, border:`1px solid ${cfg.br}` }}>
                                  {cfg.label} {cfg.mult}
                                </span>
                                <div className="pod-scores">
                                  <div>
                                    <div className="pod-ws">{fmt(e.weighted_score)}</div>
                                    <div className="pod-wl">weighted pts</div>
                                  </div>
                                  <div className="pod-rs">{e.raw_score} raw</div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Rest table */}
                      {rest.length > 0 && (
                        <div className="tbl">
                          <div className="tbl-head">
                            <div className="th">#</div>
                            <div className="th">Leader</div>
                            <div className="th">Nation</div>
                            <div className="th" style={{ textAlign:'right' }}>Raw</div>
                            <div className="th" style={{ textAlign:'right' }}>Weighted</div>
                          </div>
                          {rest.map((e, i) => {
                            const rank = i + 4;
                            const cfg  = dc(e.difficulty);
                            const icon = ARCH_ICON[e.archetype]??'◈';
                            return (
                              <motion.div key={e.player_name} className="trow"
                                initial={{ opacity:0, x:-5 }}
                                animate={{ opacity:1, x:0 }}
                                transition={{ delay: i*.02, duration:.14 }}>
                                <div className={`rank ${rcl(rank)}`}>{rank}</div>
                                <div>
                                  <div className="pname">{e.player_name}</div>
                                  <div className="parch"><span>{icon}</span><span>{e.archetype}</span></div>
                                </div>
                                <div>
                                  <div className="nname">{e.nation_name}</div>
                                  <span className="dpill" style={{ background:cfg.bg, color:cfg.fg, border:`1px solid ${cfg.br}` }}>
                                    {cfg.label} {cfg.mult}
                                  </span>
                                </div>
                                <div className="rraw">{e.raw_score}</div>
                                <div>
                                  <div className="rws">{fmt(e.weighted_score)}</div>
                                  <div className="rwl">pts</div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* ── NATIONS ── */}
              {tab === 'nations' && (
                <motion.div key="n"
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }} transition={{ duration:.18 }}>

                  <div className="nh">
                    <div>
                      <div className="nh-t">Nation Hall of Fame</div>
                      <div className="nh-s">Top 3 leaders per nation · Ranked by record score</div>
                    </div>
                    <div className="nh-s">{nations.length} Nations</div>
                  </div>

                  {nations.length === 0 ? (
                    <div className="empty">
                      <div className="empty-ico">◎</div>
                      <div className="empty-t">No Records Yet</div>
                      <div className="empty-s">Complete mandates to build each nation's hall of fame.</div>
                    </div>
                  ) : (
                    <div className="ngrid">
                      {nations.map((nation, ni) => {
                        const cfg = dc(nation.difficulty);
                        return (
                          <motion.div key={nation.nation_name} className="ncard"
                            initial={{ opacity:0, y:10 }}
                            animate={{ opacity:1, y:0 }}
                            transition={{ delay: ni*.04, duration:.18 }}>
                            <div className="ncard-top">
                              <span className="dpill" style={{ background:cfg.bg, color:cfg.fg, border:`1px solid ${cfg.br}` }}>
                                {cfg.label} {cfg.mult}
                              </span>
                              <div className="ncard-name">{nation.nation_name}</div>
                              <div className="ncard-meta">
                                <div>
                                  <div className="ncard-rl">Record</div>
                                  <div className="ncard-rec">{nation.top_score}</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              {nation.top_entries.map((e, i) => {
                                const icon = ARCH_ICON[e.archetype]??'◈';
                                return (
                                  <div key={e.player_name} className="nprow">
                                    <div className={`npr ${rcl(i+1)}`}>{i+1}</div>
                                    <div className="npn">{e.player_name}</div>
                                    <div className="npa">{icon} {e.archetype?.replace('The ','')}</div>
                                    <div className="nps">{e.raw_score}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}