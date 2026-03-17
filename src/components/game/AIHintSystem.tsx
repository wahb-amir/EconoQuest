'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const css = `
  .ai-root{background:#f2ebe0;border:1px solid rgba(28,20,9,.22);font-family:'DM Mono','Courier New',monospace;display:flex;flex-direction:column}
  .ai-head{padding:14px 18px;border-bottom:1px solid rgba(28,20,9,.13);display:flex;align-items:center;justify-content:space-between}
  .ai-head-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.05em;color:#1c1409}
  .ai-head-tag{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,20,9,.4);border:1px solid rgba(28,20,9,.15);padding:2px 7px}
  .ai-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;max-height:260px;min-height:180px}
  .ai-msg{display:flex;gap:8px;max-width:90%}
  .ai-msg.ai{margin-right:auto}
  .ai-msg.user{margin-left:auto;flex-direction:row-reverse}
  .ai-avatar{width:24px;height:24px;border:1px solid rgba(28,20,9,.2);display:flex;align-items:center;justify-content:center;font-size:9px;letter-spacing:.06em;flex-shrink:0;margin-top:2px;background:#e9e0d2;color:rgba(28,20,9,.5)}
  .ai-bubble{padding:10px 12px;font-size:11px;line-height:1.7;color:#1c1409;background:#e9e0d2;border:1px solid rgba(28,20,9,.13);border-radius:0}
  .ai-msg.ai .ai-bubble{border-left:2px solid #bf3509}
  .ai-msg.user .ai-bubble{background:#1c1409;color:#f2ebe0;border-color:transparent;border-right:2px solid #bf3509;border-left:none}
  .ai-typing{display:flex;gap:4px;align-items:center;padding:10px 12px;background:#e9e0d2;border:1px solid rgba(28,20,9,.13);border-left:2px solid #bf3509}
  .ai-typing-dot{width:4px;height:4px;background:rgba(28,20,9,.4);border-radius:50%}
  .ai-footer{padding:12px 16px;border-top:1px solid rgba(28,20,9,.13)}
  .ai-ask-btn{width:100%;background:#bf3509;color:#fff;border:none;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:12px;cursor:pointer;transition:.12s;display:flex;align-items:center;justify-content:center;gap:8px}
  .ai-ask-btn:hover{background:#d94010}
  .ai-ask-btn:disabled{opacity:.4;cursor:not-allowed}
  @keyframes bounce-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
`;

const HINTS = [
  "Debt is not inherently bad — but compounding interest in a low-growth environment is. Watch your debt/GDP trajectory.",
  "Central banks don't just set rates — they set expectations. The market moves before you do.",
  "Inflation above 6% begins eroding real wages faster than nominal salary growth can compensate.",
  "Public mood is a lagging indicator. People judge yesterday's economy with today's feelings.",
  "R&D investment has a 2–4 quarter lag before it moves the innovation index. Plant now, harvest later.",
  "Currency strength at 70 or below triggers import cost spirals. Your reserves are your first defence.",
  "A trade surplus isn't always good — it can indicate suppressed domestic demand. Check your spending levels.",
  "Money printing shifts inflation expectations before it affects actual prices. The signal is the damage.",
];

export const AIHintSystem: React.FC<{ metrics: any; quarter: number }> = ({ metrics, quarter }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quarter === 1 && messages.length === 0) {
      setMessages([{
        role: 'ai',
        text: "Advisor online. I'll flag structural risks and second-order effects as your policy decisions accumulate. Ask when ready."
      }]);
    }
  }, [quarter]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const requestHint = () => {
    const hint = HINTS[Math.floor(Math.random() * HINTS.length)];
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: hint }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <>
      <style>{css}</style>
      <div className="ai-root">
        <div className="ai-head">
          <span className="ai-head-title">Economic Advisor</span>
          <span className="ai-head-tag">Q{quarter} · Active</span>
        </div>

        <div className="ai-messages">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`ai-msg ${msg.role}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="ai-avatar">{msg.role === 'ai' ? 'ADV' : 'YOU'}</div>
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
                    style={{ animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
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
        </div>
      </div>
    </>
  );
};
