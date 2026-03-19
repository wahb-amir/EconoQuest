"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_SERVICE = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!;

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Reading tokens...");

  useEffect(() => {
    async function handleCallback() {

      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setStatus("No tokens found — redirecting to login");
        setTimeout(() => router.push("/login?error=oauth_failed"), 2000);
        return;
      }

      setStatus("Setting session...");

      try {
        console.log("[callback] calling set-session...");
        const res = await fetch(`${AUTH_SERVICE}/auth/set-session`, {
          method:      "POST",
          credentials: "include",
          headers:     { "Content-Type": "application/json" },
          body:        JSON.stringify({
            access_token:  accessToken,
            refresh_token: refreshToken,
          }),
        });
        if (res.ok) {
          router.push("/setup");
        } else {
          const body = await res.text();
          setStatus(`Session failed (${res.status}) — redirecting`);
          setTimeout(() => router.push("/login?error=session_failed"), 2000);
        }
      } catch (err) {
        console.error("[callback] fetch error:", err);
        setStatus("Network error — check console");
      }
    }

    handleCallback();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f2ebe0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
      color: "#1c1409",
      flexDirection: "column",
      gap: "12px",
    }}>
      <div style={{
        width: 8, height: 8,
        background: "#bf3509",
        borderRadius: "50%",
        margin: "0 auto",
      }} />
      <p style={{
        fontSize: 11,
        letterSpacing: ".16em",
        textTransform: "uppercase",
        color: "rgba(28,20,9,0.52)",
      }}>
        {status}
      </p>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}