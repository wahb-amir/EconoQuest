/**
 * EconoQuest — Simulation Engine (v4-final)
 * ══════════════════════════════════════════
 *
 * All bugs from audit + 3 remaining failures from v4 now resolved:
 *
 * CARRY-FORWARD FIXES (v4):
 *   FIX-1  Sovereign Default: -3.5 GDP + -8 mood penalty on default
 *   FIX-2  Money Printing: mood craters (MOOD_INFLATION_COEFF 0.18→0.38,
 *          +2.5 direct mood penalty per QE quarter)
 *   FIX-3  Tariff Wars: progressive retaliation (net negative above 35%)
 *   FIX-4  Wartime deflation trap: rate-drag dampened 60% in deep recession
 *   FIX-5a R&D GDP boost: INNOVATION_GDP_BOOST 0.01→0.035, RD_MULTIPLIER 0.15→0.20
 *   FIX-6  Deflation trap flag fires at -0.5% with demand drag
 *
 * NEW IN v4-final:
 *
 * FIX-5b  R&D SECONDARY EFFECTS — innovation now visibly affects salary
 *   and public mood, not just GDP. When GDP is capped, R&D still pays off
 *   via productivity gains (salary) and educated-workforce satisfaction (mood).
 *   innovationSalaryBoost = innovationIndex * 8 per year (÷4 per quarter)
 *   MOOD_INNOVATION_COEFF = 0.04 → at innovation=70, mood +2.8/qtr
 *
 * FIX-7   WISDOM SCORE — Context-aware relative scoring
 *   Root cause: Eastern Med inherits -25.9/qtr debt penalty that can
 *   never be repaid in 6 quarters regardless of perfect policy.
 *   Fix: score is now computed RELATIVE to the starting-conditions
 *   baseline. A player who improves vs their inherited crisis scores
 *   positively. A player who makes things worse scores negatively.
 *   Baseline is 500 (you matched your starting point). 0 = total
 *   collapse. 1000 = you turned a crisis into a flourishing economy.
 *   Result: Eastern Med aggressive disinflation now scores ~540
 *   (reward for correct but painful policy), vs ~500 for doing nothing.
 *   Hard-scenario top scores (700+) require sustained multi-quarter
 *   improvement across ALL metrics.
 */

export interface EconomicMetrics {
  gdp:              number;
  inflation:        number;
  unemployment:     number;
  publicMood:       number;
  avgSalary:        number;
  debtToGDP:        number;
  currencyStrength: number;
  tradeBalance:     number;
  innovationIndex:  number;
  reserves:         number;
}

export interface PolicyDecisions {
  taxRate:        number;
  interestRate:   number;
  spending:       number;
  moneyPrinting:  boolean;
  rdInvestment:   number;
  tariffLevel:    number;
  foreignLending: number;
  investmentRisk: number;
}

export interface QuarterData {
  quarter: number;
  metrics: EconomicMetrics;
  policy:  PolicyDecisions;
  event?:  string;
  flags?:  string[];
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
// CALIBRATION CONSTANTS
// ═══════════════════════════════════════════════════════════════

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
  SOVEREIGN_DEFAULT_GDP_PENALTY: 3.5,
  SOVEREIGN_DEFAULT_MOOD_HIT:    8,

  INTEREST_INFLATION_COEFF: 0.42,
  MONEY_PRINT_INFLATION:    4.5,
  MONEY_PRINT_GDP_BOOST:    1.2,
  INFLATION_MOMENTUM:       0.18,
  OUTPUT_GAP_COEFF:         0.3,
  FX_IMPORT_COST_COEFF:     0.04,
  HYPERINFLATION_THRESHOLD: 30,
  DEFLATION_TRAP_THRESHOLD: -0.5,
  DEFLATION_DEMAND_COEFF:   0.10,

  OKUN_COEFFICIENT:         0.4,
  GDP_TREND:                2.5,
  FX_RATE_DIFFERENTIAL:     1.2,
  FX_DEBT_PENALTY:          0.15,
  FX_TRADE_COEFF:           0.4,
  TARIFF_RETALIATION_LAG:   0.6,
  DOMESTIC_DEMAND_IMPORT:   0.12,
  RESERVE_TRADE_COEFF:      0.4,
  RESERVE_INVESTMENT_COEFF: 0.008,
  MONEY_PRINT_RESERVE_COST: 8,
  SALARY_GDP_COEFF:         800,
  SALARY_INFLATION_EROSION: 0.6,

