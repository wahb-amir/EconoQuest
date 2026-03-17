/**
 * EconoQuest — Simulation Engine  (v3 — final fix)
 * ════════════════════════════════════════════════════════════════
 *
 * ROOT CAUSES FOUND AND FIXED (traced numerically against the
 * Eastern Mediterranean hard scenario — inflation 18.4%, currency 48)
 *
 * ─────────────────────────────────────────────────────────────
 * BUG A — FX_IMPORT_COST_COEFF = 0.2  →  importInflation = 6.4 pp/qtr
 *   At currencyStrength = 48, the term (80 − 48) × 0.2 = 6.4 was
 *   added to inflation EVERY quarter, completely overwhelming the
 *   rate-hike disinflation of −2.5.  This is why inflation kept
 *   rising even with aggressive tightening.
 *   Fix: 0.2 → 0.04.  Now importInflation = 1.28 — significant but
 *   no longer dominant.  Rate hikes produce net NEGATIVE inflation
 *   delta (−1.4 pp/qtr) as expected.
 *
 * BUG B — RESERVE_TRADE_COEFF = 2.0  →  reserves hit 0 in Q1
 *   A trade deficit of −5.8% drained 11.6 B of reserves per quarter.
 *   Eastern Mediterranean starts with only 18 B.  Reserves hit 0
 *   after one quarter, triggering the `+8 debt penalty` every
 *   subsequent quarter — this was the hidden driver behind the
 *   "debt explodes by ~10 pp/qtr regardless of policy" complaint.
 *   Fix: 2.0 → 0.4.  Reserves now deplete over ~8 quarters,
 *   giving players time to act.  The debt penalty is also reduced
 *   from 8 → 2 so a brief crunch doesn't permanently bomb debt.
 *
 * BUG C — Mood delta = −11.2 per quarter → floor in 3 turns
 *   MOOD_UNEMPLOYMENT_COEFF (0.65) × unemployment slack (9.6) = −6.24
 *   MOOD_INFLATION_COEFF    (0.40) × inflation excess (15.4) = −6.16
 *   Combined −12.4 penalty swamped the +1.3 recovery terms.
 *   Fixes:
 *     · Coefficients halved again (0.65→0.28, 0.40→0.18)
 *     · Hard cap: mood cannot fall more than 6 pts in one quarter
 *     · Soft floor recovery raised 1.2 → 3.5
 *     · MOOD_INERTIA raised 0.65 → 0.80 (stronger mean-reversion)
 *   Result: mood falls to ~16 in crisis and stabilises there.
 *   It recovers when inflation/unemployment improve.
 *
 * Everything else (RATE_GDP_DRAG, INTEREST_INFLATION_COEFF,
 * TAX_REVENUE formula, INFLATION_MOMENTUM, HYPERINFLATION_THRESHOLD)
 * from v2 is preserved — those fixes were correct.
 * ─────────────────────────────────────────────────────────────
 *
 * VERIFIED MACRO DIRECTIONS (Eastern Mediterranean, rate hike to 6%)
 *   GDP      : 1.2 → ~1.0    ↓ slight  ✅
 *   Inflation: 18.4 → ~17.0  ↓         ✅  (was ↑ to 21.7 in v2)
 *   Currency : 48  → ~48.3   ↑ slight  ✅  (rate hike attracts capital)
 *   Unemploy : 14.6 → ~15.0  ↑ slight  ✅
 *   Debt     : 164 → ~167    ↑ gradual ✅  (no more +8 bomb)
 *   Mood     : 32  → ~27.9   ↓ gradual ✅  (not instant crash to 0)
 *   Reserves : 18  → ~15.7   ↓ gradual ✅  (8 quarters to empty)
 */

// ═══════════════════════════════════════════════════════════════
// 1. TYPES  (unchanged)
// ═══════════════════════════════════════════════════════════════

export interface EconomicMetrics {
  gdp:              number;   // % quarterly growth rate      range: -15 → +15
  inflation:        number;   // % annual CPI rate             range: -5  → +80
  unemployment:     number;   // % of labour force             range: 0   → 40
  publicMood:       number;   // citizen approval 0–100        range: 0   → 100
  avgSalary:        number;   // mean household income USD     range: 5000 → 150000
  debtToGDP:        number;   // national debt / GDP %         range: 0   → 300
  currencyStrength: number;   // index vs reserve basket       range: 20  → 200
  tradeBalance:     number;   // (exports-imports)/GDP %       range: -20 → +20
  innovationIndex:  number;   // TFP + research output 0–100  range: 0   → 100
  reserves:         number;   // sovereign wealth fund $B      range: 0   → 1000
}

