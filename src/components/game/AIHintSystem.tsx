'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EconomicMetrics,
  PolicyDecisions,
  QuarterData,
  CountryTemplate,
} from '@/lib/simulation-engine';

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
  .ai-avatar{width:26px;height:18px;border:1px solid rgba(28,20,9,.18);display:flex;align-items:center;justify-content:center;font-size:7px;letter-spacing:.05em;flex-shrink:0;margin-top:3px;background:#e9e0d2;color:rgba(28,20,9,.5);text-transform:uppercase;font-weight:500}
  .ai-bubble{padding:10px 12px;font-size:11px;line-height:1.75;color:#1c1409;background:#e9e0d2;border:1px solid rgba(28,20,9,.1)}
  .ai-msg.ai .ai-bubble{border-left:2px solid #bf3509}
  .ai-msg.system .ai-bubble{border-left:2px solid rgba(28,20,9,.3);background:rgba(28,20,9,.03);font-size:10px;color:rgba(28,20,9,.5)}
  .ai-msg.error .ai-bubble{border-left:2px solid #e24b4a;background:rgba(226,75,74,.05);color:#a32d2d}
  .ai-typing{display:flex;gap:4px;align-items:center;padding:10px 12px;background:#e9e0d2;border:1px solid rgba(28,20,9,.1);border-left:2px solid #bf3509}
  .ai-typing-dot{width:4px;height:4px;background:rgba(28,20,9,.35);border-radius:50%}
  .ai-footer{padding:12px 16px;border-top:1px solid rgba(28,20,9,.13);display:flex;flex-direction:column;gap:8px}
  .ai-ask-btn{width:100%;background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:12px;cursor:pointer;transition:.12s;display:flex;align-items:center;justify-content:center;gap:8px}
  .ai-ask-btn:hover:not(:disabled){background:#d94010}
  .ai-ask-btn:disabled{opacity:.35;cursor:not-allowed}
  .ai-ask-btn.exhausted{background:rgba(28,20,9,.12);color:rgba(28,20,9,.4)}
  .ai-disclaimer{font-size:8px;color:rgba(28,20,9,.3);letter-spacing:.06em;text-align:center;line-height:1.5}
  .ai-hint-label{font-size:8px;color:rgba(28,20,9,.35);letter-spacing:.1em;text-transform:uppercase;text-align:right}
  @keyframes bounce-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
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
  role: 'ai' | 'system' | 'error';
  text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are the Economic Advisor in EconoQuest, a macroeconomic governance simulation used to teach real-world economic reasoning.

Your ONLY job is to ask ONE Socratic question per response. You never give direct policy recommendations, never say "you should raise rates" or "cut spending". You guide the player to reason for themselves.

Rules:
- ONE question per response. No preamble, no "Great question!", no follow-up sentences.
- The question must be directly grounded in the player's SPECIFIC current data — reference actual numbers.
- Questions should expose tensions between metrics (e.g. inflation vs unemployment, debt vs growth).
- Vary your angle: sometimes focus on a single indicator, sometimes on the relationship between two, sometimes on a time-lag or second-order effect.
- Difficulty should match the scenario difficulty. Hard scenarios get harder questions about compound dynamics.
- Never repeat a question the player has already received this session.
- Format: just the question, ending with a question mark. No lists, no headers, no markdown.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildUserPrompt(props: Props): string {
  const {
    country, currentQuarter, totalQuarters, wisdomScore,
    hintsUsed, hintsMax, currentMetrics, currentPolicy, quarterHistory,
  } = props;

  const m = currentMetrics;
  const p = currentPolicy;

  const historyLines = quarterHistory.slice(1).map(q => {
    const qm = q.metrics;
    return `  Q${q.quarter}: GDP=${qm.gdp.toFixed(1)}% INF=${qm.inflation.toFixed(1)}% UNEMP=${qm.unemployment.toFixed(1)}% MOOD=${qm.publicMood} DEBT=${qm.debtToGDP.toFixed(0)}% FX=${qm.currencyStrength.toFixed(0)} RES=$${qm.reserves.toFixed(0)}B${q.flags?.length ? ` [${q.flags.join(', ')}]` : ''}`;
  }).join('\n');

  return `SCENARIO
Country: ${country.name} (${country.region})
Difficulty: ${country.difficulty}
Real-world basis: ${country.realBasis}
Progress: Q${currentQuarter} of ${totalQuarters}
Wisdom Score: ${wisdomScore}/1000
Hints remaining: ${hintsMax - hintsUsed} of ${hintsMax}

CURRENT QUARTER METRICS
GDP growth:         ${m.gdp.toFixed(1)}%
Inflation:          ${m.inflation.toFixed(1)}%
Unemployment:       ${m.unemployment.toFixed(1)}%
Public mood:        ${m.publicMood}/100
Avg salary:         $${m.avgSalary.toLocaleString()}
Debt/GDP:           ${m.debtToGDP.toFixed(1)}%
Currency strength:  ${m.currencyStrength.toFixed(0)}
Trade balance:      ${m.tradeBalance.toFixed(1)}% of GDP
Innovation index:   ${m.innovationIndex.toFixed(0)}/100
Reserves:           $${m.reserves.toFixed(0)}B

CURRENT POLICY DECISIONS
Tax rate:           ${p.taxRate}%
Interest rate:      ${p.interestRate}%
Government spend:   ${p.spending}% of GDP
Money printing:     ${p.moneyPrinting ? 'ACTIVE' : 'off'}
R&D investment:     ${p.rdInvestment}% of GDP
Tariff level:       ${p.tariffLevel}%
Foreign lending:    ${p.foreignLending}% of GDP
Investment risk:    ${p.investmentRisk}/100

QUARTER HISTORY
${historyLines || '  No quarters played yet.'}

Ask me ONE Socratic question about my situation.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALL
// ─────────────────────────────────────────────────────────────────────────────

async function fetchSocraticQuestion(props: Props): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: buildSystemPrompt(),
      messages: [
        { role: 'user', content: buildUserPrompt(props) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content
    ?.filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('') ?? '';

  if (!text.trim()) throw new Error('Empty response from advisor.');
  return text.trim();
}

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
    currentMetrics, onHintUsed,
  } = props;

  // All hooks unconditionally first
  const [messages, setMessages]       = useState<Message[]>([]);
  const [typing, setTyping]           = useState(false);
  const [prevQuarter, setPrevQuarter] = useState(currentQuarter);
  const bottomRef                     = useRef<HTMLDivElement>(null);

  // Welcome message — fires once country.name is available
  useEffect(() => {
    if (!country?.name) return;
    setMessages([{
      role: 'ai',
      text: `Advisor online for ${country.name}. I won't tell you what to do — but I'll make sure you've thought it through. ${hintsMax} questions available this mandate.`,
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country?.name]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Auto-flag when a new quarter resolves
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

  // Derived values
  const hintsLeft = hintsMax - hintsUsed;
  const exhausted = hintsLeft <= 0;

  // Request a hint
  const requestHint = async () => {
    if (exhausted || typing || !country || !currentMetrics) return;
    onHintUsed();
    setTyping(true);
    try {
      const question = await fetchSocraticQuestion(props);
      setMessages(prev => [...prev, { role: 'ai', text: question }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'error',
          text: `Advisor connection failed: ${err.message ?? 'Unknown error'}. Hint not consumed.`,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // Hint pips
  const pips = Array.from({ length: hintsMax }, (_, i) => (
    <div
      key={i}
      className={`ai-hint-pip${i >= hintsLeft ? ' used' : ''}`}
      title={i < hintsLeft ? 'Hint available' : 'Hint used'}
    />
  ));

  const btnLabel = typing
    ? 'Analysing…'
    : exhausted
    ? 'No hints remaining'
    : `▶ Request Analysis  (${hintsLeft} left)`;

  return (
    <>
      <style>{css}</style>
      <div className="ai-root">

        <div className="ai-head">
          <div className="ai-head-left">
            <span className="ai-head-title">Economic Advisor</span>
            <span className="ai-head-tag">Q{currentQuarter} · Socratic Mode</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div className="ai-hint-counter">{pips}</div>
            <div className="ai-hint-label">{hintsLeft} / {hintsMax} hints</div>
          </div>
        </div>

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
                  {msg.role === 'ai' ? 'ADV' : msg.role === 'error' ? 'ERR' : 'SYS'}
                </div>
                <div className="ai-bubble">{msg.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div className="ai-msg ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ai-avatar">ADV</div>
              <div className="ai-typing">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="ai-typing-dot"
                    style={{ animation: `bounce-dot 1.2s ease-in-out ${i * 0.18}s infinite` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ai-footer">
          <button
            className={`ai-ask-btn${exhausted ? ' exhausted' : ''}`}
            onClick={requestHint}
            disabled={typing || exhausted}
          >
            {btnLabel}
          </button>
          <div className="ai-disclaimer">
            Advisor asks questions. You make the decisions.
          </div>
        </div>

      </div>
    </>
  );
};