"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithGithub } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google"|"github"|null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    try {
      if (provider === "google") await loginWithGoogle();
      else await loginWithGithub();
    } catch {
      setError("OAuth failed. Try again.");
      setOauthLoading(null);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

        @keyframes eq-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes eq-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes eq-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
        .eq-ticker-item::after { content: '·'; margin-left: 18px; opacity: .4; }

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
        .eq-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .eq-logo-dot {
          width: 7px; height: 7px;
          background: var(--acc); border-radius: 50%;
          animation: eq-blink 2s step-end infinite;
        }
        .eq-logo-name {
          font-family: var(--display);
          font-size: 21px; letter-spacing: .05em; color: var(--ink);
        }
        .eq-logo-badge {
          font-size: 8px; letter-spacing: .12em; color: var(--muted);
          border: 1px solid var(--border2); padding: 2px 7px; text-transform: uppercase;
        }

        /* LAYOUT */
        .eq-auth-layout {
          display: grid;
          grid-template-columns: 1fr 480px;
          min-height: calc(100vh - 90px);
        }

        /* LEFT PANEL */
        .eq-auth-left {
          border-right: 1px solid var(--border2);
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: eq-fade-up .5s ease both;
        }
        .eq-auth-eyebrow {
          font-size: 9px; letter-spacing: .2em;
          color: var(--acc); text-transform: uppercase;
          margin-bottom: 18px; font-weight: 500;
        }
        .eq-auth-headline {
          font-family: var(--display);
          font-size: clamp(56px, 7vw, 96px);
          line-height: .88; letter-spacing: .02em;
          color: var(--ink); margin-bottom: 32px;
        }
        .eq-auth-headline .acc { color: var(--acc); }
        .eq-auth-headline .cursor::after {
          content: '█'; color: var(--acc); font-size: .5em;
          animation: eq-blink 1s step-end infinite;
        }
        .eq-auth-desc {
          border-left: 3px solid var(--acc);
          padding-left: 18px; max-width: 420px; margin-bottom: 48px;
        }
        .eq-auth-desc p {
          font-size: 14px; line-height: 1.85; color: var(--muted);
        }
        .eq-auth-desc strong { color: var(--ink); font-weight: 500; }

        /* STATS ROW */
        .eq-stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border2);
          border: 1px solid var(--border2);
        }
        .eq-stat-cell {
          background: var(--bg); padding: 18px 20px;
        }
        .eq-stat-label {
          font-size: 8px; letter-spacing: .16em;
          color: var(--muted); text-transform: uppercase; margin-bottom: 6px;
        }
        .eq-stat-val {
          font-family: var(--display); font-size: 28px;
          letter-spacing: .03em; color: var(--ink);
        }
        .eq-stat-val .acc { color: var(--acc); }

        /* RIGHT PANEL — FORM */
        .eq-auth-right {
          background: var(--bg2);
          border-left: 1px solid var(--border2);
          padding: 52px 44px;
          display: flex; flex-direction: column; gap: 0;
          animation: eq-fade-up .5s .1s ease both;
        }
        .eq-form-header {
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border2);
        }
        .eq-form-tag {
          font-size: 8px; letter-spacing: .2em;
          color: var(--acc); text-transform: uppercase;
          font-weight: 500; margin-bottom: 8px;
        }
        .eq-form-title {
          font-family: var(--display);
          font-size: 38px; letter-spacing: .04em; color: var(--ink);
        }
        .eq-form-sub {
          font-size: 11px; color: var(--muted);
          letter-spacing: .04em; margin-top: 4px;
        }

        /* OAUTH */
        .eq-oauth-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          margin-bottom: 28px;
        }
        .eq-oauth-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--bg); border: 1.5px solid var(--border2);
          font-family: var(--mono); font-size: 11px; font-weight: 500;
          letter-spacing: .06em; text-transform: uppercase;
          color: var(--ink); cursor: pointer; padding: 12px 16px;
          transition: background .12s, border-color .12s;
        }
        .eq-oauth-btn:hover { background: var(--bg3); border-color: rgba(28,20,9,.4); }
        .eq-oauth-btn:disabled { opacity: .5; cursor: not-allowed; }
        .eq-oauth-icon { width: 14px; height: 14px; flex-shrink: 0; }

        /* DIVIDER */
        .eq-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 28px;
        }
        .eq-divider-line { flex: 1; height: 1px; background: var(--border2); }
        .eq-divider-label {
          font-size: 9px; color: var(--dim);
          letter-spacing: .12em; text-transform: uppercase;
        }

        /* FORM FIELDS */
        .eq-field { margin-bottom: 18px; }
        .eq-field-label {
          display: block; font-size: 9px; font-weight: 500;
          letter-spacing: .16em; color: var(--muted);
          text-transform: uppercase; margin-bottom: 7px;
        }
        .eq-field-input {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border2);
          font-family: var(--mono); font-size: 13px;
          color: var(--ink); padding: 12px 14px;
          outline: none; transition: border-color .12s;
          appearance: none; -webkit-appearance: none;
        }
        .eq-field-input::placeholder { color: var(--dim); }
        .eq-field-input:focus { border-color: var(--acc); }

        /* ERROR */
        .eq-error {
          background: rgba(191,53,9,.08);
          border: 1px solid rgba(191,53,9,.25);
          padding: 11px 14px; margin-bottom: 18px;
          font-size: 11px; color: var(--acc); line-height: 1.5;
        }

        /* SUBMIT */
        .eq-submit {
          width: 100%; background: var(--acc); color: #fff;
          border: none; font-family: var(--mono); font-weight: 500;
          font-size: 12px; letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; padding: 15px 22px;
          transition: background .12s; margin-top: 4px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eq-submit:hover:not(:disabled) { background: var(--acc2); }
        .eq-submit:disabled { opacity: .6; cursor: not-allowed; }

        /* SPINNER */
        @keyframes spin { to { transform: rotate(360deg); } }
        .eq-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin .6s linear infinite;
        }

        /* FOOTER LINK */
        .eq-form-footer {
          margin-top: 22px; padding-top: 22px;
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .eq-form-footer p {
          font-size: 11px; color: var(--muted);
        }
        .eq-form-footer a {
          color: var(--acc); text-decoration: none; font-weight: 500;
        }
        .eq-form-footer a:hover { text-decoration: underline; }

        /* RESPONSIVE */
        @media (max-width: 860px) {
          .eq-auth-layout { grid-template-columns: 1fr; }
          .eq-auth-left { display: none; }
          .eq-auth-right { padding: 36px 24px; }
          .eq-nav { padding: 0 20px; }
        }
      `}</style>

      <div className="eq-root">
        {/* Ticker */}
        <div className="eq-ticker-wrap">
          <span className="eq-ticker-label">Live</span>
          <div className="eq-ticker-track">
            {[
              "GDP Growth +3.2%", "Inflation 2.4%", "Unemployment 4.1%",
              "Interest Rate 2.0%", "Trade Balance +3.1%", "Innovation Index 72pts",
              "Public Mood 74/100", "Sovereign Fund $220B",
              "GDP Growth +3.2%", "Inflation 2.4%", "Unemployment 4.1%",
              "Interest Rate 2.0%", "Trade Balance +3.1%", "Innovation Index 72pts",
            ].map((item, i) => (
              <span key={i} className="eq-ticker-item">{item}</span>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="eq-nav">
          <Link href="/" className="eq-logo">
            <span className="eq-logo-dot" />
            <span className="eq-logo-name">EconoQuest</span>
            <span className="eq-logo-badge">Beta</span>
          </Link>
          <Link href="/register" style={{
            fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase",
            color: "var(--muted)", textDecoration: "none"
          }}>
            No account? Register →
          </Link>
        </nav>

        {/* Layout */}
        <div className="eq-auth-layout">
          {/* Left */}
          <div className="eq-auth-left">
            <div>
              <p className="eq-auth-eyebrow">Economic Simulation Platform</p>
              <h1 className="eq-auth-headline">
                YOUR<br />
                <span className="acc">NATION.</span><br />
                YOUR<br />
                <span className="cursor">RULES</span>
              </h1>
              <div className="eq-auth-desc">
                <p>
                  Run a custom nation through <strong>7 fiscal years</strong>.
                  Adjust taxes, interest rates, and spending —
                  then watch the <strong>AI advisor</strong> challenge
                  every decision with Socratic precision.
                </p>
              </div>
            </div>
            <div className="eq-stats-row">
              <div className="eq-stat-cell">
                <p className="eq-stat-label">Nations Simulated</p>
                <p className="eq-stat-val">12<span className="acc">,4</span>81</p>
              </div>
              <div className="eq-stat-cell">
                <p className="eq-stat-label">Rounds Played</p>
                <p className="eq-stat-val">87<span className="acc">K</span>+</p>
              </div>
              <div className="eq-stat-cell">
                <p className="eq-stat-label">Avg Session</p>
                <p className="eq-stat-val">22<span className="acc">m</span></p>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="eq-auth-right">
            <div className="eq-form-header">
              <p className="eq-form-tag">Secure Access</p>
              <h2 className="eq-form-title">Sign In</h2>
              <p className="eq-form-sub">Access your nation and leaderboard stats</p>
            </div>

            {/* OAuth */}
            <div className="eq-oauth-grid">
              <button
                className="eq-oauth-btn"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
              >
                {oauthLoading === "google" ? (
                  <span className="eq-spinner" />
                ) : (
                  <svg className="eq-oauth-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google
              </button>
              <button
                className="eq-oauth-btn"
                onClick={() => handleOAuth("github")}
                disabled={!!oauthLoading}
              >
                {oauthLoading === "github" ? (
                  <span className="eq-spinner" />
                ) : (
                  <svg className="eq-oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                )}
                GitHub
              </button>
            </div>

            <div className="eq-divider">
              <span className="eq-divider-line" />
              <span className="eq-divider-label">or continue with email</span>
              <span className="eq-divider-line" />
            </div>

            {error && <div className="eq-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="eq-field">
                <label className="eq-field-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="eq-field-input"
                  placeholder="minister@nation.gov"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="eq-field">
                <label className="eq-field-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="eq-field-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="eq-submit" disabled={loading}>
                {loading ? <><span className="eq-spinner" /> Authenticating...</> : "Access Dashboard →"}
              </button>
            </form>

            <div className="eq-form-footer">
              <p>No nation yet? <Link href="/register">Create your account</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}