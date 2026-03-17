'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EconomicMetrics } from '@/lib/simulation-engine';


const css = `
  .ai-root{background:#f2ebe0;border:1px solid rgba(28,20,9,.22);font-family:'DM Mono','Courier New',monospace;display:flex;flex-direction:column}
  .ai-head{padding:14px 18px;border-bottom:1px solid rgba(28,20,9,.13);display:flex;align-items:center;justify-content:space-between}
  .ai-head-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.05em;color:#1c1409}
  .ai-head-tag{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.4);border:1px solid rgba(28,20,9,.15);padding:2px 7px}
  .ai-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;max-height:280px;min-height:200px}
  .ai-msg{display:flex;gap:8px;max-width:92%}
  .ai-msg.ai{margin-right:auto}
  .ai-msg.system{margin-right:auto}
  .ai-avatar{width:26px;height:18px;border:1px solid rgba(28,20,9,.18);display:flex;align-items:center;justify-content:center;font-size:7px;letter-spacing:.05em;flex-shrink:0;margin-top:3px;background:#e9e0d2;color:rgba(28,20,9,.5);text-transform:uppercase;font-weight:500}
  .ai-bubble{padding:10px 12px;font-size:11px;line-height:1.75;color:#1c1409;background:#e9e0d2;border:1px solid rgba(28,20,9,.1)}
  .ai-msg.ai .ai-bubble{border-left:2px solid #bf3509}
  .ai-msg.system .ai-bubble{border-left:2px solid rgba(28,20,9,.3);background:rgba(28,20,9,.03);font-size:10px;color:rgba(28,20,9,.5)}
  .ai-typing{display:flex;gap:4px;align-items:center;padding:10px 12px;background:#e9e0d2;border:1px solid rgba(28,20,9,.1);border-left:2px solid #bf3509}
  .ai-typing-dot{width:4px;height:4px;background:rgba(28,20,9,.35);border-radius:50%}
  .ai-footer{padding:12px 16px;border-top:1px solid rgba(28,20,9,.13);display:flex;flex-direction:column;gap:8px}
  .ai-ask-btn{width:100%;background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:12px;cursor:pointer;transition:.12s;display:flex;align-items:center;justify-content:center;gap:8px}
  .ai-ask-btn:hover{background:#d94010}
  .ai-ask-btn:disabled{opacity:.35;cursor:not-allowed}
  .ai-disclaimer{font-size:8px;color:rgba(28,20,9,.3);letter-spacing:.06em;text-align:center;line-height:1.5}
  @keyframes bounce-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
`;

// ── Socratic question bank ──────────────────────────────────────
// Organised by metric signal. None give a direct answer.

const QUESTION_BANK: Record<string, string[]> = {
  high_inflation: [
    "Inflation is climbing. What does that tell you about the relationship between your interest rate and current output levels?",
    "When prices rise faster than wages, who bears the cost — and how might that show up in your public mood next quarter?",
    "You're seeing demand-pull pressure. Which of your current policy levers is adding fuel to aggregate demand right now?",
    "Central banks call this 'unanchored expectations'. If people believe prices will keep rising, what does that do to wage negotiations?",
  ],
  low_inflation: [
    "Inflation is below target. Does that mean the economy is healthy — or could it signal something else about demand?",
    "At what point does low inflation become a deflationary concern, and why does that matter for borrowers?",
    "If you cut interest rates to stimulate growth, what's the risk given your current debt level?",
  ],
  high_unemployment: [
    "Unemployment is rising. Okun's Law suggests GDP and unemployment move together — where do you think GDP is heading?",
    "High unemployment erodes human capital over time. What does that mean for your innovation index in two quarters?",
    "When labour markets weaken, what typically happens to wage growth — and how does that feed back into consumer demand?",
    "Your public mood is linked to unemployment more than any other single metric. What's your read on the political sustainability here?",
  ],
  high_debt: [
    "Debt is approaching a threshold where lenders start repricing risk. What does a rising sovereign risk premium do to your fiscal space?",
    "You're borrowing to spend. At what point does the interest burden crowd out the very spending it was meant to fund?",
    "If currency weakness and high debt compound each other, which comes first — the debt spiral or the currency crisis?",
    "Debt sustainability depends on the difference between your growth rate and your borrowing cost. How does that ratio look right now?",
  ],
  weak_currency: [
    "Your currency is weakening. Who benefits from a cheaper exchange rate, and who gets hurt — and which group is larger in your economy?",
    "Imported goods are getting more expensive. How does that interact with your current inflation trajectory?",
    "A weak currency can boost exports, but only if partner countries don't retaliate. What's your tariff exposure right now?",
  ],
  low_reserves: [
    "Reserves are thinning. What options does a government typically exhaust before it can no longer defend its currency?",
    "Without a reserve buffer, how does your ability to respond to the next external shock change?",
    "Low reserves and high debt are a dangerous combination. Which of those two problems compounds the other more quickly?",
  ],
  low_mood: [
    "Public mood is falling. Is it being driven more by inflation, unemployment, or something structural in your spending choices?",
    "Approval below 40 typically precedes policy paralysis in real governments. What does that mean for your ability to push through reforms?",
    "People feel the economy before the data shows it. What lagging indicator might be catching up to what citizens are already experiencing?",
  ],
  high_tax: [
    "Tax rates are high. At some point, raising rates yields less revenue, not more — where do you think you are on that curve?",
    "High corporate tax is raising revenue but what signal does it send to businesses considering long-run investment decisions?",
  ],
  low_spending: [
    "Public spending is very low. The Keynesian multiplier works in both directions — what happens to aggregate demand when government withdraws?",
    "Reduced spending saves money short-term. What public services or infrastructure typically deteriorate first, and how long before that shows in productivity?",
  ],
  printing: [
    "You activated money printing. Monetary financing has a lag before it hits prices — what does your current inflation rate suggest about how much runway you have?",
    "Quantitative easing redistributes wealth as well as inflating it. Which assets appreciate fastest, and who holds them in your economy?",
  ],
  general: [
    "Looking at your metrics holistically — which two variables are most in tension with each other right now?",
    "If you had to identify the single most fragile assumption your current policy is resting on, what would it be?",
    "Economic cycles always turn. If conditions tightened globally next quarter, which of your metrics has the least buffer?",
    "What's the difference between your nominal GDP growth and your real GDP growth after inflation? Does that change your assessment?",
    "Policy changes take 1–3 quarters to fully transmit. If you implemented nothing new today, where do you think your metrics land in two quarters?",
  ],
};

