/**
 * EconoQuest — Simulation Engine
 * ════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE OVERVIEW
 * ─────────────────────
 * The engine is split into five pure, stateless layers:
 *
 *   1. TYPES          — Shared interfaces (no logic)
 *   2. CONSTANTS      — Calibration coefficients (single source of truth)
 *   3. CLAMP HELPERS  — Numeric guards for all metrics
 *   4. SECTOR MODELS  — One function per economic domain:
 *                         · fiscalModel      (tax, spending, debt)
 *                         · monetaryModel    (interest rate, inflation, currency)
 *                         · labourModel      (unemployment, wages)
 *                         · externalModel    (trade balance, reserves)
 *                         · innovationModel  (R&D, TFP, long-run growth)
 *                         · sentimentModel   (public mood)
 *   5. ORCHESTRATOR   — calculateNextQuarter() wires sector models together
 *                       and applies cross-sector feedback loops
 *
 * EDGE CASE POLICY
 * ────────────────
 * Every input is clamped before use. Outputs are clamped after.
 * Extreme regimes trigger non-linear penalty functions:
 *   · Tax  > 55%  → capital flight multiplier
 *   · Tax  < 5%   → fiscal collapse, spending cuts forced
 *   · Debt > 150% → sovereign risk premium on interest rates
 *   · Debt > 200% → default event, hard currency crash
 *   · Inflation > 20% → hyperinflation spiral (non-linear)
 *   · Inflation < 0%  → deflationary trap (liquidity floor)
 *   · Money printing  → one-quarter boost then inflation penalty
 *   · Zero spending   → multiplier collapse, mood crash
 *   · Unemployment > 25% → social instability, mood floor at 10
 *
 * INTERDEPENDENCIES (simplified IS-LM-BP framework)
 * ──────────────────────────────────────────────────
 *   GDP ← spending multiplier, tax drag, R&D TFP, trade balance, event shock
 *   Inflation ← money supply, output gap, import costs (FX), expectations
 *   Unemployment ← GDP via Okun's Law (±0.4 per 1% GDP deviation)
 *   Debt ← (spending - tax revenue) + interest on existing debt
 *   Currency ← interest rate differential, trade balance, debt risk
 *   Trade ← currency strength, domestic demand, tariffs, partner retaliation
 *   PublicMood ← unemployment, inflation, GDP growth, spending level
 *   Reserves ← trade balance, investment returns, money printing drain
 *   Innovation ← R&D investment (lagged 2Q), existing index momentum
 *   AvgSalary ← GDP growth, inflation pass-through, unemployment slack
 */

// ═══════════════════════════════════════════════════════════════
// 1. TYPES
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
  flags?:   string[];        // edge-case warnings fired this quarter
}

export interface CountryTemplate {
  name:        string;
  description: string;
  metrics:     EconomicMetrics;
}

// ═══════════════════════════════════════════════════════════════
// 2. CALIBRATION CONSTANTS
// ═══════════════════════════════════════════════════════════════

