"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Reading tokens...");

  useEffect(() => {
    async function handleCallback() {
      await new Promise(r => setTimeout(r, 100));

      const hash   = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      console.log("[callback] accessToken found:", !!accessToken);
      console.log("[callback] refreshToken found:", !!refreshToken);

      if (!accessToken || !refreshToken) {
        // check for PKCE code flow
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
          setStatus("Exchanging code...");
          const res = await fetch(`/api/auth/callback?code=${code}`, {
            credentials: "include",
          });
          if (res.ok || res.redirected) {
            router.push("/setup");
          } else {
            router.push("/login?error=oauth_failed");
          }
          return;
        }

        setStatus("No tokens found");
        setTimeout(() => router.push("/login?error=no_tokens"), 2000);
        return;
      }

      setStatus("Setting session...");

      try {
        // use same-domain API route — keeps cookies on econoquest.wahb.space
        const res = await fetch("/api/auth/set-session", {
          method:      "POST",
          credentials: "include",
          headers:     { "Content-Type": "application/json" },
          body:        JSON.stringify({
            access_token:  accessToken,
            refresh_token: refreshToken,
          }),
        });

        console.log("[callback] set-session status:", res.status);

        if (res.ok) {
          setStatus("Success — redirecting...");
          router.push("/setup");
        } else {
          setStatus("Session failed");
          setTimeout(() => router.push("/login?error=session_failed"), 2000);
        }
      } catch (err) {
        console.error("[callback] error:", err);
        setStatus("Network error");
        setTimeout(() => router.push("/login?error=network"), 2000);
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
      flexDirection: "column",
      gap: "16px",
    }}>
      <div style={{
        width: 8, height: 8,
        background: "#bf3509",
        borderRadius: "50%",
        animation: "blink 1s step-end infinite",
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