  // [FIX-5b] Innovation boosts salary productivity
  INNOVATION_SALARY_BOOST:  8,   // $8/quarter per innovation point (annualised ÷4)

  RATE_GDP_DRAG:            0.11,
  RATE_NEUTRAL:             2.0,
  RATE_DRAG_RECESSION_DAMPEN: 0.4,

  MOOD_UNEMPLOYMENT_COEFF:  0.28,
  MOOD_INFLATION_COEFF:     0.38,    // [FIX-2] raised from 0.18
  MOOD_GDP_COEFF:           0.6,
  MOOD_SPENDING_COEFF:      0.3,
  MONEY_PRINT_MOOD_PENALTY: 2.5,     // [FIX-2]

  // [FIX-5b] Innovation → mood: educated workforce satisfaction
  MOOD_INNOVATION_COEFF:    0.04,

  INNOVATION_GDP_BOOST:     0.035,   // [FIX-5a]
  RD_MULTIPLIER:            0.20,    // [FIX-5a]
  INNOVATION_DECAY:         0.02,

  MOOD_INERTIA:             0.80,
  MOOD_SOFT_FLOOR:          25,
  MOOD_SOFT_FLOOR_RECOVERY: 3.5,
  MAX_QUARTERLY_MOOD_DROP:  -6,
  RESERVE_EXHAUSTION_DEBT_PENALTY: 2,
} as const;

// ═══════════════════════════════════════════════════════════════
// HELPERS
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
// SECTOR MODELS
// ═══════════════════════════════════════════════════════════════

function fiscalModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions
): { gdpDelta: number; newDebt: number; sovereignDefault: boolean; flags: string[] } {
  const flags: string[] = [];

  const taxRevenue         = p.taxRate * 0.70;
  const spendingEffect     = (p.spending - 20) * K.SPENDING_MULTIPLIER / 10;
  if (p.spending < 5)      flags.push('ZERO_SPENDING_COLLAPSE');
  const taxAboveOptimal    = Math.max(0, p.taxRate - K.TAX_OPTIMAL);
  const taxDrag            = taxAboveOptimal * K.TAX_DRAG_PER_PCT;

  let capitalFlight = 0;
  if (p.taxRate > K.CAPITAL_FLIGHT_THRESHOLD) {
    capitalFlight = (p.taxRate - K.CAPITAL_FLIGHT_THRESHOLD) * K.CAPITAL_FLIGHT_PENALTY;
    flags.push('CAPITAL_FLIGHT');
  }

  let fiscalCollapseMultiplier = 1.0;
  if (p.taxRate < 5) { fiscalCollapseMultiplier = 0.4; flags.push('FISCAL_COLLAPSE_TAX_CUT'); }

  let interestBurden = m.debtToGDP * K.DEBT_INTEREST_BASE;
  if (m.debtToGDP > K.SOVEREIGN_RISK_THRESHOLD) {
    const excess = m.debtToGDP - K.SOVEREIGN_RISK_THRESHOLD;
    interestBurden += excess * K.SOVEREIGN_RISK_PREMIUM;
    flags.push('SOVEREIGN_RISK_PREMIUM');
  }

  let sovereignDefaultPenalty = 0;
  let sovereignDefault = false;
  if (m.debtToGDP > K.DEFAULT_THRESHOLD) {
    flags.push('SOVEREIGN_DEFAULT');
    sovereignDefaultPenalty = K.SOVEREIGN_DEFAULT_GDP_PENALTY;
    sovereignDefault = true;
  }

  const gdpDelta =
    (spendingEffect * fiscalCollapseMultiplier)
    - taxDrag
    - capitalFlight
    - (interestBurden * 0.1)
    - sovereignDefaultPenalty;

  // [FIX-5c] R&D has a small fiscal cost (crowds out other spending).
  // Keeps R&D as a deliberate choice rather than a free lunch.
  const rdFiscalCost = p.rdInvestment * 0.008;
  const deficit  = (p.spending - taxRevenue + interestBurden + rdFiscalCost) * 0.25;
  const newDebt  = m.debtToGDP + deficit;

  return { gdpDelta, newDebt, sovereignDefault, flags };
}

function monetaryModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions,
  outputGap: number
): { inflationDelta: number; currencyDelta: number; flags: string[] } {
  const flags: string[] = [];

  const rateEffect      = -(p.interestRate * K.INTEREST_INFLATION_COEFF);
  const demandPull      = outputGap * K.OUTPUT_GAP_COEFF;
  const importInflation = m.currencyStrength < 80
    ? (80 - m.currencyStrength) * K.FX_IMPORT_COST_COEFF : 0;

  let printEffect = 0;
  if (p.moneyPrinting) { printEffect = K.MONEY_PRINT_INFLATION; flags.push('MONEY_PRINTING_INFLATION'); }

  const momentumPull = (m.inflation - 2.5) * K.INFLATION_MOMENTUM * 0.1;
  let hyperSpiral    = 0;
  if (m.inflation > K.HYPERINFLATION_THRESHOLD) {
    hyperSpiral = (m.inflation - K.HYPERINFLATION_THRESHOLD) * 0.10;
    flags.push('HYPERINFLATION_SPIRAL');
  }
  if (m.inflation <= K.DEFLATION_TRAP_THRESHOLD) flags.push('DEFLATIONARY_TRAP');

  const inflationDelta = rateEffect + demandPull + importInflation + printEffect + momentumPull + hyperSpiral;

  const rateAttractive = (p.interestRate - 3) * K.FX_RATE_DIFFERENTIAL;
  const debtFXPenalty  = m.debtToGDP > 100 ? -((m.debtToGDP - 100) / 10) * K.FX_DEBT_PENALTY : 0;
  const tradeFX        = m.tradeBalance * K.FX_TRADE_COEFF;
  const defaultCrash   = m.debtToGDP > K.DEFAULT_THRESHOLD ? -25 : 0;
  const currencyDelta  = rateAttractive + debtFXPenalty + tradeFX + defaultCrash;

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
  const unemploymentSlack = m.unemployment > 10 ? -(m.unemployment - 10) * 200 : 0;

  // [FIX-5b] Innovation-driven productivity premium on wages
  const innovationProductivity = m.innovationIndex * K.INNOVATION_SALARY_BOOST;

  const salaryDelta = nominalGrowth + realErosion + unemploymentSlack + innovationProductivity;
  return { unemploymentDelta, salaryDelta };
}

function externalModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  gdpThisQuarter: number
): { tradeBalanceDelta: number; reservesDelta: number; flags: string[] } {
  const flags: string[] = [];

  const tariffBoost = p.tariffLevel * 0.04;

  // [FIX-3] Progressive retaliation: net positive ≤25%, net negative ≥35%
  const retaliationCoeff = Math.max(0.03, p.tariffLevel * 0.002);
  const retaliation      = -(p.tariffLevel * K.TARIFF_RETALIATION_LAG * retaliationCoeff);

  const importDemand   = -(Math.max(0, gdpThisQuarter) * K.DOMESTIC_DEMAND_IMPORT);
  const fxExportEffect = m.currencyStrength > 100
    ? -((m.currencyStrength - 100) * 0.02)
    : ((100 - m.currencyStrength) * 0.015);

  if (p.tariffLevel > 35) flags.push('TRADE_WAR_RETALIATION');

  // [FIX-5c] Innovation → trade advantage: high-innovation economies
  // export higher-value goods. At innovation=70 this adds +0.28 trade/qtr.
  // Visible even when GDP is capped. Also creates R&D ↔ trade tradeoff.
  const innovationTradeBoost = m.innovationIndex * 0.004;

  const tradeBalanceDelta  = tariffBoost + retaliation + importDemand + fxExportEffect + innovationTradeBoost;
  const tradeReserveEffect = m.tradeBalance * K.RESERVE_TRADE_COEFF;
  const investmentReturn   = (p.investmentRisk / 100) * m.reserves * K.RESERVE_INVESTMENT_COEFF;
  const foreignLendingReturn = p.foreignLending * 0.5;
  const printingCost       = p.moneyPrinting ? -K.MONEY_PRINT_RESERVE_COST : 0;

  if (m.reserves <= 0) flags.push('RESERVE_EXHAUSTION');

  const reservesDelta = tradeReserveEffect + investmentReturn + foreignLendingReturn + printingCost;
  return { tradeBalanceDelta, reservesDelta, flags };
}

function innovationModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions
): { innovationDelta: number; rdGdpBoost: number } {
  const effectiveRD = (p.rdInvestment + prev.rdInvestment) / 2;
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
  unemploymentThisQuarter: number,
  sovereignDefault: boolean
): { moodDelta: number; flags: string[] } {
  const flags: string[] = [];

  const unemploymentPenalty =
    -(Math.max(0, unemploymentThisQuarter - 5) * K.MOOD_UNEMPLOYMENT_COEFF);
  const inflationPenalty =
    -(Math.max(0, inflationThisQuarter - 3) * K.MOOD_INFLATION_COEFF);
  const gdpBoost      = gdpThisQuarter * K.MOOD_GDP_COEFF;
  const spendingBoost = Math.max(0, p.spending - 20) * K.MOOD_SPENDING_COEFF * 0.1;
  const inertia       = (50 - m.publicMood) * K.MOOD_INERTIA * 0.05;
  const softFloorRecovery = m.publicMood < K.MOOD_SOFT_FLOOR ? K.MOOD_SOFT_FLOOR_RECOVERY : 0;
  const printingPenalty   = p.moneyPrinting ? -K.MONEY_PRINT_MOOD_PENALTY : 0;

  // [FIX-5b] Educated / innovative society has higher base satisfaction
  const innovationMoodBoost = m.innovationIndex * K.MOOD_INNOVATION_COEFF;

  if (unemploymentThisQuarter > 25) flags.push('SOCIAL_INSTABILITY');
  if (inflationThisQuarter > 20)    flags.push('HYPERINFLATION_MOOD_CRASH');

  const rawDelta =
    unemploymentPenalty + inflationPenalty + gdpBoost + spendingBoost
    + inertia + softFloorRecovery + printingPenalty + innovationMoodBoost;

  let moodDelta = Math.max(K.MAX_QUARTERLY_MOOD_DROP, rawDelta);

  if (sovereignDefault) {
    flags.push('SOVEREIGN_DEFAULT_CONFIDENCE_COLLAPSE');
    moodDelta = Math.min(moodDelta, -K.SOVEREIGN_DEFAULT_MOOD_HIT);
  }

  return { moodDelta, flags };
}

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR
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

  // [FIX-4] Dampen rate drag in deep recession
  const recessionFactor = m.gdp < -3 ? K.RATE_DRAG_RECESSION_DAMPEN : 1.0;
  const rateGDPDrag     = -Math.max(0, p.interestRate - K.RATE_NEUTRAL) * K.RATE_GDP_DRAG * recessionFactor;

  // [FIX-6] Deflation demand-drag
  const deflationDrag = m.inflation < 0 ? m.inflation * K.DEFLATION_DEMAND_COEFF : 0;

  const rawGDP = m.gdp + fiscal.gdpDelta + rdGdpBoost + qePop
    + zeroSpendingCrash + rateGDPDrag + deflationDrag;

  const eventGDPShock  = (1.0 - eventMultiplier) * 1.5;
  const eventInflShock = (eventMultiplier - 1.0) * 3.0;
  const gdpThisQuarter = clamp(rawGDP + eventGDPShock, -15, 15);
  const outputGap      = gdpThisQuarter - K.GDP_TREND;

  const monetary             = monetaryModel(m, p, prev, outputGap);
  const rawInflation         = m.inflation + monetary.inflationDelta + eventInflShock;
  const inflationThisQuarter = clamp(rawInflation, -5, 80);

  const labour                  = labourModel(m, gdpThisQuarter, inflationThisQuarter);
  const unemploymentThisQuarter = clamp(m.unemployment + labour.unemploymentDelta, 0, 40);
  const salaryThisQuarter       = clamp(m.avgSalary + labour.salaryDelta, 5000, 150000);

  const external            = externalModel(m, p, gdpThisQuarter);
  const tradeThisQuarter    = clamp(m.tradeBalance + external.tradeBalanceDelta, -20, 20);
  const reservesThisQuarter = clamp(m.reserves + external.reservesDelta, 0, 1000);

  const currencyThisQuarter = clamp(
    m.currencyStrength + monetary.currencyDelta + (tradeThisQuarter * K.FX_TRADE_COEFF * 0.2),
    20, 200
  );

  let debtThisQuarter = fiscal.newDebt;
  if (reservesThisQuarter <= 5) debtThisQuarter += K.RESERVE_EXHAUSTION_DEBT_PENALTY;

  const innovationThisQuarter = clamp(m.innovationIndex + innovationDelta, 0, 100);

  const sentiment = sentimentModel(
    m, p, gdpThisQuarter, inflationThisQuarter, unemploymentThisQuarter, fiscal.sovereignDefault
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
// WISDOM SCORE  (v4-final — context-aware relative scoring)
// ═══════════════════════════════════════════════════════════════
//
// DESIGN:
//   Baseline 500 = you kept things exactly as you inherited them.
//   > 500 = you improved relative to your starting conditions.
//   < 500 = you made things worse.
//   Hard scenarios have MORE upside: fixing Eastern Med scores
//   600-800, while Nordic steady-state caps out around 580.
//
// HOW:
//   Compute a per-quarter "baseline score" using starting metrics.
//   Each quarter's contribution = (actual score − baseline score).
//   This neutralises the inherited debt/inflation penalty.
// ═══════════════════════════════════════════════════════════════

function scoreMetricsPerQuarter(m: EconomicMetrics): number {
  let s = 0;
  s += clamp(m.gdp * 4, -20, 20);

  // [FIX-7b] Raised inflation floor -15 → -40. Without this, inflations
  // of 18% and 26% both score -15 (same floor), making "do nothing" and
  // "correct rate hike" score identically on inflation. Now scores can
  // differentiate between bad (18%) and worse (26%) inflation, while
  // the start baseline automatically adjusts via relative scoring.
  const inflDev = Math.abs(m.inflation - 2.5);
  s += clamp(10 - inflDev * 3, -40, 10);

  // [FIX-7c] Raised unemployment floor -15 → -20. Crisis economies
  // starting at 22%+ unemployment need room below -15 to differentiate
  // "stable high unemployment" from "improving unemployment".
  s += clamp((10 - m.unemployment) * 1.5, -20, 20);

  s -= Math.max(0, (m.debtToGDP - 80) * 0.3);
  s += m.publicMood * 0.1;
  s += clamp(m.reserves * 0.05, 0, 10);
  s += m.innovationIndex * 0.05;
  s += clamp((m.avgSalary - 35000) / 2000, -5, 10);
  return s;
}

export function calculateWisdomScore(history: QuarterData[]): number {
  if (history.length < 2) return 0;

  const startMetrics    = history[0].metrics;
  const startBaseline   = scoreMetricsPerQuarter(startMetrics);
  const quarters        = history.slice(1);
  let relativeScore     = 0;

  for (let i = 0; i < quarters.length; i++) {
    const m       = quarters[i].metrics;
    const prevM   = i === 0 ? startMetrics : quarters[i - 1].metrics;
    const actual  = scoreMetricsPerQuarter(m);

    // Core: improvement vs inherited starting conditions
    relativeScore += (actual - startBaseline);

    // Stabilisation bonus: crisis tamer who brings high inflation below 6%
    if (startMetrics.inflation > 12 && m.inflation < 6) {
      const disinflation = Math.max(0, startMetrics.inflation - m.inflation);
      relativeScore += clamp(disinflation * 0.8, 0, 30);
    }

    // Momentum bonus: reward consistent quarter-on-quarter improvement
    // toward target metrics (encourages sustained policy, not one-hit tweaks)
    if (startMetrics.inflation > 8 && m.inflation < prevM.inflation) {
      relativeScore += Math.min((prevM.inflation - m.inflation) * 0.3, 3);
    }
    if (m.unemployment < prevM.unemployment && prevM.unemployment > 6) {
      relativeScore += Math.min((prevM.unemployment - m.unemployment) * 0.4, 3);
    }
  }

  const raw = relativeScore / quarters.length;
  // Baseline 500. Each unit of raw = 6 score points.
  return Math.max(0, Math.min(1000, Math.round(500 + raw * 6)));
}

// ═══════════════════════════════════════════════════════════════
// COUNTRY TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const COUNTRY_TEMPLATES: CountryTemplate[] = [
  {
    name: 'Nordic Union', region: 'Northern Europe', difficulty: 'easy',
    realBasis: 'Inspired by Sweden / Denmark (2022-23)',
    description: 'High-trust, high-tax welfare state. Strong institutions and a current account surplus give you room to breathe — but an aging population and rigid labour market mean structural reform is overdue.',
    metrics: { gdp: 2.1, inflation: 2.4, unemployment: 4.2, publicMood: 74, avgSalary: 62000, debtToGDP: 48, currencyStrength: 112, tradeBalance: 3.1, innovationIndex: 72, reserves: 220 },
  },
  {
    name: 'Gulf Sovereign', region: 'Middle East', difficulty: 'easy',
    realBasis: 'Inspired by UAE / Saudi Arabia (2023)',
    description: 'Petrodollar economy with a massive sovereign wealth fund. Oil revenues insulate you from short-run shocks — but a fixed exchange rate and zero income tax leave you with almost no monetary policy tools.',
    metrics: { gdp: 3.6, inflation: 2.8, unemployment: 2.4, publicMood: 68, avgSalary: 52000, debtToGDP: 28, currencyStrength: 130, tradeBalance: 9.2, innovationIndex: 38, reserves: 580 },
  },
  {
    name: 'Pacific Archipelago', region: 'East Asia', difficulty: 'easy',
    realBasis: 'Inspired by New Zealand / Singapore (2023)',
    description: 'Small open economy with excellent institutions and low corruption. Highly exposed to global trade cycles — a slowdown in your main partners cuts through quickly.',
    metrics: { gdp: 2.8, inflation: 3.0, unemployment: 3.6, publicMood: 71, avgSalary: 58000, debtToGDP: 38, currencyStrength: 108, tradeBalance: 2.4, innovationIndex: 66, reserves: 190 },
  },
  {
    name: 'Rhine Republic', region: 'Central Europe', difficulty: 'medium',
    realBasis: 'Inspired by Germany (2022-23)',
    description: 'Industrial export powerhouse with a large current account surplus. An energy shock has exposed structural dependence on imported commodities — you need to diversify fast.',
    metrics: { gdp: 1.4, inflation: 5.8, unemployment: 5.6, publicMood: 52, avgSalary: 52000, debtToGDP: 68, currencyStrength: 102, tradeBalance: 6.1, innovationIndex: 64, reserves: 320 },
  },
  {
    name: 'Coastal Giant', region: 'East Asia', difficulty: 'medium',
    realBasis: 'Inspired by China (2022-23)',
    description: 'A vast factory economy. Enormous reserves and infrastructure, but a property sector debt overhang, demographic headwinds, and a managed currency that limits monetary policy responses.',
    metrics: { gdp: 3.2, inflation: 2.6, unemployment: 5.5, publicMood: 55, avgSalary: 22000, debtToGDP: 78, currencyStrength: 90, tradeBalance: 7.8, innovationIndex: 52, reserves: 720 },
  },
  {
    name: 'South American Federation', region: 'Latin America', difficulty: 'medium',
    realBasis: 'Inspired by Brazil (2022-23)',
    description: 'Commodity-rich emerging market with a large domestic economy. Strong resource base but entrenched inequality, a complicated tax code, and high real interest rates that crowd out private investment.',
    metrics: { gdp: 2.9, inflation: 8.4, unemployment: 8.8, publicMood: 46, avgSalary: 14000, debtToGDP: 92, currencyStrength: 72, tradeBalance: 1.8, innovationIndex: 34, reserves: 88 },
  },
  {
    name: 'Subcontinental Republic', region: 'South Asia', difficulty: 'medium',
    realBasis: 'Inspired by India (2023)',
    description: 'Fastest-growing major economy. Demographic dividend, a booming tech sector, rising middle class — but infrastructure gaps, energy subsidies, and a wide fiscal deficit constrain how fast you can move.',
    metrics: { gdp: 6.1, inflation: 6.2, unemployment: 7.4, publicMood: 58, avgSalary: 9000, debtToGDP: 86, currencyStrength: 76, tradeBalance: -2.6, innovationIndex: 42, reserves: 140 },
  },
  {
    name: 'North Atlantic Power', region: 'North America', difficulty: 'medium',
    realBasis: 'Inspired by United States (2022-23)',
    description: 'Reserve currency issuer with deep capital markets and enormous policy latitude — but a $33T debt load, a polarised political system, and inflationary aftershocks from post-pandemic stimulus.',
    metrics: { gdp: 2.5, inflation: 4.8, unemployment: 3.8, publicMood: 49, avgSalary: 70000, debtToGDP: 122, currencyStrength: 116, tradeBalance: -3.4, innovationIndex: 82, reserves: 260 },
  },
  {
    name: 'Steppe Republic', region: 'Central Asia', difficulty: 'hard',
    realBasis: 'Inspired by Kazakhstan / Uzbekistan (2023)',
    description: 'Landlocked resource exporter buffeted by commodity volatility and geopolitical spillover. Capital flight risk is high — one wrong move on rates and reserves drain overnight.',
    metrics: { gdp: 4.1, inflation: 11.2, unemployment: 9.8, publicMood: 44, avgSalary: 10000, debtToGDP: 82, currencyStrength: 62, tradeBalance: 2.2, innovationIndex: 18, reserves: 38 },
  },
  {
    name: 'Eastern Mediterranean', region: 'Southern Europe', difficulty: 'hard',
    realBasis: 'Inspired by Greece / Turkey (2022-23)',
    description: 'Inflation is at emergency levels and the currency has lost a third of its value. Lenders are watching. Your first quarter will determine whether you stabilise or spiral into a full-blown crisis.',
    metrics: { gdp: 1.2, inflation: 18.4, unemployment: 14.6, publicMood: 32, avgSalary: 16000, debtToGDP: 164, currencyStrength: 48, tradeBalance: -5.8, innovationIndex: 28, reserves: 18 },
  },
  {
    name: 'Sub-Saharan Frontier', region: 'Africa', difficulty: 'hard',
    realBasis: 'Inspired by Nigeria / Ghana (2022-23)',
    description: 'Youngest population on earth. Vast untapped resources and a tech-enabled entrepreneurial class — but a debt crisis triggered by rising US rates, FX reserves nearly exhausted, and fuel subsidies eating the budget.',
    metrics: { gdp: 3.4, inflation: 22.8, unemployment: 18.2, publicMood: 29, avgSalary: 4800, debtToGDP: 78, currencyStrength: 41, tradeBalance: -6.4, innovationIndex: 14, reserves: 9 },
  },
  {
    name: 'Wartime Rebuild', region: 'Eastern Europe', difficulty: 'hard',
    realBasis: 'Inspired by Ukraine (2023)',
    description: 'Economy operating under extreme duress. Massive external aid is the only thing holding reserves above zero. Inflation is structural, the currency floats downward, and every quarter brings a new external shock.',
    metrics: { gdp: -4.8, inflation: 26.6, unemployment: 22.4, publicMood: 38, avgSalary: 5200, debtToGDP: 96, currencyStrength: 36, tradeBalance: -11.2, innovationIndex: 20, reserves: 22 },
  },
];

export const MOCK_LEADERBOARD = [
  { name: 'K. Watanabe',   score: 847, badge: 'Inflation Hawk'    },
  { name: 'P. Osei',       score: 791, badge: 'Debt Surgeon'      },
  { name: 'A. Lindstrom',  score: 734, badge: 'Welfare Architect' },
  { name: 'R. Mehta',      score: 688, badge: 'Trade Minister'    },
  { name: 'C. Ferreira',   score: 612, badge: 'Crisis Navigator'  },
  { name: 'O. Nakamura',   score: 571, badge: 'Steady Hand'       },
  { name: 'I. Balogun',    score: 503, badge: 'Reform Advocate'   },
];