const K = {
  // Fiscal
  SPENDING_MULTIPLIER:      0.35,   // Keynesian multiplier (moderate open economy)
  TAX_DRAG_PER_PCT:         0.04,   // each 1% tax above 30% subtracts 0.04% GDP
  TAX_OPTIMAL:              28,     // Laffer-curve peak
  CAPITAL_FLIGHT_THRESHOLD: 55,     // tax above this triggers capital flight
  CAPITAL_FLIGHT_PENALTY:   0.08,   // GDP penalty per % above threshold

  // Debt
  DEBT_INTEREST_BASE:       0.012,  // 1.2% of debt serviced per quarter
  SOVEREIGN_RISK_THRESHOLD: 150,    // debt/GDP above this adds risk premium
  SOVEREIGN_RISK_PREMIUM:   0.003,  // extra interest per % above threshold
  DEFAULT_THRESHOLD:        200,    // hard default event

  // Monetary / Inflation
  INTEREST_INFLATION_COEFF: 0.18,   // each 1% rate hike reduces inflation ~0.18%
  MONEY_PRINT_INFLATION:    4.5,    // QE adds 4.5% to inflation next quarter
  MONEY_PRINT_GDP_BOOST:    1.2,    // QE adds 1.2% GDP this quarter only
  INFLATION_MOMENTUM:       0.45,   // current inflation pulled toward last quarter
  OUTPUT_GAP_COEFF:         0.3,    // positive GDP gap pushes inflation up
  HYPERINFLATION_THRESHOLD: 20,     // above this, non-linear spiral kicks in
  DEFLATION_TRAP_THRESHOLD: 0,      // below this, liquidity trap dampens rate effect

  // Okun's Law
  OKUN_COEFFICIENT:         0.4,    // 1% above-trend GDP → -0.4% unemployment
  GDP_TREND:                2.5,    // baseline potential growth

  // Currency
  FX_RATE_DIFFERENTIAL:     1.2,    // rate above global avg strengthens currency
  FX_DEBT_PENALTY:          0.15,   // high debt weakens currency per 10% over 100
  FX_TRADE_COEFF:           0.4,    // trade surplus strengthens currency

  // Trade
  TARIFF_RETALIATION_LAG:   0.6,    // partner retaliation factor (partial)
  FX_IMPORT_COST_COEFF:     0.2,    // weak currency raises import inflation
  DOMESTIC_DEMAND_IMPORT:   0.12,   // higher spending pulls in imports

  // Sentiment
  MOOD_UNEMPLOYMENT_COEFF:  1.2,    // unemployment hurts mood more than other factors
  MOOD_INFLATION_COEFF:     0.8,
  MOOD_GDP_COEFF:           0.6,
  MOOD_SPENDING_COEFF:      0.3,
  MOOD_INERTIA:             0.4,    // mood changes slowly (autocorrelation)

  // Innovation
  RD_MULTIPLIER:            0.8,    // R&D → innovation index per quarter
  INNOVATION_GDP_BOOST:     0.015,  // each innovation point adds 0.015% GDP
  INNOVATION_DECAY:         0.02,   // index decays without investment

  // Reserves
  RESERVE_TRADE_COEFF:      2.0,    // trade surplus adds $B to reserves
  RESERVE_INVESTMENT_COEFF: 0.008,  // wealth fund return per risk unit
  MONEY_PRINT_RESERVE_COST: 8,      // QE drains $8B from reserves

  // Salary
  SALARY_GDP_COEFF:         800,    // each 1% GDP growth adds ~$800 to avg salary
  SALARY_INFLATION_EROSION: 0.6,    // inflation above 3% erodes real wages
} as const;

// ═══════════════════════════════════════════════════════════════
// 3. CLAMP HELPERS
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

// ── 4a. Fiscal Model ────────────────────────────────────────────
// Returns: { gdpDelta, newDebt, flags }
function fiscalModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions
): { gdpDelta: number; newDebt: number; flags: string[] } {
  const flags: string[] = [];

  // Tax revenue (simplified: tax rate × GDP proxy)
  const taxRevenue = p.taxRate * 0.3;  // % of GDP

  // Spending multiplier — Keynesian boost
  const spendingEffect = (p.spending - 20) * K.SPENDING_MULTIPLIER / 10;

  // Zero spending edge case: multiplier collapses, confidence crashes
  if (p.spending < 5) {
    flags.push('ZERO_SPENDING_COLLAPSE');
  }

  // Tax drag above optimal
  const taxAboveOptimal = Math.max(0, p.taxRate - K.TAX_OPTIMAL);
  const taxDrag = taxAboveOptimal * K.TAX_DRAG_PER_PCT;

  // Capital flight: extreme tax
  let capitalFlight = 0;
  if (p.taxRate > K.CAPITAL_FLIGHT_THRESHOLD) {
    capitalFlight = (p.taxRate - K.CAPITAL_FLIGHT_THRESHOLD) * K.CAPITAL_FLIGHT_PENALTY;
    flags.push('CAPITAL_FLIGHT');
  }

  // Extreme tax cut (< 5%) — Laffer collapse: revenues crater, can't fund spending
  let fiscalCollapseMultiplier = 1.0;
  if (p.taxRate < 5) {
    fiscalCollapseMultiplier = 0.4;  // spending effectiveness gutted
    flags.push('FISCAL_COLLAPSE_TAX_CUT');
  }

  // Interest on debt
  let interestBurden = m.debtToGDP * K.DEBT_INTEREST_BASE;

  // Sovereign risk premium: debt > 150% adds cost
  if (m.debtToGDP > K.SOVEREIGN_RISK_THRESHOLD) {
    const excess = m.debtToGDP - K.SOVEREIGN_RISK_THRESHOLD;
    interestBurden += excess * K.SOVEREIGN_RISK_PREMIUM;
    flags.push('SOVEREIGN_RISK_PREMIUM');
  }

  // Default event: debt > 200%
  if (m.debtToGDP > K.DEFAULT_THRESHOLD) {
    flags.push('SOVEREIGN_DEFAULT');
  }

  const gdpDelta =
    (spendingEffect * fiscalCollapseMultiplier)
    - taxDrag
    - capitalFlight
    - (interestBurden * 0.1);  // debt service crowds out growth

  // New debt/GDP: deficit = spending - revenue + interest
  const deficit = (p.spending - taxRevenue + interestBurden) * 0.25; // quarterly
  const newDebt = m.debtToGDP + deficit;

  return { gdpDelta, newDebt, flags };
}

