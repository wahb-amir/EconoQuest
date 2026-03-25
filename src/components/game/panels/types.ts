// ─── types.ts ────────────────────────────────────────────────────────────────
// All shared interfaces and type aliases used across the MetricsPanel module.

export interface EconomicMetrics {
  gdp: number;
  inflation: number;
  unemployment: number;
  debtToGDP: number;
  currencyStrength: number;
  tradeBalance: number;
  innovationIndex: number;
  avgSalary: number;
  publicMood: number;
  reserves: number;
}

export interface QuarterData {
  quarter: number;
  metrics: EconomicMetrics;
  policy?: unknown;
  event?: string;
}

export interface MetricsPanelProps {
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history: QuarterData[];
  quarter: number;
  progress: number;
  isOver: boolean;
  onNextQuarter: () => void;
}

export type MetricKey = keyof EconomicMetrics;

// ─── Education sub-types ──────────────────────────────────────────────────────

export interface HealthRange {
  label: string;
  color: string;
  range: string;
  min: number;
  max: number;
}

export interface PolicyEffect {
  policy: string;
  effect: "positive" | "negative" | "neutral";
  description: string;
}

export interface MetricEdu {
  title: string;
  symbol: string;
  tagline: string;
  unit: string;
  valueMin: number;
  valueMax: number;
  higherIsBetter: boolean;
  definition: string;
  whyItMatters: string;
  howCalculated: string;
  healthRanges: HealthRange[];
  policyEffects: PolicyEffect[];
  realWorldExample: string;
  funFact: string;
  leaderboardImpact: string;
}