export interface PolicyDecisions {
  taxRate:        number;   // corporate + income blended %   0–60
  interestRate:   number;   // central bank base rate %       0–30
  spending:       number;   // govt expenditure / GDP %       0–80
  moneyPrinting:  boolean;  // emergency QE toggle
  rdInvestment:   number;   // R&D as % of GDP               0–20
  tariffLevel:    number;   // avg import tariff %            0–50
  foreignLending: number;   // sovereign lending % of GDP     0–10
  investmentRisk: number;   // wealth fund risk appetite 0–100
}

export interface QuarterData {
  quarter:  number;
  metrics:  EconomicMetrics;
  policy:   PolicyDecisions;
  event?:   string;
  flags?:   string[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CountryTemplate {
  name:        string;
  region:      string;
  description: string;
  difficulty:  Difficulty;
  realBasis:   string;
  metrics:     EconomicMetrics;
}

// ═══════════════════════════════════════════════════════════════
// 2. CALIBRATION CONSTANTS
// ═══════════════════════════════════════════════════════════════
// [v3] = changed in this patch.  [v2] = changed in previous patch.
// Original v1 value shown in comment.

const K = {
  SPENDING_MULTIPLIER:      0.35,
  TAX_DRAG_PER_PCT:         0.04,
  TAX_OPTIMAL:              28,
  CAPITAL_FLIGHT_THRESHOLD: 55,
  CAPITAL_FLIGHT_PENALTY:   0.08,
  DEBT_INTEREST_BASE:       0.012,
  SOVEREIGN_RISK_THRESHOLD: 150,
  SOVEREIGN_RISK_PREMIUM:   0.003,
  DEFAULT_THRESHOLD:        200,

  // [v2] was 0.18 (v1) — rate hikes are genuinely disinflationary
  INTEREST_INFLATION_COEFF: 0.42,

  MONEY_PRINT_INFLATION:    4.5,
  MONEY_PRINT_GDP_BOOST:    1.2,

  // [v2] was 0.45 (v1) — prevents momentum-only runaway spiral
  INFLATION_MOMENTUM:       0.18,

  OUTPUT_GAP_COEFF:         0.3,

  // [v3 BUG A FIX] was 0.2 (v1/v2).
  // At currencyStrength=48: 0.2 → 6.4 pp import inflation/qtr,
  // overwhelming any rate-hike effect.  0.04 → 1.28 pp: material
  // but no longer dominant.  Rate hikes now produce net disinflation.
  FX_IMPORT_COST_COEFF:     0.04,

  // [v2] was 20 (v1) — hyperinflation now requires genuine failure
  HYPERINFLATION_THRESHOLD: 30,

  DEFLATION_TRAP_THRESHOLD: 0,
  OKUN_COEFFICIENT:         0.4,
  GDP_TREND:                2.5,
  FX_RATE_DIFFERENTIAL:     1.2,
  FX_DEBT_PENALTY:          0.15,
  FX_TRADE_COEFF:           0.4,
  TARIFF_RETALIATION_LAG:   0.6,
  DOMESTIC_DEMAND_IMPORT:   0.12,

  // [v3 BUG B FIX] was 2.0 (v1/v2).
  // tradeBalance=−5.8 with COEFF 2.0 → −11.6 B/qtr reserve drain.
  // Eastern Med starts at 18 B → reserves hit 0 in Q1 →
  // +8 debt penalty fires every turn → explains +10 pp debt jumps.
  // With 0.4 → −2.32 B/qtr, reserves last ~8 quarters.
  RESERVE_TRADE_COEFF:      0.4,

  RESERVE_INVESTMENT_COEFF: 0.008,
  MONEY_PRINT_RESERVE_COST: 8,
  SALARY_GDP_COEFF:         800,
  SALARY_INFLATION_EROSION: 0.6,

  // [v2 NEW] IS-curve: policy rate above neutral drags GDP
  RATE_GDP_DRAG:            0.11,
  RATE_NEUTRAL:             2.0,

  // [v3 BUG C FIX] were 0.65 / 0.40 (v2), 1.2 / 0.8 (v1)
  // Combined penalty at 15% unemp + 18% inflation was −12.4/qtr.
  // New values → −5.6/qtr, capped at −6, so mood falls gradually.
  MOOD_UNEMPLOYMENT_COEFF:  0.28,
  MOOD_INFLATION_COEFF:     0.18,

  MOOD_GDP_COEFF:           0.6,
  MOOD_SPENDING_COEFF:      0.3,

  RD_MULTIPLIER:            0.15,
  INNOVATION_DECAY:         0.02,
  INNOVATION_GDP_BOOST:     0.01,

  // [v3] was 0.65 (v2) — stronger mean-reversion toward 50
  MOOD_INERTIA:             0.80,

  MOOD_SOFT_FLOOR:          25,

  // [v3] was 1.2 (v2) — stronger recovery kick in crisis territory
  MOOD_SOFT_FLOOR_RECOVERY: 3.5,

  // [v3.1 FIX] was 20. Recovery bonus only fired when mood was *below* 20,
  // but mood settled at exactly 20 so the bonus never triggered and mood
  // kept drifting to 0 by ~3pts/qtr. Raising to 25 means the recovery
  // kick engages one band earlier, producing a stable floor ~20-22
  // in a sustained crisis rather than a slow slide to 0.

  // [v3 NEW] Hard cap per quarter — one bad quarter is felt, not fatal
  MAX_QUARTERLY_MOOD_DROP:  -6,

  // [v3 FIX] was 8 (v1/v2) — reduced so reserve crunch doesn't
  //  permanently add 8 pp debt every quarter
  RESERVE_EXHAUSTION_DEBT_PENALTY: 2,
} as const;

// ═══════════════════════════════════════════════════════════════
// 3. CLAMP HELPERS  (unchanged)
// ═══════════════════════════════════════════════════════════════

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const round2 = (v: number) => Math.round(v * 100) / 100;

function clampMetrics(m: EconomicMetrics): EconomicMetrics {
  return {
    gdp:              clamp(round2(m.gdp),              -15,   15),
    inflation:        clamp(round2(m.inflation),         -5,   80),
    unemployment:     clamp(round2(m.unemployment),       0,   40),
    publicMood:       clamp(Math.round(m.publicMood),     0,  100),
    avgSalary:        clamp(Math.round(m.avgSalary),   5000, 150000),
    debtToGDP:        clamp(round2(m.debtToGDP),          0,  300),
    currencyStrength: clamp(round2(m.currencyStrength),  20,  200),
    tradeBalance:     clamp(round2(m.tradeBalance),      -20,  20),
    innovationIndex:  clamp(round2(m.innovationIndex),    0,  100),
    reserves:         clamp(round2(m.reserves),           0, 1000),
  };
}

function clampPolicy(p: PolicyDecisions): PolicyDecisions {
  return {
    taxRate:        clamp(p.taxRate,        0, 60),
    interestRate:   clamp(p.interestRate,   0, 30),
    spending:       clamp(p.spending,       0, 80),
    moneyPrinting:  p.moneyPrinting,
    rdInvestment:   clamp(p.rdInvestment,   0, 20),
    tariffLevel:    clamp(p.tariffLevel,    0, 50),
    foreignLending: clamp(p.foreignLending, 0, 10),
    investmentRisk: clamp(p.investmentRisk, 0, 100),
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. SECTOR MODELS
// ═══════════════════════════════════════════════════════════════

function fiscalModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions
): { gdpDelta: number; newDebt: number; flags: string[] } {
  const flags: string[] = [];

  // [v2 FIX] ×0.70 (v1 used ×0.30 — created structural deficit at any tax rate)
  const taxRevenue = p.taxRate * 0.70;

  const spendingEffect = (p.spending - 20) * K.SPENDING_MULTIPLIER / 10;

  if (p.spending < 5) flags.push('ZERO_SPENDING_COLLAPSE');

  const taxAboveOptimal = Math.max(0, p.taxRate - K.TAX_OPTIMAL);
  const taxDrag = taxAboveOptimal * K.TAX_DRAG_PER_PCT;

  let capitalFlight = 0;
  if (p.taxRate > K.CAPITAL_FLIGHT_THRESHOLD) {
    capitalFlight = (p.taxRate - K.CAPITAL_FLIGHT_THRESHOLD) * K.CAPITAL_FLIGHT_PENALTY;
    flags.push('CAPITAL_FLIGHT');
  }

  let fiscalCollapseMultiplier = 1.0;
  if (p.taxRate < 5) {
    fiscalCollapseMultiplier = 0.4;
    flags.push('FISCAL_COLLAPSE_TAX_CUT');
  }

  let interestBurden = m.debtToGDP * K.DEBT_INTEREST_BASE;
  if (m.debtToGDP > K.SOVEREIGN_RISK_THRESHOLD) {
    const excess = m.debtToGDP - K.SOVEREIGN_RISK_THRESHOLD;
    interestBurden += excess * K.SOVEREIGN_RISK_PREMIUM;
    flags.push('SOVEREIGN_RISK_PREMIUM');
  }
  if (m.debtToGDP > K.DEFAULT_THRESHOLD) flags.push('SOVEREIGN_DEFAULT');

  const gdpDelta =
    (spendingEffect * fiscalCollapseMultiplier)
    - taxDrag
    - capitalFlight
    - (interestBurden * 0.1);

  // ×0.25 converts annualised % to quarterly debtToGDP change
  const deficit = (p.spending - taxRevenue + interestBurden) * 0.25;
  const newDebt = m.debtToGDP + deficit;

  return { gdpDelta, newDebt, flags };
}

function monetaryModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions,
  outputGap: number
): { inflationDelta: number; currencyDelta: number; flags: string[] } {
  const flags: string[] = [];

  // Rate hikes cool inflation (coefficient strong enough to dominate import cost)
  const rateEffect    = -(p.interestRate * K.INTEREST_INFLATION_COEFF);
  const demandPull    = outputGap * K.OUTPUT_GAP_COEFF;

  // [v3 BUG A FIX] Coefficient 0.2 → 0.04
  // Weak currency still matters but no longer dominates rate policy
  const importInflation = m.currencyStrength < 80
    ? (80 - m.currencyStrength) * K.FX_IMPORT_COST_COEFF : 0;

  let printEffect = 0;
  if (p.moneyPrinting) {
    printEffect = K.MONEY_PRINT_INFLATION;
    flags.push('MONEY_PRINTING_INFLATION');
  }

  const momentumPull = (m.inflation - 2.5) * K.INFLATION_MOMENTUM * 0.1;

  let hyperSpiral = 0;
  if (m.inflation > K.HYPERINFLATION_THRESHOLD) {
    hyperSpiral = (m.inflation - K.HYPERINFLATION_THRESHOLD) * 0.10;
    flags.push('HYPERINFLATION_SPIRAL');
  }

  if (m.inflation <= K.DEFLATION_TRAP_THRESHOLD && p.interestRate < 1) {
    flags.push('DEFLATIONARY_TRAP');
  }

  const inflationDelta =
    rateEffect + demandPull + importInflation + printEffect + momentumPull + hyperSpiral;

  // Currency appreciates with rate hikes (capital inflows), falls with debt & deficit
  const rateAttractive = (p.interestRate - 3) * K.FX_RATE_DIFFERENTIAL;
  const debtFXPenalty  = m.debtToGDP > 100
    ? -((m.debtToGDP - 100) / 10) * K.FX_DEBT_PENALTY : 0;
  const tradeFX        = m.tradeBalance * K.FX_TRADE_COEFF;
  const defaultCrash   = m.debtToGDP > K.DEFAULT_THRESHOLD ? -25 : 0;

  const currencyDelta = rateAttractive + debtFXPenalty + tradeFX + defaultCrash;

  return { inflationDelta, currencyDelta, flags };
}

function labourModel(
  m: EconomicMetrics,
  gdpThisQuarter: number,
  inflationThisQuarter: number
): { unemploymentDelta: number; salaryDelta: number } {
  const gdpDeviation      = gdpThisQuarter - K.GDP_TREND;
  const unemploymentDelta = -(gdpDeviation * K.OKUN_COEFFICIENT);
  const nominalGrowth     = gdpThisQuarter * K.SALARY_GDP_COEFF;
  const realErosion = inflationThisQuarter > 3
    ? -(inflationThisQuarter - 3) * m.avgSalary * K.SALARY_INFLATION_EROSION * 0.01 : 0;
  const unemploymentSlack = m.unemployment > 10
    ? -(m.unemployment - 10) * 200 : 0;
  const salaryDelta = nominalGrowth + realErosion + unemploymentSlack;
  return { unemploymentDelta, salaryDelta };
}

function externalModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  gdpThisQuarter: number
): { tradeBalanceDelta: number; reservesDelta: number; flags: string[] } {
  const flags: string[] = [];

  const tariffBoost    = p.tariffLevel * 0.04;
  const retaliation    = -(p.tariffLevel * K.TARIFF_RETALIATION_LAG * 0.03);
  const importDemand   = -(Math.max(0, gdpThisQuarter) * K.DOMESTIC_DEMAND_IMPORT);
  const fxExportEffect = m.currencyStrength > 100
    ? -((m.currencyStrength - 100) * 0.02)
    : ((100 - m.currencyStrength) * 0.015);

  if (p.tariffLevel > 35) flags.push('TRADE_WAR_RETALIATION');

  const tradeBalanceDelta = tariffBoost + retaliation + importDemand + fxExportEffect;

  // [v3 BUG B FIX] RESERVE_TRADE_COEFF 2.0 → 0.4
  // Prevents instant reserve exhaustion for trade-deficit countries
  const tradeReserveEffect   = m.tradeBalance * K.RESERVE_TRADE_COEFF;
  const investmentReturn     = (p.investmentRisk / 100) * m.reserves * K.RESERVE_INVESTMENT_COEFF;
  const foreignLendingReturn = p.foreignLending * 0.5;
  const printingCost         = p.moneyPrinting ? -K.MONEY_PRINT_RESERVE_COST : 0;

  if (m.reserves <= 0) flags.push('RESERVE_EXHAUSTION');

  const reservesDelta =
    tradeReserveEffect + investmentReturn + foreignLendingReturn + printingCost;

  return { tradeBalanceDelta, reservesDelta, flags };
}

function innovationModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions
): { innovationDelta: number; rdGdpBoost: number } {
  const effectiveRD     = (p.rdInvestment + prev.rdInvestment) / 2;
  const rdEffect        = effectiveRD * K.RD_MULTIPLIER;
  const decay           = m.innovationIndex * K.INNOVATION_DECAY;
  const innovationDelta = rdEffect - decay;
  const rdGdpBoost      = m.innovationIndex * K.INNOVATION_GDP_BOOST;
  return { innovationDelta, rdGdpBoost };
}

function sentimentModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  gdpThisQuarter: number,
  inflationThisQuarter: number,
  unemploymentThisQuarter: number
): { moodDelta: number; flags: string[] } {
  const flags: string[] = [];

  // [v3 BUG C FIX] Reduced coefficients prevent instant floor-hitting
  const unemploymentPenalty =
    -(Math.max(0, unemploymentThisQuarter - 5) * K.MOOD_UNEMPLOYMENT_COEFF);
  const inflationPenalty =
    -(Math.max(0, inflationThisQuarter - 3) * K.MOOD_INFLATION_COEFF);

  const gdpBoost      = gdpThisQuarter * K.MOOD_GDP_COEFF;
  const spendingBoost = Math.max(0, p.spending - 20) * K.MOOD_SPENDING_COEFF * 0.1;

  // [v3] Raised MOOD_INERTIA — mood recovers once conditions improve
  const inertia = (50 - m.publicMood) * K.MOOD_INERTIA * 0.05;

  // Resilience bonus below soft floor — prevents permanent 0
  const softFloorRecovery = m.publicMood < K.MOOD_SOFT_FLOOR
    ? K.MOOD_SOFT_FLOOR_RECOVERY : 0;

  if (unemploymentThisQuarter > 25) flags.push('SOCIAL_INSTABILITY');
  if (inflationThisQuarter > 20)    flags.push('HYPERINFLATION_MOOD_CRASH');

  const rawDelta =
    unemploymentPenalty + inflationPenalty + gdpBoost + spendingBoost
    + inertia + softFloorRecovery;

  // [v3 NEW] Hard cap: one bad quarter is felt, not instantly fatal
  const moodDelta = Math.max(K.MAX_QUARTERLY_MOOD_DROP, rawDelta);

  return { moodDelta, flags };
}

