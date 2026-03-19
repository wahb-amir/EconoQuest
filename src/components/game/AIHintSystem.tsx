'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EconomicMetrics,
  PolicyDecisions,
  QuarterData,
  CountryTemplate,
} from '@/lib/simulation-engine';
import { useAuth } from '@/hooks/useAuth';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const PROXY_WS_URL = process.env.NEXT_PUBLIC_PROXY_URL!
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const css = `
  .ai-root{background:#f2ebe0;border:1px solid rgba(28,20,9,.22);font-family:'DM Mono','Courier New',monospace;display:flex;flex-direction:column}
  .ai-head{padding:14px 18px;border-bottom:1px solid rgba(28,20,9,.13);display:flex;align-items:center;justify-content:space-between}
  .ai-head-left{display:flex;flex-direction:column;gap:2px}
  .ai-head-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.05em;color:#1c1409}
  .ai-head-tag{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.4);border:1px solid rgba(28,20,9,.15);padding:2px 7px;width:fit-content}
  .ai-hint-counter{display:flex;align-items:center;gap:6px}
  .ai-hint-pip{width:7px;height:7px;border-radius:50%;background:#bf3509;transition:.2s}
  .ai-hint-pip.used{background:rgba(28,20,9,.15)}
  .ai-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;max-height:380px;min-height:200px}
  .ai-msg{display:flex;gap:8px;max-width:92%}
  .ai-msg.ai{margin-right:auto}
  .ai-msg.system{margin-right:auto}
  .ai-msg.error{margin-right:auto}
  .ai-msg.streaming{margin-right:auto}
  .ai-avatar{width:26px;height:18px;border:1px solid rgba(28,20,9,.18);display:flex;align-items:center;justify-content:center;font-size:7px;letter-spacing:.05em;flex-shrink:0;margin-top:3px;background:#e9e0d2;color:rgba(28,20,9,.5);text-transform:uppercase;font-weight:500}
  .ai-bubble{padding:10px 12px;font-size:11px;line-height:1.75;color:#1c1409;background:#e9e0d2;border:1px solid rgba(28,20,9,.1)}
  .ai-msg.ai .ai-bubble{border-left:2px solid #bf3509}
  .ai-msg.streaming .ai-bubble{border-left:2px solid #bf3509;border-left-style:dashed}
  .ai-msg.system .ai-bubble{border-left:2px solid rgba(28,20,9,.3);background:rgba(28,20,9,.03);font-size:10px;color:rgba(28,20,9,.5)}
  .ai-msg.error .ai-bubble{border-left:2px solid #e24b4a;background:rgba(226,75,74,.05);color:#a32d2d}
  .ai-typing{display:flex;gap:4px;align-items:center;padding:10px 12px;background:#e9e0d2;border:1px solid rgba(28,20,9,.1);border-left:2px solid #bf3509}
  .ai-typing-dot{width:4px;height:4px;background:rgba(28,20,9,.35);border-radius:50%}
  .ai-footer{padding:12px 16px;border-top:1px solid rgba(28,20,9,.13);display:flex;flex-direction:column;gap:8px}
  .ai-ask-btn{width:100%;background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:12px;cursor:pointer;transition:.12s;display:flex;align-items:center;justify-content:center;gap:8px}
  .ai-ask-btn:hover:not(:disabled){background:#d94010}
  .ai-ask-btn:disabled{opacity:.35;cursor:not-allowed}
  .ai-ask-btn.exhausted{background:rgba(28,20,9,.12);color:rgba(28,20,9,.4)}
  .ai-ask-btn.login{background:transparent;color:#bf3509;border:1.5px solid #bf3509}
  .ai-ask-btn.login:hover{background:rgba(191,53,9,.06)}
  .ai-queue-badge{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,20,9,.4);text-align:center;padding:4px 0}
  .ai-disclaimer{font-size:8px;color:rgba(28,20,9,.3);letter-spacing:.06em;text-align:center;line-height:1.5}
  .ai-hint-label{font-size:8px;color:rgba(28,20,9,.35);letter-spacing:.1em;text-transform:uppercase;text-align:right}
  .ai-conflict{font-size:9px;color:#bf3509;letter-spacing:.06em;line-height:1.5;padding:6px 10px;background:rgba(191,53,9,.06);border:1px solid rgba(191,53,9,.15);margin-top:4px}
  .ai-ws-status{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .ai-ws-status.connected{background:#2d6a2d}
  .ai-ws-status.connecting{background:#d97706}
  .ai-ws-status.disconnected{background:rgba(28,20,9,.2)}
  @keyframes bounce-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
  @keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}
  .ai-cursor::after{content:'▌';font-size:.7em;color:#bf3509;animation:cursor-blink .7s step-end infinite}
`;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  country:        CountryTemplate;
  currentQuarter: number;
  totalQuarters:  number;
  wisdomScore:    number;
  hintsUsed:      number;
  hintsMax:       number;
  currentMetrics: EconomicMetrics;
  currentPolicy:  PolicyDecisions;
  quarterHistory: QuarterData[];
  onHintUsed:     () => void;
}

