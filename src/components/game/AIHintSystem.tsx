"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EconomicMetrics,
  PolicyDecisions,
  QuarterData,
  CountryTemplate,
} from "@/lib/simulation-engine";
import { useAuth } from "@/hooks/useAuth";

function getProxyWsUrl(): string {
  const url = process.env.NEXT_PUBLIC_PROXY_URL ?? "";
  return url.replace("https://", "wss://").replace("http://", "ws://");
}

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
  .ai-ws-status{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .ai-ws-status.connected{background:#2d6a2d}
  .ai-ws-status.connecting{background:#d97706}
  .ai-ws-status.disconnected{background:rgba(28,20,9,.2)}
  @keyframes bounce-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
  @keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}
  .ai-cursor::after{content:'▌';font-size:.7em;color:#bf3509;animation:cursor-blink .7s step-end infinite}
`;

interface Props {
  country: CountryTemplate;
  currentQuarter: number;
  totalQuarters: number;
  wisdomScore: number;
  hintsUsed: number;
  hintsMax: number;
  currentMetrics: EconomicMetrics;
  currentPolicy: PolicyDecisions;
  quarterHistory: QuarterData[];
  onHintUsed: () => void;
}

interface Message {
  role: "ai" | "system" | "error" | "streaming";
  text: string;
}

type WsStatus = "disconnected" | "connecting" | "connected";

function getAutoFlags(m: EconomicMetrics): string[] {
  const flags: string[] = [];
  if (m.inflation > 15)
    flags.push(
      "⚠ Inflation exceeding 15% — hyperinflation dynamics are non-linear from here.",
    );
  if (m.debtToGDP > 150)
    flags.push(
      "⚠ Debt/GDP above 150% — sovereign risk premium is now actively compounding your deficit.",
    );
  if (m.reserves < 20)
    flags.push(
      "⚠ Reserves critically low — one bad quarter eliminates your currency defence capacity.",
    );
  if (m.unemployment > 20)
    flags.push(
      "⚠ Unemployment above 20% — social instability threshold is approaching.",
    );
  if (m.publicMood < 25)
    flags.push(
      "⚠ Public mood below 25 — policy paralysis risk is high at this approval level.",
    );
  if (m.currencyStrength < 45)
    flags.push(
      "⚠ Currency at severe weakness — import costs are compounding your inflation.",
    );
  return flags;
}

export const AIHintSystem: React.FC<Props> = (props) => {
  const {
    country,
    currentQuarter,
    currentMetrics,
    currentPolicy,
    onHintUsed,
  } = props;

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [wsStatus, setWsStatus] = useState<WsStatus>("disconnected");
  const [queuePos, setQueuePos] = useState<number | null>(null);
  const [prevQuarter, setPrevQuarter] = useState(currentQuarter);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fullHintRef = useRef(""); 
  const streamIndexRef = useRef<number>(-1);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!country?.name) return;
    setMessages([
      {
        role: "ai",
        text: `Advisor online for ${country.name}. Unlimited Socratic guidance is active for this mandate. Ask away.`,
      },
    ]);
  }, [country?.name]);

  // ... (keep the getAutoFlags and the flags useEffect as they were) ...

  const buildStatePayload = useCallback(
    () => ({
      round: currentQuarter,
      nation: country.name,
      ctx: currentPolicy.taxRate,
      itr: currentPolicy.interestRate,
      spd: currentPolicy.spending,
      rnd: currentPolicy.rdInvestment,
      fln: currentPolicy.foreignLending,
      wfr: currentPolicy.investmentRisk,
      tar: currentPolicy.tariffLevel,
      prt: currentPolicy.moneyPrinting,
      gdp: currentMetrics.gdp,
      inf: currentMetrics.inflation,
      unemp: currentMetrics.unemployment,
      dbt: currentMetrics.debtToGDP,
      cur: currentMetrics.currencyStrength,
      trd: currentMetrics.tradeBalance,
      inn: currentMetrics.innovationIndex,
      sal: currentMetrics.avgSalary,
      mood: currentMetrics.publicMood,
      swf: currentMetrics.reserves,
    }),
    [currentQuarter, country.name, currentPolicy, currentMetrics],
  );

  const requestHint = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    // Limit check removed: we only check if the advisor is currently "busy"
    if (typing || streaming) return;

    onHintUsed?.(); // Still call this in case you're tracking usage on the backend
    setTyping(true);
    setQueuePos(null);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsStatus("connecting");
    const ws = new WebSocket(`${getProxyWsUrl()}/ws/hint`);
    wsRef.current = ws;

    ws.onopen = async () => {
      setWsStatus("connected");
      let token = "";
      try {
        const res = await fetch("/api/auth/token", { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          token = d.access_token ?? "";
        }
      } catch { /* auth error handled by proxy */ }
      ws.send(JSON.stringify({ token, state: buildStatePayload() }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        switch (msg.type) {
          case "processing":
            setQueuePos(null);
            setTyping(false);
            setStreaming(true); // Ensure streaming state is active
            setMessages((prev) => {
              streamIndexRef.current = prev.length;
              return [...prev, { role: "streaming" as const, text: "" }];
            });
            break;

          case "token":
            fullHintRef.current += msg.text;
            if (!flushTimerRef.current) {
              flushTimerRef.current = setTimeout(() => {
                flushTimerRef.current = null;
                setMessages((prev) => {
                  const updated = [...prev];
                  const idx = streamIndexRef.current;
                  if (idx >= 0 && idx < updated.length) {
                    updated[idx] = { role: "streaming", text: fullHintRef.current };
                  }
                  return updated;
                });
              }, 80);
            }
            break;

          case "done":
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
            const finalText = fullHintRef.current.trim();
            const finalIdx = streamIndexRef.current;
            fullHintRef.current = "";
            streamIndexRef.current = -1;
            setMessages((prev) => {
              const updated = [...prev];
              if (finalIdx >= 0 && finalIdx < updated.length && finalText) {
                updated[finalIdx] = { role: "ai", text: finalText };
              }
              return updated;
            });
            setStreaming(false);
            ws.close();
            break;
            
          case "error":
            setTyping(false);
            setStreaming(false);
            setMessages((prev) => [...prev, { role: "error", text: msg.message ?? "Advisor connection failed." }]);
            ws.close();
            break;
          // ... (keep other switch cases) ...
        }
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      setTyping(false);
      setStreaming(false);
      wsRef.current = null;
    };
  }, [isAuthenticated, typing, streaming, buildStatePayload, onHintUsed]);

  const busy = typing || streaming;
  const exhausted = false; // Always false now

  const btnLabel = authLoading
    ? "Loading…"
    : !isAuthenticated
      ? "🔒 Sign in to use AI Advisor"
      : busy
        ? "Advisor thinking…"
        : "▶ Request Analysis";

  return (
    <>
      <style>{css}</style>
      <div className="ai-root">
        <div className="ai-head">
          <div className="ai-head-left">
            <span className="ai-head-title">Economic Advisor</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="ai-head-tag">Q{currentQuarter} · Socratic Mode</span>
              <div className={`ai-ws-status ${wsStatus}`} title={wsStatus} />
            </div>
          </div>
          {/* Hint pips and counter removed from here */}
        </div>

        <div className="ai-messages">
          <AnimatePresence initial={false}>
            {messages
              .filter((msg) => msg.role !== "system")
              .map((msg, i) => (
                <motion.div key={i} className={`ai-msg ${msg.role}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="ai-avatar">{(msg.role === "ai" || msg.role === "streaming") ? "ADV" : msg.role === "error" ? "ERR" : "SYS"}</div>
                  <div className="ai-bubble" style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                </motion.div>
              ))}
          </AnimatePresence>
          {typing && !streaming && (
            <motion.div className="ai-msg ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ai-avatar">ADV</div>
              <div className="ai-typing">
                {[0, 1, 2].map((i) => <div key={i} className="ai-typing-dot" style={{ animation: `bounce-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />)}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ai-footer">
          {queuePos !== null && <div className="ai-queue-badge">⏳ Queued — position {queuePos}</div>}
          <button
            className={`ai-ask-btn${!isAuthenticated ? " login" : ""}`}
            onClick={requestHint}
            disabled={busy || authLoading}
          >
            {btnLabel}
          </button>
          <div className="ai-disclaimer">Advisor asks questions. You make the decisions.</div>
        </div>
      </div>
    </>
  );
};