// ═══════════════════════════════════════════════════════════════
// 5. ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════

export function calculateNextQuarter(
  current: EconomicMetrics,
  prevPolicy: PolicyDecisions,
  nextPolicy: PolicyDecisions,
  eventMultiplier: number = 1.0
): EconomicMetrics {
  const m    = clampMetrics(current);
  const p    = clampPolicy(nextPolicy);
  const prev = clampPolicy(prevPolicy);

  const fiscal                          = fiscalModel(m, p, prev);
  const { innovationDelta, rdGdpBoost } = innovationModel(m, p, prev);

  const qePop             = p.moneyPrinting ? K.MONEY_PRINT_GDP_BOOST : 0;
  const zeroSpendingCrash = p.spending < 5 ? -3.0 : 0;

  // [v2 FIX] IS-curve: each % of rate above neutral drags GDP
  const rateGDPDrag = -Math.max(0, p.interestRate - K.RATE_NEUTRAL) * K.RATE_GDP_DRAG;

  const rawGDP = m.gdp
    + fiscal.gdpDelta
    + rdGdpBoost
    + qePop
    + zeroSpendingCrash
    + rateGDPDrag;

  const eventGDPShock  = (1.0 - eventMultiplier) * 1.5;
  const eventInflShock = (eventMultiplier - 1.0) * 3.0;
  const gdpThisQuarter = clamp(rawGDP + eventGDPShock, -15, 15);

  const outputGap = gdpThisQuarter - K.GDP_TREND;

  const monetary             = monetaryModel(m, p, prev, outputGap);
  const rawInflation         = m.inflation + monetary.inflationDelta + eventInflShock;
  const inflationThisQuarter = clamp(rawInflation, -5, 80);

  const labour                   = labourModel(m, gdpThisQuarter, inflationThisQuarter);
  const unemploymentThisQuarter  = clamp(m.unemployment + labour.unemploymentDelta, 0, 40);
  const salaryThisQuarter        = clamp(m.avgSalary + labour.salaryDelta, 5000, 150000);

  const external             = externalModel(m, p, gdpThisQuarter);
  const tradeThisQuarter     = clamp(m.tradeBalance + external.tradeBalanceDelta, -20, 20);
  const reservesThisQuarter  = clamp(m.reserves + external.reservesDelta, 0, 1000);

  const currencyThisQuarter = clamp(
    m.currencyStrength
    + monetary.currencyDelta
    + (tradeThisQuarter * K.FX_TRADE_COEFF * 0.2),
    20, 200
  );

  let debtThisQuarter = fiscal.newDebt;
  // [v3 FIX] Penalty 8 → 2 so brief reserve crunch doesn't cascade
  if (reservesThisQuarter <= 5) debtThisQuarter += K.RESERVE_EXHAUSTION_DEBT_PENALTY;

  const innovationThisQuarter = clamp(m.innovationIndex + innovationDelta, 0, 100);

  const sentiment = sentimentModel(
    m, p, gdpThisQuarter, inflationThisQuarter, unemploymentThisQuarter
  );
  const moodFloor             = unemploymentThisQuarter > 25 ? 10 : 0;
  const publicMoodThisQuarter = clamp(m.publicMood + sentiment.moodDelta, moodFloor, 100);

  return clampMetrics({
    gdp:              gdpThisQuarter,
    inflation:        inflationThisQuarter,
    unemployment:     unemploymentThisQuarter,
    publicMood:       publicMoodThisQuarter,
    avgSalary:        salaryThisQuarter,
    debtToGDP:        debtThisQuarter,
    currencyStrength: currencyThisQuarter,
    tradeBalance:     tradeThisQuarter,
    innovationIndex:  innovationThisQuarter,
    reserves:         reservesThisQuarter,
  });
}

