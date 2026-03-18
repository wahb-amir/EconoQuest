"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AUTH_SERVICE = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!;

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      // parse tokens from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        router.push("/login?error=oauth_failed");
        return;
      }

      // send tokens to auth service to set as httpOnly cookies
      const res = await fetch(`${AUTH_SERVICE}/auth/set-session`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login?error=session_failed");
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
      color: "#1c1409"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 8, height: 8,
          background: "#bf3509",
          borderRadius: "50%",
          margin: "0 auto 16px",
          animation: "blink 1s step-end infinite"
        }} />
        <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(28,20,9,0.52)" }}>
          Authenticating...
        </p>
      </div>
    </div>
  );
}