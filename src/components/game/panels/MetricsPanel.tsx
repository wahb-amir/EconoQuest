"use client";

import React, { useState, useEffect, useCallback } from "react";

/* ─── Types ────────────────────────────────────────────────────────────────── */

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

interface MetricsPanelProps {
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history: QuarterData[];
  quarter: number;
  progress: number;
  isOver: boolean;
  onNextQuarter: () => void;
}

type MetricKey = keyof EconomicMetrics;

/* ─── Education data ───────────────────────────────────────────────────────── */

interface HealthRange {
  label: string;
  color: string;
  range: string;
  min: number;
  max: number;
}

interface PolicyEffect {
  policy: string;
  effect: "positive" | "negative" | "neutral";
  description: string;
}

interface MetricEdu {
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

const EDU: Record<MetricKey, MetricEdu> = {
  gdp: {
    title: "GDP Growth Rate", symbol: "GDP", tagline: "The economy's quarterly pulse", unit: "% growth (range: −15 to +15)",
    definition: "GDP Growth Rate measures how fast the economy is expanding (or contracting) this quarter relative to trend. A +2.1% reading means the economy is growing at 2.1% above its neutral pace. Negative values mean the economy is shrinking — recession territory. In this simulation it is bounded between −15% and +15%.",
    whyItMatters: "GDP growth drives hiring, wages, and government revenue. Sustained growth above 2% creates a virtuous cycle: more jobs → more spending → more production. Negative GDP triggers rising unemployment, falling tax receipts, and deteriorating public services.",
    howCalculated: "In the engine: ΔGdp = spendingEffect − taxDrag − interestDrag + rdGdpBoost ± eventShock. Spending above 20% of GDP boosts growth. Tax rates above 28% create drag. High interest rates dampen investment. R&D investment compounds productivity over time.",
    healthRanges: [
      {
        label: "Deep Recession", color: "#9b2c2c", range: "< −3%",
        min: 0,
        max: 0
      },
      {
        label: "Recession", color: "#e53e3e", range: "−3% to 0%",
        min: 0,
        max: 0
      },
      {
        label: "Stagnation", color: "#dd6b20", range: "0–1.5%",
        min: 0,
        max: 0
      },
      {
        label: "Healthy Growth", color: "#38a169", range: "1.5–4%",
        min: 0,
        max: 0
      },
      {
        label: "Boom", color: "#3182ce", range: "4–7%",
        min: 0,
        max: 0
      },
      {
        label: "Overheating", color: "#805ad5", range: "> 7%",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Low taxes (near 28%)", effect: "positive", description: "Near-optimal tax rate stimulates private spending and business investment" },
      { policy: "High interest rates", effect: "negative", description: "Raises borrowing costs, dragging down investment and consumer spending" },
      { policy: "High government spending", effect: "positive", description: "Direct fiscal stimulus — multiplied 0.35× through the spending multiplier" },
      { policy: "High tariffs (>35%)", effect: "negative", description: "Triggers trade-war retaliation, shrinking export markets and GDP" },
    ],
    realWorldExample: "US GDP growth collapsed to −32.9% annualised in Q2 2020 (COVID lockdown) — the sharpest contraction in modern history. It rebounded +33.8% the next quarter as stimulus kicked in. The simulation's −15/+15 range represents a single quarter's growth rate, not annualised figures.",
    funFact: "China sustained GDP growth above 10% for nearly 30 consecutive years (1980–2010), lifting 800 million people out of poverty. No economy that large has ever grown that fast for that long — a feat the simulation's engine treats as the 'overheating' zone.",
    leaderboardImpact: "GDP growth above +3% per quarter boosts your Wisdom Score significantly. Consecutive quarters of growth create a compounding bonus. Negative GDP (recession) imposes penalties that worsen with each additional quarter below zero.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  inflation: {
    title: "Inflation Rate", symbol: "CPI %", tagline: "The silent tax on your citizens", unit: "% per year",
    definition: "Inflation measures how fast the general price level of goods and services rises over time. At 5% inflation, something costing $100 today will cost $105 next year. It's the rate at which your currency loses purchasing power.",
    whyItMatters: "Moderate inflation (2–3%) encourages spending and investment. But high inflation erodes savings, punishes fixed-income earners, and destroys public trust. Hyperinflation above 50% monthly has toppled governments throughout history.",
    howCalculated: "Inflation is driven by money supply growth, demand outpacing supply, and import costs. Printing money, high government spending, low interest rates, and currency weakness all push it higher.",
    healthRanges: [
      {
        label: "Deflation", color: "#3182ce", range: "< 0%",
        min: 0,
        max: 0
      },
      {
        label: "Target Zone", color: "#38a169", range: "1–4%",
        min: 0,
        max: 0
      },
      {
        label: "Elevated", color: "#ecc94b", range: "4–8%",
        min: 0,
        max: 0
      },
      {
        label: "High", color: "#dd6b20", range: "8–15%",
        min: 0,
        max: 0
      },
      {
        label: "Crisis", color: "#e53e3e", range: "> 15%",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Raise interest rates", effect: "positive", description: "Classic anti-inflation tool — makes borrowing expensive, cools spending" },
      { policy: "Money printing", effect: "negative", description: "Most direct inflation trigger — more money chasing same goods" },
      { policy: "Cut spending", effect: "positive", description: "Reduces demand-pull inflation by lowering government demand" },
      { policy: "Currency strength", effect: "positive", description: "Strong currency makes imports cheaper, lowering price pressure" },
    ],
    realWorldExample: "Zimbabwe's 2008 hyperinflation reached 89.7 sextillion percent. Citizens needed wheelbarrows of cash to buy bread. Germany's 1923 Weimar hyperinflation destroyed the middle class and enabled the rise of Nazism.",
    funFact: "The US Federal Reserve officially targets 2% inflation — not 0%. A small, predictable inflation gives the central bank room to cut in a crisis and discourages hoarding cash instead of investing it.",
    leaderboardImpact: "Inflation above 8% triggers a penalty flag that compounds each quarter. Hyperinflation above 15% is one of the fastest ways to collapse your Wisdom Score.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  unemployment: {
    title: "Unemployment Rate", symbol: "U-Rate", tagline: "Idle hands cost more than wages", unit: "% of workforce",
    definition: "The unemployment rate measures the percentage of people in the labor force who are actively seeking work but cannot find it. It captures the human cost of economic underperformance — lost income, skills atrophy, and social strain.",
    whyItMatters: "Every percentage point represents millions without income. High unemployment strains public budgets, increases crime, and erodes public mood. Low unemployment drives wage growth and consumer spending.",
    howCalculated: "Unemployment responds to GDP growth, business confidence, interest rates, and wages. High interest rates slow hiring. Low growth shrinks labor demand. Your wage policies and business tax rates heavily influence this metric.",
    healthRanges: [
      {
        label: "Overheated", color: "#805ad5", range: "< 3%",
        min: 0,
        max: 0
      },
      {
        label: "Full Employment", color: "#38a169", range: "3–5%",
        min: 0,
        max: 0
      },
      {
        label: "Moderate", color: "#ecc94b", range: "5–8%",
        min: 0,
        max: 0
      },
      {
        label: "High", color: "#dd6b20", range: "8–12%",
        min: 0,
        max: 0
      },
      {
        label: "Crisis", color: "#e53e3e", range: "> 12%",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Low interest rates", effect: "positive", description: "Cheap credit enables businesses to expand and hire more workers" },
      { policy: "High R&D investment", effect: "positive", description: "Creates high-skilled jobs and drives sector growth" },
      { policy: "High taxes on business", effect: "negative", description: "Squeezes margins, discourages hiring and expansion" },
      { policy: "High government spending", effect: "positive", description: "Public sector jobs and infrastructure contracts absorb labor" },
    ],
    realWorldExample: "US unemployment hit 24.9% in 1933 during the Great Depression. FDR's New Deal reduced it to 14.3% by 1937. Spain's youth unemployment surpassed 50% after the 2008 crisis — a 'lost generation' effect still visible today.",
    funFact: "Even at 'full employment', 3–4% unemployment exists naturally — people between jobs, or changing careers. Zero unemployment would actually signal labor market dysfunction, not success.",
    leaderboardImpact: "Unemployment above 20% triggers the 'Social Instability' flag, imposing escalating penalties on your public mood and GDP growth each subsequent quarter.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  debtToGDP: {
    title: "Debt-to-GDP Ratio", symbol: "D/GDP", tagline: "Your nation's mortgage vs. its income", unit: "% of GDP",
    definition: "The debt-to-GDP ratio compares a country's total government debt to the size of its economy. A ratio of 60% means the country owes 60% of everything it produces in a year. It's the primary measure of fiscal sustainability.",
    whyItMatters: "High debt means more budget goes to interest payments instead of schools and healthcare. Above certain thresholds, lenders demand higher rates, creating a debt spiral. Sovereign default triggers economic catastrophe.",
    howCalculated: "Debt grows when spending exceeds tax revenue. Your debt-to-GDP rises when: spending > taxes, growth slows (shrinking the denominator), or interest compounds on existing debt.",
    healthRanges: [
      {
        label: "Excellent", color: "#38a169", range: "< 40%",
        min: 0,
        max: 0
      },
      {
        label: "Manageable", color: "#ecc94b", range: "40–80%",
        min: 0,
        max: 0
      },
      {
        label: "Elevated", color: "#dd6b20", range: "80–120%",
        min: 0,
        max: 0
      },
      {
        label: "Dangerous", color: "#e53e3e", range: "120–160%",
        min: 0,
        max: 0
      },
      {
        label: "Crisis Zone", color: "#9b2c2c", range: "> 160%",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "High tax rate", effect: "positive", description: "More revenue reduces the deficit and slows debt accumulation" },
      { policy: "Cut spending", effect: "positive", description: "Austerity directly reduces the primary deficit" },
      { policy: "GDP growth", effect: "positive", description: "Growing economy makes same debt level a smaller % of GDP" },
      { policy: "Money printing", effect: "negative", description: "May inflate away debt short-term but destroys currency credibility" },
    ],
    realWorldExample: "Japan has debt-to-GDP at ~260% yet hasn't defaulted — most debt is held domestically. Greece at 180% in 2010 nearly collapsed because it couldn't print its own currency and foreign creditors fled.",
    funFact: "The Maastricht Treaty that created the Euro set a 60% debt-to-GDP limit for member states. Today the average Eurozone country is at ~90%. Rules, it seems, are easier to write than to follow.",
    leaderboardImpact: "Above 150% triggers 'Sovereign Risk Premium' — all future borrowing costs escalate. Above 200%, 'Default Risk Imminent' flag activates with severe score penalties.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  currencyStrength: {
    title: "Currency Strength", symbol: "FX Index", tagline: "Your money's reputation abroad", unit: "Index (100 = baseline)",
    definition: "Currency strength measures the value of your national currency relative to a basket of other major currencies. An index of 120 means your currency buys 20% more foreign goods than baseline; 80 means it's 20% weaker.",
    whyItMatters: "Currency strength directly affects import costs (weaker = more expensive imports, fueling inflation), export competitiveness (weaker = your goods are cheaper globally), and foreign investor confidence.",
    howCalculated: "Currency responds to interest rate differentials, inflation, trade balances, and capital flows. High interest rates attract foreign capital. High inflation and money printing weaken it. Trade surpluses strengthen it.",
    healthRanges: [
      {
        label: "Severely Weak", color: "#e53e3e", range: "< 60",
        min: 0,
        max: 0
      },
      {
        label: "Weak", color: "#dd6b20", range: "60–85",
        min: 0,
        max: 0
      },
      {
        label: "Balanced", color: "#38a169", range: "85–115",
        min: 0,
        max: 0
      },
      {
        label: "Strong", color: "#3182ce", range: "115–140",
        min: 0,
        max: 0
      },
      {
        label: "Overvalued", color: "#805ad5", range: "> 140",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "High interest rates", effect: "positive", description: "Attracts foreign capital seeking yield, strengthening the currency" },
      { policy: "Money printing", effect: "negative", description: "Floods supply of domestic currency, depressing its value" },
      { policy: "Trade surplus", effect: "positive", description: "Foreign demand for your currency to pay for exports" },
      { policy: "High inflation", effect: "negative", description: "Erodes real returns, drives capital outflows" },
    ],
    realWorldExample: "The British Pound lost 15% in hours on 'Black Wednesday' (1992) when George Soros shorted it — the UK spent £3.3B defending it before capitulating. Argentina's peso lost 70% in 2018–2019.",
    funFact: "Switzerland deliberately weakens its franc at times — too strong a currency makes Swiss exports uncompetitive. In 2015, removing the franc cap caused it to jump 30% in minutes, roiling global markets.",
    leaderboardImpact: "Currency below 60 triggers import inflation spirals compounding unemployment and public mood penalties. Currency above 130 can hurt export-dependent economies by making goods expensive abroad.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  tradeBalance: {
    title: "Trade Balance", symbol: "TB", tagline: "Are you selling more than you're buying?", unit: "$ Billions",
    definition: "The trade balance is the difference between exports (goods sold abroad) and imports (goods bought from abroad). Positive = trade surplus. Negative = trade deficit — you import more than you export.",
    whyItMatters: "Persistent deficits mean money is flowing out, requiring borrowing to fund consumption. Surpluses build foreign reserves and strengthen the currency. However, large surpluses can invite trade retaliation.",
    howCalculated: "Trade balance = Exports − Imports. Your tariff level, currency strength, and innovation index determine export competitiveness. Currency weakness makes exports cheaper. High R&D improves export quality and demand.",
    healthRanges: [
      {
        label: "Large Deficit", color: "#e53e3e", range: "< -$30B",
        min: 0,
        max: 0
      },
      {
        label: "Deficit", color: "#dd6b20", range: "-$30B to -$5B",
        min: 0,
        max: 0
      },
      {
        label: "Near Balance", color: "#38a169", range: "-$5B to $5B",
        min: 0,
        max: 0
      },
      {
        label: "Surplus", color: "#3182ce", range: "$5B to $30B",
        min: 0,
        max: 0
      },
      {
        label: "Large Surplus", color: "#805ad5", range: "> $30B",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Low tariffs", effect: "positive", description: "Reduces retaliation, enables efficient supply chains boosting exports" },
      { policy: "High tariffs", effect: "neutral", description: "Cuts imports short-term but invites retaliation, harming exports" },
      { policy: "R&D investment", effect: "positive", description: "Innovation creates high-value exports with global demand" },
      { policy: "Weak currency", effect: "positive", description: "Makes exports cheaper globally, improving competitive position" },
    ],
    realWorldExample: "Germany runs the world's largest trade surplus (~$300B/year) through high-quality manufacturing. The US runs the largest deficit (~-$800B/year) — reflecting strong consumer demand and the dollar's reserve currency status.",
    funFact: "Economists debate whether deficits are actually bad. Warren Buffett calls the US deficit 'a sharing of prosperity' — foreigners want dollars so badly they accept US goods less than US currency.",
    leaderboardImpact: "A strong positive trade balance improves reserves and currency strength in subsequent quarters — a compounding virtuous cycle. Sustained deficits slowly drain reserves.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  innovationIndex: {
    title: "Innovation Index", symbol: "INN", tagline: "Tomorrow's productivity, today", unit: "Index (0–100)",
    definition: "The Innovation Index measures an economy's capacity for technological advancement, research output, patent creation, and knowledge economy growth. It represents the long-term engine of productivity.",
    whyItMatters: "Innovation is the only truly sustainable source of economic growth. Countries that innovate develop high-value industries, attract talent, and build durable competitive advantages. Low innovation means competing on cost alone.",
    howCalculated: "Your R&D Investment slider directly drives innovation accumulation. Innovation compounds slowly — investments today pay dividends 2–4 quarters later. Education quality and trade openness also contribute.",
    healthRanges: [
      {
        label: "Stagnant", color: "#e53e3e", range: "0–25",
        min: 0,
        max: 0
      },
      {
        label: "Developing", color: "#dd6b20", range: "25–45",
        min: 0,
        max: 0
      },
      {
        label: "Competitive", color: "#ecc94b", range: "45–65",
        min: 0,
        max: 0
      },
      {
        label: "Advanced", color: "#38a169", range: "65–80",
        min: 0,
        max: 0
      },
      {
        label: "Frontier", color: "#3182ce", range: "80–100",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "High R&D investment", effect: "positive", description: "Primary driver — funds universities, labs, and startup ecosystems" },
      { policy: "Low tariffs", effect: "positive", description: "Access to global supply chains accelerates technology transfer" },
      { policy: "Political stability", effect: "positive", description: "Certainty attracts long-term research investment and talent" },
      { policy: "High taxes", effect: "negative", description: "Can reduce private R&D budgets and startup formation" },
    ],
    realWorldExample: "South Korea's innovation exploded from near-zero in 1960 to world-leading by 2000 through massive state R&D (Samsung, Hyundai, LG were all state-backed). Finland became the world's most innovative nation through education investment.",
    funFact: "The internet, GPS, touchscreens, voice recognition, and mRNA vaccines all originated in government-funded research before private companies commercialized them.",
    leaderboardImpact: "High innovation creates a quarterly GDP bonus that compounds over time. It's the highest long-term return on any investment in the game — but requires patience to accumulate.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  avgSalary: {
    title: "Average Salary", symbol: "AVG-W", tagline: "What your workers actually take home", unit: "$ per year",
    definition: "Average salary represents the mean annual income across all employed workers. It's the most direct measure of citizen economic wellbeing — the number that determines whether people can afford housing, food, healthcare, and education.",
    whyItMatters: "Wages drive 70% of GDP through consumer spending. Rising wages boost public mood, reduce inequality, and create a virtuous cycle of spending → investment → more jobs. Stagnant wages despite GDP growth signal gains going to capital rather than labor.",
    howCalculated: "Wages grow when unemployment is low (workers have bargaining power), productivity rises through innovation, and the economy is expanding. They fall when unemployment is high or inflation outpaces nominal gains.",
    healthRanges: [
      {
        label: "Poverty Level", color: "#e53e3e", range: "< $15,000",
        min: 0,
        max: 0
      },
      {
        label: "Low Income", color: "#dd6b20", range: "$15,000–$30,000",
        min: 0,
        max: 0
      },
      {
        label: "Middle Class", color: "#ecc94b", range: "$30,000–$55,000",
        min: 0,
        max: 0
      },
      {
        label: "Comfortable", color: "#38a169", range: "$55,000–$80,000",
        min: 0,
        max: 0
      },
      {
        label: "High Income", color: "#3182ce", range: "> $80,000",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Low unemployment", effect: "positive", description: "Tight labor market forces employers to compete with higher wages" },
      { policy: "High R&D", effect: "positive", description: "Innovation creates high-skill, high-wage jobs" },
      { policy: "High inflation", effect: "negative", description: "Erodes real wages even when nominal salaries rise" },
      { policy: "High tax rate", effect: "negative", description: "Reduces take-home pay and can depress labor supply" },
    ],
    realWorldExample: "Norway's average salary (~$65,000) is among the world's highest, built on sovereign wealth fund returns, strong unions, and energy wealth. The US has high nominal wages but high inequality — the average masks a much lower median.",
    funFact: "In Japan, the 'shunto' (spring labor offensive) is a coordinated national wage negotiation where major corporations collectively agree to salary increases — a formal system unlike anything in Western economies.",
    leaderboardImpact: "High average salary directly boosts the Public Mood metric. Combined, they create a virtuous cycle: happy workers → political stability → easier policy implementation → better outcomes.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  publicMood: {
    title: "Public Mood", symbol: "MOOD", tagline: "The electorate's verdict on your leadership", unit: "Score (0–100)",
    definition: "Public Mood synthesizes citizen satisfaction across economic conditions: employment security, real wages, price stability, and perceptions of governance quality. It's your political capital — the fuel for implementing difficult but necessary reforms.",
    whyItMatters: "Low public mood signals social instability, protest, and political crisis. In the game (as in real life), it limits your ability to implement bold policies. High public mood gives you the mandate to take risks and endure short-term pain for long-term gain.",
    howCalculated: "Public mood responds to unemployment trends, real wage growth, inflation (people hate rising prices), and overall economic trajectory. Rapid improvements boost it; sudden shocks crash it. Trends matter more than levels.",
    healthRanges: [
      {
        label: "Revolt Risk", color: "#e53e3e", range: "0–25",
        min: 0,
        max: 0
      },
      {
        label: "Discontent", color: "#dd6b20", range: "25–45",
        min: 0,
        max: 0
      },
      {
        label: "Neutral", color: "#ecc94b", range: "45–60",
        min: 0,
        max: 0
      },
      {
        label: "Satisfied", color: "#38a169", range: "60–75",
        min: 0,
        max: 0
      },
      {
        label: "Thriving", color: "#3182ce", range: "75–100",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Low unemployment", effect: "positive", description: "Job security is the single largest driver of citizen happiness" },
      { policy: "Low inflation", effect: "positive", description: "Stable prices preserve purchasing power — people notice grocery bills" },
      { policy: "Rising wages", effect: "positive", description: "Direct improvement in material living standards" },
      { policy: "High debt", effect: "negative", description: "Citizens fear future tax hikes and austerity" },
    ],
    realWorldExample: "French President Chirac's approval collapsed from 60% to 30% in 1995 purely due to a 2% VAT increase. Margaret Thatcher's public mood crashed to 23% during the 1981–82 recession before the Falklands War rescue.",
    funFact: "The 'misery index' (inflation + unemployment) was invented by economist Arthur Okun to predict election outcomes. Presidents who preside over high misery indexes almost always lose re-election.",
    leaderboardImpact: "Public mood below 25 triggers the 'Social Instability Threshold' flag, imposing GDP growth penalties and potentially triggering political event modifiers in subsequent quarters.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
  reserves: {
    title: "Foreign Reserves", symbol: "SWF", tagline: "Your economy's rainy-day fund", unit: "$ Billions",
    definition: "Foreign reserves are assets held by the central bank in foreign currencies, gold, and IMF special drawing rights. They serve as the ultimate financial buffer — enabling the government to defend the currency and absorb external shocks.",
    whyItMatters: "Reserves are the difference between a managed crisis and a catastrophic one. Countries with deep reserves can defend against speculative attacks, import essential goods during disruptions, and avoid IMF bailouts with harsh conditions.",
    howCalculated: "Reserves accumulate through trade surpluses, capital inflows, and deliberate savings. They drain through trade deficits, capital flight, and defending a weakening currency.",
    healthRanges: [
      {
        label: "Critical", color: "#e53e3e", range: "< $20B",
        min: 0,
        max: 0
      },
      {
        label: "Low", color: "#dd6b20", range: "$20B–$60B",
        min: 0,
        max: 0
      },
      {
        label: "Adequate", color: "#ecc94b", range: "$60B–$120B",
        min: 0,
        max: 0
      },
      {
        label: "Strong", color: "#38a169", range: "$120B–$250B",
        min: 0,
        max: 0
      },
      {
        label: "Fortress", color: "#3182ce", range: "> $250B",
        min: 0,
        max: 0
      },
    ],
    policyEffects: [
      { policy: "Trade surplus", effect: "positive", description: "Most sustainable reserves accumulation path" },
      { policy: "Low foreign lending", effect: "positive", description: "Conserves reserves for domestic emergencies" },
      { policy: "Currency defense", effect: "negative", description: "Defending a weakening currency rapidly depletes reserves" },
      { policy: "Fiscal surplus", effect: "positive", description: "Budget surpluses can be saved directly as reserve assets" },
    ],
    realWorldExample: "China holds $3.3 trillion in foreign reserves — the world's largest. Thailand's 1997 reserves crisis sparked the Asian Financial Contagion when it couldn't defend the baht, triggering 7 country collapses in 3 months.",
    funFact: "Norway's Government Pension Fund — $1.7 trillion — was built entirely from North Sea oil revenues saved since the 1990s. Its investment returns now fund 20% of Norway's national budget annually.",
    leaderboardImpact: "Reserves below $20B trigger the 'Critically Low Reserves' flag — severely limiting policy options and imposing interest rate premium costs on all future borrowing. High reserves provide a quarterly stability bonus.",
    valueMin: 0,
    valueMax: 0,
    higherIsBetter: false
  },
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const METRIC_KEYS: MetricKey[] = [
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
const HIGHER_IS_BETTER: MetricKey[] = [
  "gdp",
  "currencyStrength",
  "innovationIndex",
  "avgSalary",
  "publicMood",
  "reserves",
  "tradeBalance",
];

function getHealth(key: MetricKey, value: number): HealthRange {
  const rs = EDU[key].healthRanges;
  return rs.find((r) => value >= r.min && value <= r.max) ?? rs[rs.length - 1];
}

function fmt(key: MetricKey, val: number) {
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
      return {
        v: `${val >= 0 ? "+" : ""}$${val.toFixed(1)}B`,
        u: "Trade Bal.",
      };
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

function rawVal(key: MetricKey, formatted: string): number {
  const n = parseFloat(formatted.replace(/[^0-9.\-]/g, ""));
  if (key === "avgSalary") return n * 1000;
  return isNaN(n) ? 0 : n;
}

function getDelta(key: MetricKey, curr: number, prev?: number) {
  if (prev === undefined) return { label: "—", dir: "flat" as const };
  const diff = curr - prev;
  if (Math.abs(diff) < 0.005) return { label: "—", dir: "flat" as const };
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
  const up = HIGHER_IS_BETTER.includes(key) ? diff > 0 : diff < 0;
  return { label, dir: up ? ("up" as const) : ("down" as const) };
}

/* ─── Spark ────────────────────────────────────────────────────────────────── */

function Spark({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div style={{ height: 28, width: 72 }} />;
  const W = 72,
    H = 28;
  const min = Math.min(...data),
    max = Math.max(...data),
    rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / rng) * (H - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const [lx, ly] = (pts.at(-1) ?? "0,0").split(",").map(Number);
  const id = `spk-${color.replace(/[^a-z0-9]/gi, "")}`;
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
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
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

/* ─── Range position bar (drawer) ─────────────────────────────────────────── */

function RangePositionBar({ edu, value }: { edu: MetricEdu; value: number }) {
  const span = edu.valueMax - edu.valueMin;
  const pct = Math.max(0, Math.min(100, ((value - edu.valueMin) / span) * 100));
  const activeRange = edu.healthRanges.find((r) => value >= r.min && value <= r.max);
  const activeColor = activeRange?.color ?? "#bf3509";

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(242,235,224,0.22)" }}>
          Current position
        </span>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "rgba(242,235,224,0.5)" }}>
          {activeRange?.label ?? "—"}
        </span>
      </div>

      <div style={{ display: "flex", height: 18, gap: 2, marginBottom: 8, borderRadius: 2, overflow: "hidden" }}>
        {edu.healthRanges.map((r, i) => {
          const w = ((r.max - r.min) / span) * 100;
          const isActive = value >= r.min && value <= r.max;
          return (
            <div
              key={i}
              style={{
                flexBasis: `${w}%`,
                flexShrink: 0,
                flexGrow: 0,
                background: isActive ? r.color + "30" : r.color + "12",
                borderTop: `2px solid ${isActive ? r.color : r.color + "44"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "background 0.3s",
              }}
            >
              {isActive && <div style={{ position: "absolute", inset: 0, background: r.color + "14" }} />}
            </div>
          );
        })}
      </div>

      <div style={{ position: "relative", height: 4, background: "rgba(242,235,224,0.06)", borderRadius: 2 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${activeColor}, transparent)`,
            borderRadius: 2,
            transition: "width 0.6s cubic-bezier(.22,.72,0,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${pct}%`,
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#f2ebe0",
            boxShadow: "0 0 8px rgba(255,255,255,0.4)",
            transition: "left 0.6s cubic-bezier(.22,.72,0,1)",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {edu.healthRanges.map((r, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 7,
              color: value >= r.min && value <= r.max ? r.color : "rgba(242,235,224,0.18)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Edu Drawer ───────────────────────────────────────────────────────────── */

const DRAWER_TABS = ["Overview", "Ranges", "Policy", "History"];

function EduDrawer({
  metricKey,
  formattedValue,
  onClose,
}: {
  metricKey: MetricKey | null;
  formattedValue: string;
  onClose: () => void;
}) {
  const [vis, setVis] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (metricKey) {
      setTab(0);
      requestAnimationFrame(() => setVis(true));
      document.body.style.overflow = "hidden";
    } else {
      setVis(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [metricKey]);

  const close = useCallback(() => {
    setVis(false);
    setTimeout(onClose, 320);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [close]);

  if (!metricKey) return null;
  const d = EDU[metricKey];
  const rv = rawVal(metricKey, formattedValue);
  const health = getHealth(metricKey, rv);

  const effColor = (e: PolicyEffect["effect"]) =>
    e === "positive" ? "#22c55e" : e === "negative" ? "#ef4444" : "#94a3b8";
  const effIcon = (e: PolicyEffect["effect"]) =>
    e === "positive" ? "↑" : e === "negative" ? "↓" : "→";

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    background: vis ? "rgba(5,4,2,0.82)" : "transparent",
    backdropFilter: vis ? "blur(10px)" : "none",
    transition: "background 0.32s, backdrop-filter 0.32s",
    cursor: "pointer",
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    width: "min(620px, 100vw)",
    background: "#06050300",
    backdropFilter: "blur(0px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transform: vis ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.32s cubic-bezier(.22,.72,0,1)",
    boxShadow: vis ? `-40px 0 120px rgba(0,0,0,0.7)` : "none",
    borderLeft: `1px solid ${health.color}22`,
  } as React.CSSProperties;



  return (
    <>
      <div style={overlayStyle} onClick={close} aria-hidden />
      <aside
        role="dialog"
        aria-modal
        aria-label={`Learn: ${d.title}`}
        style={{ ...panelStyle, background: "#090704" }}
      >
        {/* Health accent bar */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${health.color}, ${health.color}33)`,
            flexShrink: 0,
          }}
        />

        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${health.color}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            position: "relative",
            padding: "24px 32px 0",
            flexShrink: 0,
          }}
        >
          {/* Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                background: health.color + "18",
                border: `1px solid ${health.color}35`,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: health.color,
                  boxShadow: `0 0 6px ${health.color}`,
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono'",
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: health.color,
                }}
              >
                {health.label}
              </span>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono'",
                fontSize: 8,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(242,235,224,0.2)",
              }}
            >
              {d.symbol} · {d.unit}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Fraunces'",
              fontSize: 30,
              fontWeight: 700,
              color: "#f2ebe0",
              margin: "0 0 4px",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            {d.title}
          </h2>
          <p
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 11,
              fontStyle: "italic",
              color: "rgba(242,235,224,0.28)",
              margin: "0 0 16px",
              letterSpacing: "0.03em",
            }}
          >
            — {d.tagline}
          </p>

          {/* Big value */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: "'Fraunces'",
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1,
                color: health.color,
                letterSpacing: "-0.02em",
              }}
            >
              {formattedValue}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono'",
                fontSize: 10,
                color: "rgba(242,235,224,0.28)",
                letterSpacing: "0.04em",
              }}
            >
              {d.unit}
            </span>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={close}
            style={{
              position: "absolute",
              right: 24,
              top: 24,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(242,235,224,0.1)",
              background: "rgba(242,235,224,0.04)",
              color: "rgba(242,235,224,0.3)",
              fontFamily: "'JetBrains Mono'",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background =
                "rgba(242,235,224,0.1)";
              (e.target as HTMLElement).style.color = "#f2ebe0";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background =
                "rgba(242,235,224,0.04)";
              (e.target as HTMLElement).style.color = "rgba(242,235,224,0.3)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Gradient divider */}
        <div
          style={{
            height: 1,
            margin: "0 32px",
            background: `linear-gradient(90deg, ${health.color}50, transparent)`,
            flexShrink: 0,
          }}
        />

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(242,235,224,0.07)",
            padding: "0 32px",
            flexShrink: 0,
            overflowX: "auto",
          }}
        >
          {DRAWER_TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(i)}
              style={{
                fontFamily: "'JetBrains Mono'",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                padding: "12px 16px",
                cursor: "pointer",
                border: "none",
                background: "none",
                borderBottom: `2px solid ${tab === i ? health.color : "transparent"}`,
                color: tab === i ? "#f2ebe0" : "rgba(242,235,224,0.25)",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 64px" }}>
          <style>{`@keyframes dTabIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>

          {tab === 0 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerSection label="Definition">{d.definition}</DrawerSection>
              <DrawerSection label="Why It Matters">
                {d.whyItMatters}
              </DrawerSection>
              <div>
                <DrawerLabel>How It's Calculated</DrawerLabel>
                <div
                  style={{
                    borderLeft: `3px solid ${health.color}70`,
                    background: `linear-gradient(90deg, ${health.color}08, transparent)`,
                    padding: "14px 16px",
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'JetBrains Mono'",
                      fontSize: 11,
                      lineHeight: 1.85,
                      color: "rgba(242,235,224,0.6)",
                    }}
                  >
                    {d.howCalculated}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerLabel>Position in Range</DrawerLabel>
              <RangePositionBar edu={d} value={rv} />

              <DrawerLabel>Health Ranges</DrawerLabel>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 20,
                }}
              >
                {d.healthRanges.map((r) => {
                  const active = r.label === health.label;
                  return (
                    <div
                      key={r.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        background: active
                          ? r.color + "18"
                          : "rgba(242,235,224,0.025)",
                        border: `1px solid ${active ? r.color + "50" : "rgba(242,235,224,0.06)"}`,
                        boxShadow: active ? `0 0 16px ${r.color}12` : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: r.color,
                          flexShrink: 0,
                          boxShadow: active ? `0 0 8px ${r.color}` : "none",
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontFamily: "'JetBrains Mono'",
                          fontSize: 11,
                          fontWeight: 600,
                          color: active ? r.color : "#f2ebe0",
                        }}
                      >
                        {r.label}
                      </span>
                      {active && (
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono'",
                            fontSize: 8,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: r.color,
                          }}
                        >
                          ← you
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono'",
                          fontSize: 10,
                          color: "rgba(242,235,224,0.28)",
                        }}
                      >
                        {r.range}
                      </span>
                    </div>
                  );
                })}
              </div>

              <DrawerLabel>Leaderboard Impact</DrawerLabel>
              <div
                style={{
                  border: "1px solid rgba(191,53,9,0.2)",
                  background:
                    "linear-gradient(135deg,rgba(191,53,9,0.1),rgba(191,53,9,0.03))",
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'JetBrains Mono'",
                    fontSize: 11,
                    lineHeight: 1.8,
                    color: "rgba(242,235,224,0.6)",
                  }}
                >
                  {d.leaderboardImpact}
                </p>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerLabel>Policy Effects</DrawerLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.policyEffects.map((p) => (
                  <div
                    key={p.policy}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr",
                      gap: 10,
                      padding: "12px",
                      background: "rgba(242,235,224,0.025)",
                      border: "1px solid rgba(242,235,224,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: effColor(p.effect) + "18",
                        borderRadius: 2,
                        color: effColor(p.effect),
                        fontFamily: "'JetBrains Mono'",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {effIcon(p.effect)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono'",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#f2ebe0",
                          marginBottom: 4,
                        }}
                      >
                        {p.policy}
                      </div>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono'",
                          fontSize: 10,
                          lineHeight: 1.65,
                          color: "rgba(242,235,224,0.4)",
                        }}
                      >
                        {p.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 3 && (
            <div style={{ animation: "dTabIn 0.22s ease both" }}>
              <DrawerSection label="Real World Example">
                <span
                  style={{
                    borderLeft: `3px solid ${health.color}70`,
                    paddingLeft: 12,
                    display: "block",
                  }}
                >
                  {d.realWorldExample}
                </span>
              </DrawerSection>

              <DrawerLabel>Did You Know?</DrawerLabel>
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(242,235,224,0.07)",
                  background: "rgba(242,235,224,0.025)",
                  padding: "20px 20px 18px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -8,
                    left: 4,
                    fontFamily: "'Fraunces'",
                    fontSize: 80,
                    lineHeight: 1,
                    color: "rgba(242,235,224,0.04)",
                    pointerEvents: "none",
                  }}
                >
                  "
                </div>
                <p
                  style={{
                    position: "relative",
                    margin: 0,
                    fontFamily: "'JetBrains Mono'",
                    fontSize: 11,
                    lineHeight: 1.88,
                    color: "rgba(242,235,224,0.55)",
                  }}
                >
                  {d.funFact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(242,235,224,0.06)",
            padding: "10px 32px",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 8,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(242,235,224,0.16)",
            }}
          >
            Esc or click outside to dismiss
          </span>
        </div>
      </aside>
    </>
  );
}

function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono'",
          fontSize: 8,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "rgba(242,235,224,0.22)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div
        style={{ flex: 1, height: 1, background: "rgba(242,235,224,0.06)" }}
      />
    </div>
  );
}

function DrawerSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <DrawerLabel>{label}</DrawerLabel>
      <p
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono'",
          fontSize: 12,
          lineHeight: 1.88,
          color: "rgba(242,235,224,0.55)",
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ─── Metric Card ──────────────────────────────────────────────────────────── */

function MetricCard({
  metricKey,
  metrics,
  previousMetrics,
  history,
  index,
  onOpen,
}: {
  metricKey: MetricKey;
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history: QuarterData[];
  index: number;
  onOpen: (k: MetricKey, v: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const { v, u } = fmt(metricKey, metrics[metricKey]);
  const d = getDelta(
    metricKey,
    metrics[metricKey],
    previousMetrics?.[metricKey],
  );
  const health = getHealth(metricKey, metrics[metricKey]);
  const spark = history.map((h) => h.metrics[metricKey]);

  const dc =
    d.dir === "up"
      ? "#22c55e"
      : d.dir === "down"
        ? "#ef4444"
        : "rgba(28,20,9,0.3)";
  const da = d.dir === "up" ? "↑" : d.dir === "down" ? "↓" : "→";

  return (
    <button
      type="button"
      onClick={() => onOpen(metricKey, v)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={`${u}: ${v}. Status: ${health.label}. Click to learn more.`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "14px 14px 12px",
        textAlign: "left",
        cursor: "pointer",
        border: `1px solid ${hov ? health.color + "60" : health.color + "20"}`,
        background: hov ? health.color + "10" : health.color + "06",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov
          ? `0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px ${health.color}20, inset 0 1px 0 ${health.color}18`
          : "none",
        transition: "all 0.18s cubic-bezier(.22,.72,0,1)",
        animation: `mpIn 0.42s ease both`,
        animationDelay: `${index * 40}ms`,
        overflow: "hidden",
        outline: "none",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, ${health.color}, ${health.color}44)`,
          opacity: hov ? 1 : 0.55,
          transition: "opacity 0.18s",
        }}
      />

      {/* Inner ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 85% 15%, ${health.color}14 0%, transparent 65%)`,
          opacity: hov ? 1 : 0,
          transition: "opacity 0.18s",
          pointerEvents: "none",
        }}
      />

      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
          paddingLeft: 6,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 8,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(28,20,9,0.38)",
          }}
        >
          {u}
        </span>
        {/* Delta pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "2px 6px",
            background: dc + "18",
            borderRadius: 2,
            fontFamily: "'JetBrains Mono'",
            fontSize: 9,
            fontWeight: 600,
            color: dc,
          }}
        >
          <span>{da}</span>
          <span>{d.label}</span>
        </div>
      </div>

      {/* Value */}
      <div style={{ paddingLeft: 6, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "'Fraunces'",
            fontSize: 30,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: hov ? health.color : "#1c1409",
            transition: "color 0.18s",
          }}
        >
          {v}
        </span>
      </div>

      {/* Symbol + health status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 6,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 8,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(28,20,9,0.28)",
          }}
        >
          {EDU[metricKey].symbol}
        </span>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 6px",
            background: health.color + "14",
            border: `1px solid ${health.color}28`,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: health.color,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 7,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: health.color,
            }}
          >
            {health.label}
          </span>
        </div>
      </div>

      {/* Spark */}
      <div style={{ paddingLeft: 6, marginBottom: 8 }}>
        <Spark data={spark} color={health.color} />
      </div>

      {/* Hover learn cue */}
      <div
        style={{
          paddingLeft: 6,
          display: "flex",
          alignItems: "center",
          gap: 5,
          opacity: hov ? 1 : 0,
          transform: hov ? "none" : "translateY(4px)",
          transition: "all 0.18s",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 8,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: health.color,
          }}
        >
          Tap to learn →
        </span>
      </div>

      {/* Bottom sweep line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: health.color,
          transform: hov ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.28s ease",
        }}
      />
    </button>
  );
}

/* ─── Trend Row ────────────────────────────────────────────────────────────── */

function TrendRow({
  metricKey,
  metrics,
  previousMetrics,
  history,
  onOpen,
}: {
  metricKey: MetricKey;
  metrics: EconomicMetrics;
  previousMetrics?: EconomicMetrics;
  history: QuarterData[];
  onOpen: (k: MetricKey, v: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const { v } = fmt(metricKey, metrics[metricKey]);
  const d = getDelta(
    metricKey,
    metrics[metricKey],
    previousMetrics?.[metricKey],
  );
  const h = getHealth(metricKey, metrics[metricKey]);
  const spark = history.map((q) => q.metrics[metricKey]);

  return (
    <button
      type="button"
      onClick={() => onOpen(metricKey, v)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr auto",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "8px 4px",
        background: hov ? h.color + "08" : "transparent",
        borderBottom: "1px solid rgba(28,20,9,0.06)",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        transition: "background 0.15s",
      }}
      className="last:border-b-0"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: h.color,
            flexShrink: 0,
            boxShadow: hov ? `0 0 6px ${h.color}` : "none",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(28,20,9,0.45)",
          }}
        >
          {EDU[metricKey].symbol}
        </span>
      </div>
      <Spark data={spark} color={h.color} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 9,
            fontWeight: 600,
            color:
              d.dir === "up"
                ? "#16a34a"
                : d.dir === "down"
                  ? "#dc2626"
                  : "rgba(28,20,9,0.3)",
          }}
        >
          {d.dir === "up" ? "↑" : d.dir === "down" ? "↓" : "→"}
          {d.label}
        </span>
        <span
          style={{
            fontFamily: "'Fraunces'",
            fontSize: 16,
            fontWeight: 700,
            color: "#1c1409",
            letterSpacing: "-0.01em",
          }}
        >
          {v}
        </span>
      </div>
    </button>
  );
}

/* ─── Progress bar ─────────────────────────────────────────────────────────── */

function ProgressBar({
  quarter,
  total,
  progress,
}: {
  quarter: number;
  total: number;
  progress: number;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 8,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(28,20,9,0.32)",
          }}
        >
          Mandate Progress
        </span>
        <span
          style={{
            fontFamily: "'Fraunces'",
            fontSize: 15,
            color: "#1c1409",
            letterSpacing: "0.01em",
          }}
        >
          Q{quarter}{" "}
          <span
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 10,
              color: "rgba(28,20,9,0.3)",
            }}
          >
            / Q{total}
          </span>
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 3,
          background: "rgba(28,20,9,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${progress}%`,
            background: "#bf3509",
            transition: "width 0.7s cubic-bezier(.22,.72,0,1)",
          }}
        />
        {Array.from({ length: total - 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 1,
              background: "rgba(28,20,9,0.1)",
              left: `${((i + 1) / total) * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ──────────────────────────────────────────────────────────── */

export function MetricsPanel({
  metrics,
  previousMetrics,
  history,
  quarter,
  progress,
  isOver,
  onNextQuarter,
}: MetricsPanelProps) {
  const [activeKey, setActiveKey] = useState<MetricKey | null>(null);
  const [activeVal, setActiveVal] = useState("");

  const openEdu = useCallback((k: MetricKey, v: string) => {
    setActiveVal(v);
    setActiveKey(k);
  }, []);
  const closeEdu = useCallback(() => setActiveKey(null), []);

  const TREND_KEYS: MetricKey[] = [
    "gdp",
    "inflation",
    "unemployment",
    "publicMood",
    "reserves",
  ];

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600&display=swap');
  @keyframes mpIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
`}</style>

      <div style={{ width: "100%" }}>
        <ProgressBar quarter={quarter} total={8} progress={progress} />

        {/* Hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            border: "1px solid rgba(191,53,9,0.12)",
            background: "rgba(191,53,9,0.04)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#bf3509",
              opacity: 0.6,
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(28,20,9,0.4)",
            }}
          >
            Each metric is clickable — tap any card to learn what it means
          </span>
        </div>

        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono'",
              fontSize: 8,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(28,20,9,0.28)",
              whiteSpace: "nowrap",
            }}
          >
            Live Indicators
          </span>
          <div
            style={{ flex: 1, height: 1, background: "rgba(28,20,9,0.08)" }}
          />
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(152px,1fr))",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {METRIC_KEYS.map((k, i) => (
            <MetricCard
              key={k}
              metricKey={k}
              metrics={metrics}
              previousMetrics={previousMetrics}
              history={history}
              index={i}
              onOpen={openEdu}
            />
          ))}
        </div>

        {/* Trends */}
        {history.length > 1 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono'",
                  fontSize: 8,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: "rgba(28,20,9,0.28)",
                  whiteSpace: "nowrap",
                }}
              >
                Quarter Trends
              </span>
              <div
                style={{ flex: 1, height: 1, background: "rgba(28,20,9,0.08)" }}
              />
            </div>
            <div
              style={{
                border: "1px solid rgba(28,20,9,0.08)",
                background: "rgba(28,20,9,0.02)",
                padding: "8px 16px",
                marginBottom: 20,
              }}
            >
              {TREND_KEYS.map((k) => (
                <TrendRow
                  key={k}
                  metricKey={k}
                  metrics={metrics}
                  previousMetrics={previousMetrics}
                  history={history}
                  onOpen={openEdu}
                />
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        {isOver ? (
          <div
            style={{
              border: "1px solid rgba(191,53,9,0.2)",
              background: "rgba(191,53,9,0.06)",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'JetBrains Mono'",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(191,53,9,0.8)",
              }}
            >
              ◈ Mandate complete — Q8 reached
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onNextQuarter();
            }}
            disabled={isOver}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "#bf3509",
              color: "#f2ebe0",
              border: "none",
              padding: "16px 24px",
              fontFamily: "'JetBrains Mono'",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#d94010";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#bf3509";
            }}
          >
            <span>Advance to Q{quarter + 1}</span>
            <span style={{ opacity: 0.5 }}>→</span>
          </button>
        )}
      </div>

      <EduDrawer
        metricKey={activeKey}
        formattedValue={activeVal}
        onClose={closeEdu}
      />
    </>
  );
}

export default MetricsPanel;
