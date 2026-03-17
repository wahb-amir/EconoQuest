export interface EconomicMetrics {
  inflation: number;
  unemployment: number;
  gdp: number;
  publicMood: number;
  avgSalary: number;
  debtToGDP: number;
  currencyStrength: number; // 100 = Baseline
  tradeBalance: number;     // % of GDP
  innovationIndex: number;  // 0-100
  reserves: number;         // Billions of USD (National Wealth)
}

export interface PolicyDecisions {
  taxRate: number; 
  interestRate: number; 
  spending: number; 
  moneyPrinting: boolean;
  rdInvestment: number;    // 0-20
  tariffLevel: number;     // 0-50
  foreignLending: number;  // 0-10 (% of GDP lent to others)
  investmentRisk: number;  // 0-100 (Risk level of Sovereign Wealth Fund)
}

export interface QuarterData {
  quarter: number;
  metrics: EconomicMetrics;
  policy: PolicyDecisions;
  event?: string;
}

export interface CountryTemplate {
  name: string;
  metrics: EconomicMetrics;
  description: string;
}

export const COUNTRY_TEMPLATES: CountryTemplate[] = [
  {
    name: "Stable Haven",
    description: "A prosperous, service-based economy with low debt and massive reserves.",
    metrics: {
      inflation: 2.1,
      unemployment: 4.5,
      gdp: 2.8,
      publicMood: 80,
      avgSalary: 55000,
      debtToGDP: 35,
      currencyStrength: 105,
      tradeBalance: 2.5,
      innovationIndex: 75,
      reserves: 450
    }
  },
  {
    name: "Emerging Giant",
    description: "Rapidly industrializing. Lean reserves but high growth potential.",
    metrics: {
      inflation: 8.5,
      unemployment: 6.2,
      gdp: 6.5,
      publicMood: 65,
      avgSalary: 12000,
      debtToGDP: 60,
      currencyStrength: 90,
      tradeBalance: 5.0,
      innovationIndex: 40,
      reserves: 80
    }
  },
  {
    name: "Tech Frontier",
    description: "Advanced technological hub. Innovation-led growth and strong capital.",
    metrics: {
      inflation: 1.8,
      unemployment: 3.2,
      gdp: 4.1,
      publicMood: 85,
      avgSalary: 72000,
      debtToGDP: 45,
      currencyStrength: 115,
      tradeBalance: 8.2,
      innovationIndex: 92,
      reserves: 320
    }
  },
  {
    name: "Resource Wealthy",
    description: "Rich in natural resources. Vulnerable to commodity price swings.",
    metrics: {
      inflation: 4.2,
      unemployment: 7.5,
      gdp: 3.5,
      publicMood: 55,
      avgSalary: 32000,
      debtToGDP: 25,
      currencyStrength: 95,
      tradeBalance: 12.0,
      innovationIndex: 30,
      reserves: 600
    }
  }
];

