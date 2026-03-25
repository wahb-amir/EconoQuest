// ─── Spark.tsx ────────────────────────────────────────────────────────────────
// Tiny sparkline SVG rendered inside each MetricCard and TrendRow.

import React from "react";

interface SparkProps {
  data: number[];
  color: string;
}

export function Spark({ data, color }: SparkProps) {
  if (data.length < 2) return <div style={{ height: 28, width: 72 }} />;

  const W = 72, H = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / rng) * (H - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const [lx, ly] = (pts.at(-1) ?? "0,0").split(",").map(Number);
  const gradId = `spk-${color.replace(/[^a-z0-9]/gi, "")}`;
  const area = `M${pts.join(" L")} L${W},${H} L0,${H} Z`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}