interface Message {
  role: 'ai' | 'system' | 'error' | 'streaming';
  text: string;
}

type WsStatus = 'disconnected' | 'connecting' | 'connected';

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-FLAG DETECTOR
// ─────────────────────────────────────────────────────────────────────────────

function getAutoFlags(m: EconomicMetrics): string[] {
  const flags: string[] = [];
  if (m.inflation > 15)        flags.push('⚠ Inflation exceeding 15% — hyperinflation dynamics are non-linear from here.');
  if (m.debtToGDP > 150)       flags.push('⚠ Debt/GDP above 150% — sovereign risk premium is now actively compounding your deficit.');
  if (m.reserves < 20)         flags.push('⚠ Reserves critically low — one bad quarter eliminates your currency defence capacity.');
  if (m.unemployment > 20)     flags.push('⚠ Unemployment above 20% — social instability threshold is approaching.');
  if (m.publicMood < 25)       flags.push('⚠ Public mood below 25 — policy paralysis risk is high at this approval level.');
  if (m.currencyStrength < 45) flags.push('⚠ Currency at severe weakness — import costs are compounding your inflation.');
  return flags;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const AIHintSystem: React.FC<Props> = (props) => {
  const {
    country, currentQuarter, hintsUsed, hintsMax,
    currentMetrics, currentPolicy, quarterHistory,
    onHintUsed,
  } = props;

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [messages,     setMessages]     = useState<Message[]>([]);
  const [typing,       setTyping]        = useState(false);
  const [streaming,    setStreaming]     = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [wsStatus,     setWsStatus]     = useState<WsStatus>('disconnected');
  const [queuePos,     setQueuePos]     = useState<number | null>(null);
  const [prevQuarter,  setPrevQuarter]  = useState(currentQuarter);

  const wsRef    = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, streamBuffer]);

  // ── Welcome message ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!country?.name) return;
    setMessages([{
      role: 'ai',
      text: `Advisor online for ${country.name}. I won't tell you what to do — but I'll make sure you've thought it through. ${hintsMax} questions available this mandate.`,
    }]);
  }, [country?.name]);

  // ── Auto-flag on new quarter ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentMetrics) return;
    if (currentQuarter <= 1 || currentQuarter === prevQuarter) return;
    setPrevQuarter(currentQuarter);
    const flags = getAutoFlags(currentMetrics);
    if (flags.length > 0) {
      setMessages(prev => [
        ...prev,
        ...flags.map(f => ({ role: 'system' as const, text: f })),
      ]);
    }
  }, [currentQuarter]);

  // ── Cleanup WS on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // ── Build state payload ────────────────────────────────────────────────────
  const buildStatePayload = useCallback(() => ({
    round:  currentQuarter,
    nation: country.name,
    // policy inputs
    ctx:    currentPolicy.taxRate,
    itr:    currentPolicy.interestRate,
    spd:    currentPolicy.spending,
    rnd:    currentPolicy.rdInvestment,
    fln:    currentPolicy.foreignLending,
    wfr:    currentPolicy.investmentRisk,
    tar:    currentPolicy.tariffLevel,
    prt:    currentPolicy.moneyPrinting,
    // metric outputs
    gdp:    currentMetrics.gdp,
    inf:    currentMetrics.inflation,
    unemp:  currentMetrics.unemployment,
    dbt:    currentMetrics.debtToGDP,
    cur:    currentMetrics.currencyStrength,
    trd:    currentMetrics.tradeBalance,
    inn:    currentMetrics.innovationIndex,
    sal:    currentMetrics.avgSalary,
    mood:   currentMetrics.publicMood,
    swf:    currentMetrics.reserves,
  }), [currentQuarter, country.name, currentPolicy, currentMetrics]);

  // ── Request hint via WebSocket ─────────────────────────────────────────────
  const requestHint = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const hintsLeft = hintsMax - hintsUsed;
    if (hintsLeft <= 0 || typing || streaming) return;

    // get access token from auth service
    let accessToken = '';
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/me`,
        { credentials: 'include' }
      );
      // token is in the cookie — proxy reads it directly
      // we just verify the user is still valid
      if (!res.ok) throw new Error('Session expired');
    } catch {
      setMessages(prev => [...prev, {
        role: 'error',
        text: 'Session expired. Please sign in again.',
      }]);
      return;
    }

    onHintUsed();
    setTyping(true);
    setQueuePos(null);

    // close any existing WS
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsStatus('connecting');

    const ws = new WebSocket(`${PROXY_WS_URL}/ws/hint`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      // send state — proxy reads access_token from cookie via the HTTP upgrade
      // we send state payload directly since cookie auth happens at HTTP level
      ws.send(JSON.stringify({
        state: buildStatePayload(),
      }));
    };

    let fullHint = '';

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);

        switch (msg.type) {

          case 'connected':
            // WS established, waiting for state
            break;

          case 'cache_hit':
            setTyping(false);
            setStreaming(true);
            setStreamBuffer('');
            break;

          case 'queued':
            setTyping(false);
            setQueuePos(msg.position);
            break;

          case 'processing':
            setQueuePos(null);
            setTyping(false);
            setStreaming(true);
            setStreamBuffer('');
            break;

          case 'meta':
            // conflicts detected — show them
            if (msg.conflicts?.length > 0) {
              const conflictText = msg.conflicts
                .map((c: any) => `⚡ ${c.message}`)
                .join('\n');
              setMessages(prev => [...prev, {
                role: 'system',
                text: conflictText,
              }]);
            }
            break;

          case 'token':
            // stream token to buffer
            fullHint += msg.text;
            setStreamBuffer(fullHint);
            break;

          case 'done':
            // streaming complete — promote buffer to real message
            setStreaming(false);
            setStreamBuffer('');
            if (fullHint.trim()) {
              setMessages(prev => [...prev, {
                role: 'ai',
                text: fullHint.trim(),
              }]);
            }
            fullHint = '';
            ws.close();
            break;

          case 'error':
            setTyping(false);
            setStreaming(false);
            setStreamBuffer('');
            setMessages(prev => [...prev, {
              role: 'error',
              text: msg.message ?? 'Advisor connection failed.',
            }]);
            ws.close();
            break;
        }
      } catch {
        // malformed message — ignore
      }
    };

    ws.onerror = () => {
      setWsStatus('disconnected');
      setTyping(false);
      setStreaming(false);
      setStreamBuffer('');
      setMessages(prev => [...prev, {
        role: 'error',
        text: 'Connection to advisor failed. Check your network and try again.',
      }]);
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      setTyping(false);
      setStreaming(false);
      wsRef.current = null;
    };

  }, [
    isAuthenticated, hintsMax, hintsUsed,
    typing, streaming, buildStatePayload, onHintUsed,
  ]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const hintsLeft = hintsMax - hintsUsed;
  const exhausted = hintsLeft <= 0;
  const busy      = typing || streaming;

  const btnLabel = (() => {
    if (authLoading)    return 'Loading…';
    if (!isAuthenticated) return '🔒 Sign in to use AI Advisor';
    if (busy)           return 'Advisor thinking…';
    if (exhausted)      return 'No hints remaining';
    return `▶ Request Analysis  (${hintsLeft} left)`;
  })();

  const pips = Array.from({ length: hintsMax }, (_, i) => (
    <div
      key={i}
      className={`ai-hint-pip${i >= hintsLeft ? ' used' : ''}`}
      title={i < hintsLeft ? 'Hint available' : 'Hint used'}
    />
  ));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="ai-root">

        {/* Header */}
        <div className="ai-head">
          <div className="ai-head-left">
            <span className="ai-head-title">Economic Advisor</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="ai-head-tag">Q{currentQuarter} · Socratic Mode</span>
              <div
                className={`ai-ws-status ${wsStatus}`}
                title={wsStatus}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {isAuthenticated && (
              <>
                <div className="ai-hint-counter">{pips}</div>
                <div className="ai-hint-label">{hintsLeft} / {hintsMax} hints</div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="ai-messages">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`ai-msg ${msg.role}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="ai-avatar">
                  {msg.role === 'ai' || msg.role === 'streaming'
                    ? 'ADV'
                    : msg.role === 'error'
                    ? 'ERR'
                    : 'SYS'}
                </div>
                <div className="ai-bubble" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {typing && !streaming && (
            <motion.div className="ai-msg ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ai-avatar">ADV</div>
              <div className="ai-typing">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="ai-typing-dot"
                    style={{
                      animation: `bounce-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Live streaming tokens */}
          {streaming && streamBuffer && (
            <motion.div
              className="ai-msg streaming"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="ai-avatar">ADV</div>
              <div className="ai-bubble ai-cursor">{streamBuffer}</div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="ai-footer">

          {/* Queue position */}
          {queuePos !== null && (
            <div className="ai-queue-badge">
              ⏳ Queued — position {queuePos} — advisor will reach you shortly
            </div>
          )}

          {/* Guest notice */}
          {!isAuthenticated && !authLoading && (
            <div style={{
              fontSize: 10, color: 'rgba(28,20,9,.5)', lineHeight: 1.6,
              padding: '8px 12px', background: 'rgba(28,20,9,.04)',
              border: '1px solid rgba(28,20,9,.1)', textAlign: 'center',
            }}>
              AI hints are exclusive to registered players.
              <br />
              <a href="/register" style={{ color: '#bf3509', textDecoration: 'none', fontWeight: 500 }}>
                Create a free account →
              </a>
            </div>
          )}

          <button
            className={`ai-ask-btn${exhausted ? ' exhausted' : ''}${!isAuthenticated ? ' login' : ''}`}
            onClick={requestHint}
            disabled={busy || exhausted || authLoading}
          >
            {btnLabel}
          </button>

          <div className="ai-disclaimer">
            {isAuthenticated
              ? 'Advisor asks questions. You make the decisions.'
              : 'Sign in to unlock Socratic AI guidance.'}
          </div>
        </div>

      </div>
    </>
  );
};