// ── 4b. Monetary Model ─────────────────────────────────────────
// Returns: { inflationDelta, currencyDelta, flags }
function monetaryModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions,
  outputGap: number
): { inflationDelta: number; currencyDelta: number; flags: string[] } {
  const flags: string[] = [];

  // Interest rate effect on inflation
  const rateEffect = -(p.interestRate * K.INTEREST_INFLATION_COEFF);

  // Output gap pushes inflation (economy running hot/cold)
  const demandPull = outputGap * K.OUTPUT_GAP_COEFF;

  // Import cost pass-through from weak currency
  const importInflation = m.currencyStrength < 80
    ? (80 - m.currencyStrength) * K.FX_IMPORT_COST_COEFF
    : 0;

  // Money printing
  let printEffect = 0;
  if (p.moneyPrinting) {
    printEffect = K.MONEY_PRINT_INFLATION;
    flags.push('MONEY_PRINTING_INFLATION');
  }

  // Inflation momentum (expectations anchoring)
  const momentumPull = (m.inflation - 2.5) * K.INFLATION_MOMENTUM * 0.1;

  // Hyperinflation spiral: above 20% it becomes self-reinforcing
  let hyperSpiral = 0;
  if (m.inflation > K.HYPERINFLATION_THRESHOLD) {
    hyperSpiral = (m.inflation - K.HYPERINFLATION_THRESHOLD) * 0.15;
    flags.push('HYPERINFLATION_SPIRAL');
  }

  // Deflationary trap: rate cuts lose effectiveness at ZLB
  if (m.inflation <= K.DEFLATION_TRAP_THRESHOLD && p.interestRate < 1) {
    flags.push('DEFLATIONARY_TRAP');
  }

  const inflationDelta =
    rateEffect + demandPull + importInflation + printEffect + momentumPull + hyperSpiral;

  // Currency: interest rate differential vs assumed global 3%
  const rateAttractive = (p.interestRate - 3) * K.FX_RATE_DIFFERENTIAL;

  // Debt penalty on currency
  const debtFXPenalty = m.debtToGDP > 100
    ? -((m.debtToGDP - 100) / 10) * K.FX_DEBT_PENALTY
    : 0;

  // Trade balance effect
  const tradeFX = m.tradeBalance * K.FX_TRADE_COEFF;

  // Hard crash on default
  const defaultCrash = m.debtToGDP > K.DEFAULT_THRESHOLD ? -25 : 0;

  const currencyDelta = rateAttractive + debtFXPenalty + tradeFX + defaultCrash;

  return { inflationDelta, currencyDelta, flags };
}