// ── Context detector ────────────────────────────────────────────
// Returns the most salient signal category given current metrics

function detectSignal(m: EconomicMetrics, printing: boolean): string {
  if (printing) return 'printing';
  if (m.inflation > 8)         return 'high_inflation';
  if (m.inflation < 1.5)       return 'low_inflation';
  if (m.unemployment > 10)     return 'high_unemployment';
  if (m.debtToGDP > 120)       return 'high_debt';
  if (m.currencyStrength < 75) return 'weak_currency';
  if (m.reserves < 30)         return 'low_reserves';
  if (m.publicMood < 40)       return 'low_mood';
  return 'general';
}

// ── Component ───────────────────────────────────────────────────

interface Props {
  metrics: EconomicMetrics;
  quarter: number;
  policy?: { moneyPrinting: boolean };
}

export const AIHintSystem: React.FC<Props> = ({ metrics, quarter, policy }) => {
  const [messages, setMessages] = useState<
    { role: 'ai' | 'system'; text: string }[]
  >([]);
  const [typing, setTyping] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    if (quarter === 1 && messages.length === 0) {
      setMessages([{
        role: 'ai',
        text: "Advisor online. I won't tell you what to do — but I'll make sure you've thought it through. Ask when ready."
      }]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Auto-flag edge cases when they first appear
  useEffect(() => {
    if (!metrics) return;
    const flags: string[] = [];
    if (metrics.inflation > 15) flags.push('⚠ Inflation exceeding 15% — hyperinflation risk is non-linear from here.');
    if (metrics.debtToGDP > 150) flags.push('⚠ Debt/GDP above 150% — sovereign risk premium is now actively compounding.');
    if (metrics.reserves < 20) flags.push('⚠ Reserves critically low — emergency borrowing costs would be severe.');
    if (metrics.unemployment > 20) flags.push('⚠ Unemployment above 20% — social instability threshold approaching.');

    if (flags.length > 0 && quarter > 1) {
      setMessages(prev => [
        ...prev,
        ...flags.map(f => ({ role: 'system' as const, text: f }))
      ]);
    }
  }, [quarter]);

  const requestHint = () => {
    const signal = detectSignal(metrics, policy?.moneyPrinting ?? false);
    const pool = QUESTION_BANK[signal] ?? QUESTION_BANK.general;

    // Avoid repeating recent questions
    const available = pool.filter(q => !recentQuestions.includes(q));
    const source = available.length > 0 ? available : pool;
    const question = source[Math.floor(Math.random() * source.length)];

    setRecentQuestions(prev => [...prev.slice(-2), question]);
    setTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: question }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <>
      <style>{css}</style>
      <div className="ai-root">
        <div className="ai-head">
          <span className="ai-head-title">Economic Advisor</span>
          <span className="ai-head-tag">Q{quarter} · Socratic Mode</span>
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
                  {msg.role === 'ai' ? 'ADV' : 'SYS'}
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
                    style={{
                      animation: `bounce-dot 1.2s ease-in-out ${i * 0.18}s infinite`
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ai-footer">
          <button className="ai-ask-btn" onClick={requestHint} disabled={typing}>
            {typing ? 'Analysing…' : '▶ Request Analysis'}
          </button>
          <div className="ai-disclaimer">
            Advisor asks questions. You make the decisions.
          </div>
        </div>
      </div>
    </>
  );
};