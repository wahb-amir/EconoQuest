"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, username);
      router.push("/setup");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleOAuth() {
    setOauthLoading("google");
    try {
      await loginWithGoogle();
    } catch {
      setError("OAuth failed. Try again.");
    } finally {
      setOauthLoading(null);
    }
  }

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#bf3509", "#d97706", "#16a34a", "#15803d"][strength];

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap");

        @keyframes eq-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes eq-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes eq-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#f2ebe0] font-mono text-[#1c1409]">
        <div className="flex h-[30px] items-center overflow-hidden bg-[#bf3509] text-white">
          <span className="flex h-full shrink-0 items-center border-r border-white/25 px-3.5 text-[9px] uppercase tracking-[0.18em] whitespace-nowrap">
            Live
          </span>
          <div
            className="flex whitespace-nowrap will-change-transform"
            style={{ animation: "eq-ticker 44s linear infinite" }}
          >
            {[
              "GDP Growth +3.2%",
              "Inflation 2.4%",
              "Unemployment 4.1%",
              "Interest Rate 2.0%",
              "Trade Balance +3.1%",
              "Innovation Index 72pts",
              "Public Mood 74/100",
              "Sovereign Fund $220B",
              "GDP Growth +3.2%",
              "Inflation 2.4%",
              "Unemployment 4.1%",
              "Interest Rate 2.0%",
              "Trade Balance +3.1%",
              "Innovation Index 72pts",
            ].map((item, i) => (
              <span
                key={i}
                className="px-[18px] text-[10px] tracking-[0.05em] opacity-90 after:ml-[18px] after:opacity-40 after:content-['·']"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <nav className="flex h-[60px] items-center justify-between border-b-2 border-[#1c1409]/20 bg-[#f2ebe0] px-5 md:px-11">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span
              className="h-[7px] w-[7px] rounded-full bg-[#bf3509]"
              style={{ animation: "eq-blink 2s step-end infinite" }}
            />
            <span className="font-['Bebas_Neue'] text-[21px] tracking-[0.05em] text-[#1c1409]">
              EconoQuest
            </span>
            <span className="border border-[#1c1409]/20 px-[7px] py-[2px] text-[8px] uppercase tracking-[0.12em] text-[#1c1409]/50">
              Beta
            </span>
          </Link>

          <Link
            href="/login"
            className="text-[11px] uppercase tracking-[0.08em] text-[#1c1409]/50 no-underline hover:underline"
          >
            Have an account? Sign in →
          </Link>
        </nav>

        <div className="grid min-h-[calc(100vh-90px)] grid-cols-1 lg:grid-cols-[480px_1fr]">
          <div
            className="bg-[#e9e0d2] px-6 py-9 lg:border-r lg:border-[#1c1409]/20 lg:px-11 lg:py-[52px]"
            style={{ animation: "eq-fade-up .5s ease both" }}
          >
            <div className="mb-8 border-b border-[#1c1409]/20 pb-6">
              <p className="mb-2 text-[8px] font-medium uppercase tracking-[0.2em] text-[#bf3509]">
                New Nation
              </p>
              <h2 className="font-['Bebas_Neue'] text-[38px] tracking-[0.04em] text-[#1c1409]">
                Register
              </h2>
              <p className="mt-1 text-[11px] tracking-[0.04em] text-[#1c1409]/50">
                Found your nation. Shape its destiny.
              </p>
            </div>

            <div className="mb-7 grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 border-[1.5px] border-[#1c1409]/20 bg-[#f2ebe0] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1c1409] transition-colors hover:border-[#1c1409]/40 hover:bg-[#dfd4c4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {oauthLoading === "google" ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Google
              </button>
            </div>

            <div className="mb-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#1c1409]/20" />
              <span className="text-[9px] uppercase tracking-[0.12em] text-[#1c1409]/30">
                or register with email
              </span>
              <span className="h-px flex-1 bg-[#1c1409]/20" />
            </div>

            {error && (
              <div className="mb-4 border border-[#bf3509]/25 bg-[#bf3509]/10 px-3.5 py-2.5 text-[11px] leading-[1.5] text-[#bf3509]">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-[16px]">
                <label
                  htmlFor="username"
                  className="mb-[7px] block text-[9px] font-medium uppercase tracking-[0.16em] text-[#1c1409]/50"
                >
                  Nation Leader Name
                </label>
                <input
                  id="username"
                  type="text"
                  className="w-full appearance-none border-[1.5px] border-[#1c1409]/20 bg-[#f2ebe0] px-3.5 py-3 text-[13px] text-[#1c1409] outline-none transition-colors placeholder:text-[#1c1409]/30 focus:border-[#bf3509]"
                  placeholder="Minister Smith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="mb-[16px]">
                <label
                  htmlFor="email"
                  className="mb-[7px] block text-[9px] font-medium uppercase tracking-[0.16em] text-[#1c1409]/50"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full appearance-none border-[1.5px] border-[#1c1409]/20 bg-[#f2ebe0] px-3.5 py-3 text-[13px] text-[#1c1409] outline-none transition-colors placeholder:text-[#1c1409]/30 focus:border-[#bf3509]"
                  placeholder="minister@nation.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="mb-[16px]">
                <label
                  htmlFor="password"
                  className="mb-[7px] block text-[9px] font-medium uppercase tracking-[0.16em] text-[#1c1409]/50"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full appearance-none border-[1.5px] border-[#1c1409]/20 bg-[#f2ebe0] px-3.5 py-3 text-[13px] text-[#1c1409] outline-none transition-colors placeholder:text-[#1c1409]/30 focus:border-[#bf3509]"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                {password && (
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-[3px] flex-1 transition-colors"
                          style={{
                            background: i <= strength ? strengthColor : "rgba(28,20,9,0.22)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-[16px]">
                <label
                  htmlFor="confirm"
                  className="mb-[7px] block text-[9px] font-medium uppercase tracking-[0.16em] text-[#1c1409]/50"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  className={`w-full appearance-none border-[1.5px] bg-[#f2ebe0] px-3.5 py-3 text-[13px] text-[#1c1409] outline-none transition-colors placeholder:text-[#1c1409]/30 ${
                    confirm && confirm !== password
                      ? "border-[#bf3509] focus:border-[#bf3509]"
                      : "border-[#1c1409]/20 focus:border-[#bf3509]"
                  }`}
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="mt-1 flex w-full items-center justify-center gap-2 bg-[#bf3509] px-6 py-[15px] text-[12px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#d94010] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Founding Nation...
                  </>
                ) : (
                  "Found Your Nation →"
                )}
              </button>
            </form>

            <div className="mt-5 border-t border-[#1c1409]/13 pt-5 text-center">
              <p className="text-[11px] text-[#1c1409]/50">
                Already governing?{" "}
                <Link href="/login" className="font-medium text-[#bf3509] hover:underline">
                  Sign in to your nation
                </Link>
              </p>
            </div>
          </div>

          <div
            className="hidden flex-col justify-between px-14 py-16 lg:flex"
            style={{ animation: "eq-fade-up .5s .1s ease both" }}
          >
            <div>
              <p className="mb-[18px] text-[9px] font-medium uppercase tracking-[0.2em] text-[#bf3509]">
                Join 12,000+ Leaders
              </p>
              <h1 className="mb-9 font-['Bebas_Neue'] text-[clamp(52px,6vw,88px)] leading-[0.88] tracking-[0.02em] text-[#1c1409]">
                BUILD A
                <br />
                NATION
                <br />
                FROM <span className="text-[#bf3509]">SCRATCH</span>
              </h1>

              <div className="mb-10 flex flex-col gap-px border border-[#1c1409]/20 bg-[#1c1409]/20">
                {[
                  {
                    n: "01",
                    title: "Full Policy Control",
                    desc: "Set taxes, interest rates, tariffs and spending. Every lever affects real simulated outcomes.",
                  },
                  {
                    n: "02",
                    title: "AI Economic Advisor",
                    desc: "Never told what to do — only asked the right questions. Socratic guidance that builds real intuition.",
                  },
                  {
                    n: "03",
                    title: "Hall of Fame",
                    desc: "Top runs get archived as strategy docs. Your decisions teach future players.",
                  },
                  {
                    n: "04",
                    title: "Post-Game Archetype",
                    desc: "Are you The Inflation Hawk or The Populist? Your 7-round telemetry reveals your style.",
                  },
                ].map((p) => (
                  <div key={p.n} className="flex gap-3.5 bg-[#f2ebe0] p-5">
                    <span className="shrink-0 pt-[2px] text-[9px] font-medium tracking-[0.14em] text-[#bf3509]">
                      {p.n}
                    </span>
                    <div>
                      <p className="mb-[3px] text-[13px] font-medium text-[#1c1409]">{p.title}</p>
                      <p className="text-[11px] leading-[1.6] text-[#1c1409]/50">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </>
  );
}