export function calculateNextQuarter(
  current: EconomicMetrics,
  previousPolicy: PolicyDecisions,
  newPolicy: PolicyDecisions,
  randomEventMultiplier: number = 1
): EconomicMetrics {
  const dTax = newPolicy.taxRate - previousPolicy.taxRate;
  const dInterest = newPolicy.interestRate - previousPolicy.interestRate;
  const dSpending = newPolicy.spending - previousPolicy.spending;
  
  // 1. Innovation logic
  let nextInnovation = current.innovationIndex + (newPolicy.rdInvestment * 0.12) - (newPolicy.taxRate * 0.01);
  
  // 2. Currency Strength logic
  let nextCurrency = current.currencyStrength + (dInterest * 1.8) - (current.inflation * 0.6) - (newPolicy.moneyPrinting ? 12 : 0) + (current.reserves / 2000);

  // 3. Trade Balance logic
  let nextTradeBalance = current.tradeBalance - ((nextCurrency - 100) * 0.15) + (newPolicy.tariffLevel * 0.25) + (nextInnovation * 0.08);

  // 4. Inflation logic
  let nextInflation = current.inflation 
    - (dInterest * 0.25) 
    - (dTax * 0.1) 
    + (dSpending * 0.15)
    + (newPolicy.moneyPrinting ? 4.0 : 0)
    + (newPolicy.tariffLevel * 0.12)
    * randomEventMultiplier;

  // 5. GDP logic
  let nextGDP = current.gdp 
    + (dSpending * 0.35) 
    - (dTax * 0.25) 
    - (dInterest * 0.2)
    + (nextInnovation * 0.12)
    + (nextTradeBalance * 0.25)
    + (newPolicy.moneyPrinting ? 2.0 : 0)
    - (newPolicy.foreignLending * 0.1) // Lending takes capital away today
    * (1 / randomEventMultiplier);

  // 6. Unemployment logic
  let nextUnemployment = current.unemployment 
    + (dTax * 0.18) 
    + (dInterest * 0.12) 
    - (dSpending * 0.25)
    - (nextInnovation * 0.06);

  // 7. Salary & Reserves logic
  let nextSalary = current.avgSalary * (1 + (nextGDP / 100) - (nextInflation / 220) + (nextInnovation / 800));
  
  // Fiscal Balance
  const budgetBalance = newPolicy.taxRate - newPolicy.spending - newPolicy.rdInvestment - newPolicy.foreignLending;
  
  // Investment returns on Reserves
  const investmentReturn = (current.reserves * (newPolicy.investmentRisk / 500)) * (randomEventMultiplier > 1 ? -1 : 1);
  const nextReserves = current.reserves + (budgetBalance * 2) + (newPolicy.foreignLending * 0.05) + investmentReturn;

  // 8. Debt logic
  let debtChange = -budgetBalance * 0.7;
  let nextDebtToGDP = (current.debtToGDP + debtChange) * (1 - (nextGDP / 120));

  // 9. Public Mood logic
  let moodDelta = 0;
  moodDelta -= (newPolicy.taxRate > 35 ? (newPolicy.taxRate - 35) * 1.5 : 0);
  moodDelta -= (nextInflation > 5 ? (nextInflation - 5) * 4.5 : 0);
  moodDelta -= (nextUnemployment > 8 ? (nextUnemployment - 8) * 6 : 0);
  moodDelta += (nextGDP > 3 ? 6 : nextGDP > 0 ? 2 : -10);
  moodDelta += (nextSalary > current.avgSalary ? 3 : -5);
  moodDelta += (nextReserves > current.reserves ? 2 : -2);
  moodDelta += (newPolicy.moneyPrinting ? -8 : 0);

  let nextMood = current.publicMood + moodDelta;

  return {
    inflation: Math.max(-10, Math.min(300, nextInflation)),
    unemployment: Math.max(0.1, Math.min(60, nextUnemployment)),
    gdp: Math.max(-30, Math.min(40, nextGDP)),
    publicMood: Math.max(0, Math.min(100, nextMood)),
    avgSalary: Math.round(nextSalary),
    debtToGDP: Math.max(0, Math.min(1500, nextDebtToGDP)),
    currencyStrength: Math.max(10, Math.min(400, nextCurrency)),
    tradeBalance: Math.max(-60, Math.min(60, nextTradeBalance)),
    innovationIndex: Math.max(0, Math.min(100, nextInnovation)),
    reserves: Math.max(0, nextReserves)
  };
}

export function calculateWisdomScore(history: QuarterData[]): number {
  if (history.length === 0) return 0;
  let totalPoints = 0;
  history.forEach(q => {
    const infScore = Math.max(0, 100 - Math.abs(q.metrics.inflation - 2) * 15);
    const unempScore = Math.max(0, 100 - Math.abs(q.metrics.unemployment - 4) * 15);
    const gdpScore = q.metrics.gdp * 30;
    const innovationBonus = q.metrics.innovationIndex * 1.5;
    const moodScore = q.metrics.publicMood * 2;
    const reservesBonus = q.metrics.reserves / 10;
    const debtPenalty = q.metrics.debtToGDP > 90 ? (q.metrics.debtToGDP - 90) * 3 : 0;
    totalPoints += (infScore + unempScore + gdpScore + innovationBonus + moodScore + reservesBonus - debtPenalty);
  });
  return Math.max(0, Math.round(totalPoints / history.length));
}

export const MOCK_LEADERBOARD = [
  { name: "EconomicSage", score: 1840, badge: "Grand Architect" },
  { name: "SovereignWealth", score: 1625, badge: "Reserve Master" },
  { name: "QuantumTrader", score: 1480, badge: "Market Disruptor" },
  { name: "StableMind", score: 1295, badge: "Stability Expert" },
  { name: "TechGiant", score: 1120, badge: "Innovation Legend" },
  { name: "TradeMaven", score: 975, badge: "Export King" },
  { name: "CitizenFirst", score: 850, badge: "Welfare Hero" },
  { name: "RisingStar", score: 755, badge: "Emerging Leader" },
  { name: "FiscalHawk", score: 610, badge: "Budget Watchdog" },
  { name: "DefaultRisk", score: 140, badge: "IMF Client" }
];