// ═══════════════════════════════════════════════════════════════
// WISDOM SCORE  (unchanged)
// ═══════════════════════════════════════════════════════════════

export function calculateWisdomScore(history: QuarterData[]): number {
  if (history.length < 2) return 0;

  const quarters = history.slice(1);
  let score = 0;

  for (const q of quarters) {
    const m = q.metrics;
    score += clamp(m.gdp * 4, -20, 20);
    const inflDev = Math.abs(m.inflation - 2.5);
    score += clamp(10 - inflDev * 3, -15, 10);
    score += clamp((10 - m.unemployment) * 2, -15, 20);
    score -= Math.max(0, (m.debtToGDP - 80) * 0.3);
    score += m.publicMood * 0.1;
    score += clamp(m.reserves * 0.05, 0, 10);
    score += m.innovationIndex * 0.05;
    score += clamp((m.avgSalary - 35000) / 2000, -5, 10);
  }

  const raw = score / quarters.length;
  return Math.max(0, Math.min(1000, Math.round(50 + raw * 6)));
}

// ═══════════════════════════════════════════════════════════════
// COUNTRY TEMPLATES  (unchanged)
// ═══════════════════════════════════════════════════════════════

export const COUNTRY_TEMPLATES: CountryTemplate[] = [

  // ── EASY ──────────────────────────────────────────────────────

  {
    name: 'Nordic Union',
    region: 'Northern Europe',
    difficulty: 'easy',
    realBasis: 'Inspired by Sweden / Denmark (2022-23)',
    description:
      'High-trust, high-tax welfare state. Strong institutions and a current account surplus give you room to breathe — but an aging population and rigid labour market mean structural reform is overdue.',
    metrics: {
      gdp: 2.1, inflation: 2.4, unemployment: 4.2, publicMood: 74,
      avgSalary: 62000, debtToGDP: 48, currencyStrength: 112,
      tradeBalance: 3.1, innovationIndex: 72, reserves: 220,
    },
  },

  {
    name: 'Gulf Sovereign',
    region: 'Middle East',
    difficulty: 'easy',
    realBasis: 'Inspired by UAE / Saudi Arabia (2023)',
    description:
      'Petrodollar economy with a massive sovereign wealth fund. Oil revenues insulate you from short-run shocks — but a fixed exchange rate and zero income tax leave you with almost no monetary policy tools.',
    metrics: {
      gdp: 3.6, inflation: 2.8, unemployment: 2.4, publicMood: 68,
      avgSalary: 52000, debtToGDP: 28, currencyStrength: 130,
      tradeBalance: 9.2, innovationIndex: 38, reserves: 580,
    },
  },

  {
    name: 'Pacific Archipelago',
    region: 'East Asia',
    difficulty: 'easy',
    realBasis: 'Inspired by New Zealand / Singapore (2023)',
    description:
      'Small open economy with excellent institutions and low corruption. Highly exposed to global trade cycles — a slowdown in your main partners cuts through quickly.',
    metrics: {
      gdp: 2.8, inflation: 3.0, unemployment: 3.6, publicMood: 71,
      avgSalary: 58000, debtToGDP: 38, currencyStrength: 108,
      tradeBalance: 2.4, innovationIndex: 66, reserves: 190,
    },
  },

  // ── MEDIUM ────────────────────────────────────────────────────

  {
    name: 'Rhine Republic',
    region: 'Central Europe',
    difficulty: 'medium',
    realBasis: 'Inspired by Germany (2022-23)',
    description:
      'Industrial export powerhouse with a large current account surplus. An energy shock has exposed structural dependence on imported commodities — you need to diversify fast.',
    metrics: {
      gdp: 1.4, inflation: 5.8, unemployment: 5.6, publicMood: 52,
      avgSalary: 52000, debtToGDP: 68, currencyStrength: 102,
      tradeBalance: 6.1, innovationIndex: 64, reserves: 320,
    },
  },

  {
    name: 'Coastal Giant',
    region: 'East Asia',
    difficulty: 'medium',
    realBasis: 'Inspired by China (2022-23)',
    description:
      'A vast factory economy. Enormous reserves and infrastructure, but a property sector debt overhang, demographic headwinds, and a managed currency that limits monetary policy responses.',
    metrics: {
      gdp: 3.2, inflation: 2.6, unemployment: 5.5, publicMood: 55,
      avgSalary: 22000, debtToGDP: 78, currencyStrength: 90,
      tradeBalance: 7.8, innovationIndex: 52, reserves: 720,
    },
  },

  {
    name: 'South American Federation',
    region: 'Latin America',
    difficulty: 'medium',
    realBasis: 'Inspired by Brazil (2022-23)',
    description:
      'Commodity-rich emerging market with a large domestic economy. Strong resource base but entrenched inequality, a complicated tax code, and high real interest rates that crowd out private investment.',
    metrics: {
      gdp: 2.9, inflation: 8.4, unemployment: 8.8, publicMood: 46,
      avgSalary: 14000, debtToGDP: 92, currencyStrength: 72,
      tradeBalance: 1.8, innovationIndex: 34, reserves: 88,
    },
  },

  {
    name: 'Subcontinental Republic',
    region: 'South Asia',
    difficulty: 'medium',
    realBasis: 'Inspired by India (2023)',
    description:
      'Fastest-growing major economy. Demographic dividend, a booming tech sector, rising middle class — but infrastructure gaps, energy subsidies, and a wide fiscal deficit constrain how fast you can move.',
    metrics: {
      gdp: 6.1, inflation: 6.2, unemployment: 7.4, publicMood: 58,
      avgSalary: 9000, debtToGDP: 86, currencyStrength: 76,
      tradeBalance: -2.6, innovationIndex: 42, reserves: 140,
    },
  },

  {
    name: 'North Atlantic Power',
    region: 'North America',
    difficulty: 'medium',
    realBasis: 'Inspired by United States (2022-23)',
    description:
      'Reserve currency issuer with deep capital markets and enormous policy latitude — but a $33T debt load, a polarised political system, and inflationary aftershocks from post-pandemic stimulus.',
    metrics: {
      gdp: 2.5, inflation: 4.8, unemployment: 3.8, publicMood: 49,
      avgSalary: 70000, debtToGDP: 122, currencyStrength: 116,
      tradeBalance: -3.4, innovationIndex: 82, reserves: 260,
    },
  },

  // ── HARD ──────────────────────────────────────────────────────

  {
    name: 'Steppe Republic',
    region: 'Central Asia',
    difficulty: 'hard',
    realBasis: 'Inspired by Kazakhstan / Uzbekistan (2023)',
    description:
      'Landlocked resource exporter buffeted by commodity volatility and geopolitical spillover. Capital flight risk is high — one wrong move on rates and reserves drain overnight.',
    metrics: {
      gdp: 4.1, inflation: 11.2, unemployment: 9.8, publicMood: 44,
      avgSalary: 10000, debtToGDP: 82, currencyStrength: 62,
      tradeBalance: 2.2, innovationIndex: 18, reserves: 38,
    },
  },

  {
    name: 'Eastern Mediterranean',
    region: 'Southern Europe',
    difficulty: 'hard',
    realBasis: 'Inspired by Greece / Turkey (2022-23)',
    description:
      'Inflation is at emergency levels and the currency has lost a third of its value. Lenders are watching. Your first quarter will determine whether you stabilise or spiral into a full-blown crisis.',
    metrics: {
      gdp: 1.2, inflation: 18.4, unemployment: 14.6, publicMood: 32,
      avgSalary: 16000, debtToGDP: 164, currencyStrength: 48,
      tradeBalance: -5.8, innovationIndex: 28, reserves: 18,
    },
  },

  {
    name: 'Sub-Saharan Frontier',
    region: 'Africa',
    difficulty: 'hard',
    realBasis: 'Inspired by Nigeria / Ghana (2022-23)',
    description:
      'Youngest population on earth. Vast untapped resources and a tech-enabled entrepreneurial class — but a debt crisis triggered by rising US rates, FX reserves nearly exhausted, and fuel subsidies eating the budget.',
    metrics: {
      gdp: 3.4, inflation: 22.8, unemployment: 18.2, publicMood: 29,
      avgSalary: 4800, debtToGDP: 78, currencyStrength: 41,
      tradeBalance: -6.4, innovationIndex: 14, reserves: 9,
    },
  },

  {
    name: 'Wartime Rebuild',
    region: 'Eastern Europe',
    difficulty: 'hard',
    realBasis: 'Inspired by Ukraine (2023)',
    description:
      'Economy operating under extreme duress. Massive external aid is the only thing holding reserves above zero. Inflation is structural, the currency floats downward, and every quarter brings a new external shock.',
    metrics: {
      gdp: -4.8, inflation: 26.6, unemployment: 22.4, publicMood: 38,
      avgSalary: 5200, debtToGDP: 96, currencyStrength: 36,
      tradeBalance: -11.2, innovationIndex: 20, reserves: 22,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// MOCK LEADERBOARD  (unchanged)
// ═══════════════════════════════════════════════════════════════

export const MOCK_LEADERBOARD = [
  { name: 'K. Watanabe',   score: 847, badge: 'Inflation Hawk'    },
  { name: 'P. Osei',       score: 791, badge: 'Debt Surgeon'      },
  { name: 'A. Lindstrom',  score: 734, badge: 'Welfare Architect' },
  { name: 'R. Mehta',      score: 688, badge: 'Trade Minister'    },
  { name: 'C. Ferreira',   score: 612, badge: 'Crisis Navigator'  },
  { name: 'O. Nakamura',   score: 571, badge: 'Steady Hand'       },
  { name: 'I. Balogun',    score: 503, badge: 'Reform Advocate'   },
];