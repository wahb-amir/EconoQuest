// ─── helpers.ts ──────────────────────────────────────────────────────────────
// Shared constants and pure helper functions used across all metric components.

import { EDU } from "./education-data";
import type { MetricKey, HealthRange } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const METRIC_KEYS: MetricKey[] = [
  "gdp",
  "inflation",
  "unemployment",
  "debtToGDP",
  "currencyStrength",
  "tradeBalance",
  "innovationIndex",
  "avgSalary",
  "publicMood",
  "reserves",
];

/** Metrics where a higher number is a better outcome. */
export const HIGHER_IS_BETTER: MetricKey[] = [
  "gdp",
  "currencyStrength",
  "innovationIndex",
  "avgSalary",
  "publicMood",
  "reserves",
  "tradeBalance",
];

// ─── getHealth ────────────────────────────────────────────────────────────────

/** Returns the HealthRange bucket for a given metric value. */
export function getHealth(key: MetricKey, value: number): HealthRange {
  const ranges = EDU[key].healthRanges;
  return (
    ranges.find((r) => value >= r.min && value <= r.max) ??
    ranges[ranges.length - 1]
  );
}

// ─── fmt ──────────────────────────────────────────────────────────────────────

/** Formats a raw metric value into a display string and short unit label. */
export function fmt(key: MetricKey, val: number): { v: string; u: string } {
  switch (key) {
    case "gdp":
      return { v: `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`, u: "GDP Growth" };
    case "inflation":
      return { v: `${val.toFixed(1)}%`, u: "Inflation" };
    case "unemployment":
      return { v: `${val.toFixed(1)}%`, u: "Unemployment" };
    case "debtToGDP":
      return { v: `${Math.round(val)}%`, u: "Debt / GDP" };
    case "currencyStrength":
      return { v: `${val.toFixed(1)}`, u: "FX Index" };
    case "tradeBalance":
      return { v: `${val >= 0 ? "+" : ""}$${val.toFixed(1)}B`, u: "Trade Bal." };
    case "innovationIndex":
      return { v: `${Math.round(val)}`, u: "Innovation" };
    case "avgSalary":
      return { v: `$${Math.round(val / 1000)}K`, u: "Avg. Salary" };
    case "publicMood":
      return { v: `${Math.round(val)}`, u: "Public Mood" };
    case "reserves":
      return { v: `$${Math.round(val)}B`, u: "Reserves" };
    default:
      return { v: String(val), u: String(key) };
  }
}

// ─── rawVal ───────────────────────────────────────────────────────────────────

/**
 * Parses a formatted display string back to a raw number.
 * Used when the EduDrawer receives a pre-formatted value string.
 */
export function rawVal(key: MetricKey, formatted: string): number {
  const n = parseFloat(formatted.replace(/[^0-9.\-]/g, ""));
  if (key === "avgSalary") return n * 1000;
  return isNaN(n) ? 0 : n;
}

// ─── getDelta ─────────────────────────────────────────────────────────────────

type DeltaDir = "up" | "down" | "flat";

interface Delta {
  label: string;
  dir: DeltaDir;
}

/**
 * Computes the quarter-over-quarter change for a metric.
 * "up" always means improvement (respects HIGHER_IS_BETTER).
 */
export function getDelta(
  key: MetricKey,
  curr: number,
  prev?: number,
): Delta {
  if (prev === undefined) return { label: "—", dir: "flat" };
  const diff = curr - prev;
  if (Math.abs(diff) < 0.005) return { label: "—", dir: "flat" };

  let label: string;
  switch (key) {
    case "gdp":
    case "inflation":
    case "unemployment":
    case "debtToGDP":
      label = `${Math.abs(diff).toFixed(1)}pp`;
      break;
    case "currencyStrength":
      label = `${Math.abs(diff).toFixed(1)}`;
      break;
    case "tradeBalance":
    case "reserves":
      label = `$${Math.abs(diff).toFixed(1)}B`;
      break;
    case "innovationIndex":
    case "publicMood":
      label = `${Math.abs(Math.round(diff))}`;
      break;
    case "avgSalary":
      label = `$${Math.abs(Math.round(diff / 1000))}K`;
      break;
    default:
      label = Math.abs(diff).toFixed(1);
  }

  const improving = HIGHER_IS_BETTER.includes(key) ? diff > 0 : diff < 0;
  return { label, dir: improving ? "up" : "down" };
}