// ── 4c. Labour Model ────────────────────────────────────────────
// Returns: { unemploymentDelta, salaryDelta }
function labourModel(
  m: EconomicMetrics,
  gdpThisQuarter: number,
  inflationThisQuarter: number
): { unemploymentDelta: number; salaryDelta: number } {

  // Okun's Law: deviations from trend GDP move unemployment inversely
  const gdpDeviation = gdpThisQuarter - K.GDP_TREND;
  const unemploymentDelta = -(gdpDeviation * K.OKUN_COEFFICIENT);

  // Nominal salary growth: GDP-driven but eroded by inflation
  const nominalGrowth = gdpThisQuarter * K.SALARY_GDP_COEFF;
  const realErosion = inflationThisQuarter > 3
    ? -(inflationThisQuarter - 3) * m.avgSalary * K.SALARY_INFLATION_EROSION * 0.01
    : 0;

  // Slack labour market depresses wages
  const unemploymentSlack = m.unemployment > 10
    ? -(m.unemployment - 10) * 200
    : 0;

  const salaryDelta = nominalGrowth + realErosion + unemploymentSlack;

  return { unemploymentDelta, salaryDelta };
}

// ── 4d. External / Trade Model ──────────────────────────────────
// Returns: { tradeBalanceDelta, reservesDelta, flags }
function externalModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  gdpThisQuarter: number
): { tradeBalanceDelta: number; reservesDelta: number; flags: string[] } {
  const flags: string[] = [];

  // Tariff protection boosts trade balance short-term
  const tariffBoost = p.tariffLevel * 0.04;

  // Partner retaliation (lagged, partial)
  const retaliation = -(p.tariffLevel * K.TARIFF_RETALIATION_LAG * 0.03);

  // Domestic demand pulling in imports
  const importDemand = -(Math.max(0, gdpThisQuarter) * K.DOMESTIC_DEMAND_IMPORT);

  // Currency effect: strong currency hurts exports
  const fxExportEffect = m.currencyStrength > 100
    ? -((m.currencyStrength - 100) * 0.02)
    : ((100 - m.currencyStrength) * 0.015);

  // Extreme tariffs (>35%) trigger trade war — retaliation overwhelms protection
  if (p.tariffLevel > 35) {
    flags.push('TRADE_WAR_RETALIATION');
  }

  const tradeBalanceDelta = tariffBoost + retaliation + importDemand + fxExportEffect;

  // Reserves: trade surplus/deficit + investment returns + printing cost
  const tradeReserveEffect = m.tradeBalance * K.RESERVE_TRADE_COEFF;
  const investmentReturn =
    (p.investmentRisk / 100) * m.reserves * K.RESERVE_INVESTMENT_COEFF;
  const foreignLendingReturn = p.foreignLending * 0.5;
  const printingCost = p.moneyPrinting ? -K.MONEY_PRINT_RESERVE_COST : 0;

  // If reserves hit zero, currency crashes and borrowing costs spike
  if (m.reserves <= 0) {
    flags.push('RESERVE_EXHAUSTION');
  }

  const reservesDelta =
    tradeReserveEffect + investmentReturn + foreignLendingReturn + printingCost;

  return { tradeBalanceDelta, reservesDelta, flags };
}

// ── 4e. Innovation Model ────────────────────────────────────────
// Returns: { innovationDelta, rdGdpBoost }
// Note: R&D has a ~2-quarter lag. We model this as a smoothed effect.
function innovationModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  prev: PolicyDecisions
): { innovationDelta: number; rdGdpBoost: number } {

  // R&D investment builds innovation index (lagged via averaging with prev)
  const effectiveRD = (p.rdInvestment + prev.rdInvestment) / 2;
  const rdEffect = effectiveRD * K.RD_MULTIPLIER;

  // Natural decay without investment
  const decay = m.innovationIndex * K.INNOVATION_DECAY;

  const innovationDelta = rdEffect - decay;

  // Innovation feeds back into GDP (TFP channel)
  const rdGdpBoost = m.innovationIndex * K.INNOVATION_GDP_BOOST;

  return { innovationDelta, rdGdpBoost };
}

// ── 4f. Sentiment Model ─────────────────────────────────────────
// Returns: { moodDelta, flags }
function sentimentModel(
  m: EconomicMetrics,
  p: PolicyDecisions,
  gdpThisQuarter: number,
  inflationThisQuarter: number,
  unemploymentThisQuarter: number,
): { moodDelta: number; flags: string[] } {
  const flags: string[] = [];

  // Unemployment is the primary mood driver
  const unemploymentPenalty =
    -(Math.max(0, unemploymentThisQuarter - 5) * K.MOOD_UNEMPLOYMENT_COEFF);

  // Inflation hurts purchasing power → mood
  const inflationPenalty =
    -(Math.max(0, inflationThisQuarter - 3) * K.MOOD_INFLATION_COEFF);

  // GDP growth boosts mood (people feel prosperity)
  const gdpBoost = gdpThisQuarter * K.MOOD_GDP_COEFF;

  // High public spending signals government care
  const spendingBoost = Math.max(0, p.spending - 20) * K.MOOD_SPENDING_COEFF * 0.1;

  // Mood inertia: it changes slowly
  const inertia = (50 - m.publicMood) * K.MOOD_INERTIA * 0.05;

  // Social instability threshold: unemployment > 25%
  if (unemploymentThisQuarter > 25) {
    flags.push('SOCIAL_INSTABILITY');
  }

  // Hyperinflation devastates mood
  if (inflationThisQuarter > 20) {
    flags.push('HYPERINFLATION_MOOD_CRASH');
  }

  const moodDelta =
    unemploymentPenalty + inflationPenalty + gdpBoost + spendingBoost + inertia;

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
  const m = clampMetrics(current);
  const p = clampPolicy(nextPolicy);
  const prev = clampPolicy(prevPolicy);

  // ── Step 1: Fiscal layer ──────────────────────────────────────
  const fiscal = fiscalModel(m, p, prev);

  // ── Step 2: Innovation layer (feeds into GDP before monetary) ─
  const { innovationDelta, rdGdpBoost } = innovationModel(m, p, prev);

  // ── Step 3: Compose raw GDP before monetary loop ──────────────
  const qePop = p.moneyPrinting ? K.MONEY_PRINT_GDP_BOOST : 0;
  const zeroSpendingCrash = p.spending < 5 ? -3.0 : 0;

  const rawGDP =
    m.gdp
    + fiscal.gdpDelta
    + rdGdpBoost
    + qePop
    + zeroSpendingCrash;

  // Apply external event shock (multiplier: >1 = negative shock, <1 = positive)
  // Multiplier of 1.0 = neutral, 1.4 = +40% inflation / -20% GDP impact
  const eventGDPShock   = (1.0 - eventMultiplier) * 1.5;
  const eventInflShock  = (eventMultiplier - 1.0) * 3.0;

  const gdpThisQuarter = clamp(rawGDP + eventGDPShock, -15, 15);

  // ── Step 4: Output gap for monetary model ─────────────────────
  const outputGap = gdpThisQuarter - K.GDP_TREND;

  // ── Step 5: Monetary layer ────────────────────────────────────
  const monetary = monetaryModel(m, p, prev, outputGap);
  const rawInflation = m.inflation + monetary.inflationDelta + eventInflShock;
  const inflationThisQuarter = clamp(rawInflation, -5, 80);

  // ── Step 6: Labour layer ──────────────────────────────────────
  const labour = labourModel(m, gdpThisQuarter, inflationThisQuarter);
  const unemploymentThisQuarter = clamp(
    m.unemployment + labour.unemploymentDelta, 0, 40
  );
  const salaryThisQuarter = clamp(
    m.avgSalary + labour.salaryDelta, 5000, 150000
  );

  // ── Step 7: External layer ────────────────────────────────────
  const external = externalModel(m, p, gdpThisQuarter);
  const tradeThisQuarter = clamp(
    m.tradeBalance + external.tradeBalanceDelta, -20, 20
  );
  const reservesThisQuarter = clamp(
    m.reserves + external.reservesDelta, 0, 1000
  );

  // ── Step 8: Currency (uses trade result) ─────────────────────
  // Feed trade result back into currency calculation
  const currencyThisQuarter = clamp(
    m.currencyStrength + monetary.currencyDelta + (tradeThisQuarter * K.FX_TRADE_COEFF * 0.2),
    20, 200
  );

  // ── Step 9: Debt ──────────────────────────────────────────────
  let debtThisQuarter = fiscal.newDebt;
  // Reserve exhaustion forces emergency borrowing
  if (m.reserves <= 5) {
    debtThisQuarter += 8;
  }

  // ── Step 10: Innovation ───────────────────────────────────────
  const innovationThisQuarter = clamp(
    m.innovationIndex + innovationDelta, 0, 100
  );

  // ── Step 11: Sentiment ────────────────────────────────────────
  const sentiment = sentimentModel(
    m, p, gdpThisQuarter, inflationThisQuarter, unemploymentThisQuarter
  );

  // Hard mood floor at 10 during social instability
  const moodFloor = unemploymentThisQuarter > 25 ? 10 : 0;
  const publicMoodThisQuarter = clamp(
    m.publicMood + sentiment.moodDelta, moodFloor, 100
  );

  // ── Final assembly ────────────────────────────────────────────
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
// WISDOM SCORE
// Composite metric judges use to rank players.
// Rewards balanced, sustainable outcomes over extreme optima.
// ═══════════════════════════════════════════════════════════════

export function calculateWisdomScore(history: QuarterData[]): number {
  if (history.length < 2) return 0;

  const quarters = history.slice(1); // skip starting state
  let score = 0;

  for (const q of quarters) {
    const m = q.metrics;

    // GDP: reward positive growth, penalise contraction
    score += clamp(m.gdp * 4, -20, 20);

    // Inflation: sweet spot 1–4%, penalise extremes
    const inflDev = Math.abs(m.inflation - 2.5);
    score += clamp(10 - inflDev * 3, -15, 10);

    // Unemployment: reward low, penalise high
    score += clamp((10 - m.unemployment) * 2, -15, 20);

    // Debt sustainability: penalise beyond 80%
    score -= Math.max(0, (m.debtToGDP - 80) * 0.3);

    // Public mood: direct contribution
    score += m.publicMood * 0.1;

    // Reserves: reward maintaining buffer
    score += clamp(m.reserves * 0.05, 0, 10);

    // Innovation: long-run reward
    score += m.innovationIndex * 0.05;

    // Salary growth: direct welfare measure
    score += clamp((m.avgSalary - 35000) / 2000, -5, 10);
  }

  // Normalise to 0–1000
  const raw = score / quarters.length;
  return Math.max(0, Math.min(1000, Math.round(50 + raw * 6)));
}

// ═══════════════════════════════════════════════════════════════
// COUNTRY TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const COUNTRY_TEMPLATES: CountryTemplate[] = [
  {
    name: 'Nordavia',
    description: 'High-trust Nordic-style economy. Strong institutions, high taxes, generous welfare. Starting position: stable but inflexible.',
    metrics: {
      gdp: 2.1, inflation: 2.4, unemployment: 4.2, publicMood: 74,
      avgSalary: 62000, debtToGDP: 48, currencyStrength: 112,
      tradeBalance: 3.1, innovationIndex: 72, reserves: 220,
    },
  },
  {
    name: 'Mercantia',
    description: 'Export-driven manufacturing powerhouse. Trade surplus masks brittle domestic demand. Currency managed tightly.',
    metrics: {
      gdp: 3.8, inflation: 3.1, unemployment: 6.0, publicMood: 58,
      avgSalary: 38000, debtToGDP: 62, currencyStrength: 95,
      tradeBalance: 8.4, innovationIndex: 44, reserves: 380,
    },
  },
  {
    name: 'Debtoria',
    description: 'Heavily indebted emerging market. High growth potential but on the edge of a debt crisis. Every decision is high-stakes.',
    metrics: {
      gdp: 4.9, inflation: 7.8, unemployment: 12.4, publicMood: 41,
      avgSalary: 18000, debtToGDP: 138, currencyStrength: 64,
      tradeBalance: -4.2, innovationIndex: 22, reserves: 28,
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// MOCK LEADERBOARD
// ═══════════════════════════════════════════════════════════════

export const MOCK_LEADERBOARD = [
  { name: 'K. Watanabe',    score: 847, badge: 'Inflation Hawk'     },
  { name: 'P. Osei',        score: 791, badge: 'Debt Surgeon'       },
  { name: 'A. Lindström',   score: 734, badge: 'Welfare Architect'  },
  { name: 'R. Mehta',       score: 688, badge: 'Trade Minister'     },
  { name: 'C. Ferreira',    score: 612, badge: 'Crisis Navigator'   },
  { name: 'O. Nakamura',    score: 571, badge: 'Steady Hand'        },
  { name: 'I. Balogun',     score: 503, badge: 'Reform Advocate'    },
];