import { calculateNextQuarter, calculateWisdomScore, COUNTRY_TEMPLATES, EconomicMetrics, PolicyDecisions, QuarterData } from './simulation-engine';

const defaultPolicy: PolicyDecisions = {
  taxRate: 28, interestRate: 3, spending: 30, moneyPrinting: false,
  rdInvestment: 3, tariffLevel: 10, foreignLending: 2, investmentRisk: 50
};

function fmt(n: number, dec = 1) { return n.toFixed(dec); }
function arrow(a: number, b: number) { return b > a ? '↑' : b < a ? '↓' : '→'; }

function runScenario(name: string, startMetrics: EconomicMetrics, policies: PolicyDecisions[], label: string) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${name.toUpperCase()} — ${label}`);
  console.log('═'.repeat(70));

  const hdr = 'Q    GDP    INF    UNEMP  MOOD   DEBT   FX     RESERVES  TRADE';
  console.log(hdr);
  console.log('─'.repeat(70));

  let metrics = { ...startMetrics };
  let prev = { ...defaultPolicy };
  const history: QuarterData[] = [{ quarter: 0, metrics, policy: prev }];

  const row = (q: number, m: EconomicMetrics) =>
    `Q${q}   ${fmt(m.gdp).padEnd(6)} ${fmt(m.inflation).padEnd(6)} ${fmt(m.unemployment).padEnd(6)} ${String(m.publicMood).padEnd(6)} ${fmt(m.debtToGDP).padEnd(6)} ${fmt(m.currencyStrength).padEnd(6)} ${fmt(m.reserves, 0).padEnd(9)} ${fmt(m.tradeBalance)}`;

  console.log(row(0, metrics) + '  [START]');

  for (let i = 0; i < policies.length; i++) {
    const next = calculateNextQuarter(metrics, prev, policies[i]);
    history.push({ quarter: i + 1, metrics: next, policy: policies[i] });
    const q = i + 1;
    const changes = [
      `GDP${arrow(metrics.gdp, next.gdp)}`,
      `INF${arrow(metrics.inflation, next.inflation)}`,
      `MOOD${arrow(metrics.publicMood, next.publicMood)}`
    ].join(' ');
    console.log(row(q, next) + `  [${changes}]`);
    prev = policies[i];
    metrics = next;
  }

  const score = calculateWisdomScore(history);
  console.log(`\n  Wisdom Score: ${score}/1000`);
  return { finalMetrics: metrics, score };
}

// ── TEST 1: Nordic Union — Steady hands (should stay stable) ──────────────
const nordic = COUNTRY_TEMPLATES.find(c => c.name === 'Nordic Union')!.metrics;
runScenario('Nordic Union', nordic,
  Array(6).fill({ ...defaultPolicy, taxRate: 35, interestRate: 4, spending: 35, rdInvestment: 6 }),
  'Steady high-tax, high-spend policy for 6 quarters'
);

// ── TEST 2: Eastern Med — Rate hike to fight inflation ───────────────────
const eastMed = COUNTRY_TEMPLATES.find(c => c.name === 'Eastern Mediterranean')!.metrics;
runScenario('Eastern Mediterranean', eastMed,
  Array(6).fill({ ...defaultPolicy, interestRate: 8, taxRate: 25, spending: 25, rdInvestment: 2 }),
  'Aggressive rate hike (8%) to fight 18.4% inflation'
);

// ── TEST 3: Eastern Med — Rate hike + print money (should be catastrophic) ─
runScenario('Eastern Mediterranean', eastMed,
  Array(4).fill({ ...defaultPolicy, interestRate: 2, moneyPrinting: true, spending: 50, taxRate: 10 }),
  'BAD POLICY: Low rates + money printing + high spend + low tax'
);

// ── TEST 4: Sub-Saharan Frontier — Do nothing / status quo ──────────────
const subsaharan = COUNTRY_TEMPLATES.find(c => c.name === 'Sub-Saharan Frontier')!.metrics;
runScenario('Sub-Saharan Frontier', subsaharan,
  Array(6).fill({ ...defaultPolicy }),
  'Status quo policy (baseline drift test)'
);

// ── TEST 5: Gulf Sovereign — Reckless spending + 0% tax ─────────────────
const gulf = COUNTRY_TEMPLATES.find(c => c.name === 'Gulf Sovereign')!.metrics;
runScenario('Gulf Sovereign', gulf,
  Array(6).fill({ ...defaultPolicy, taxRate: 0, spending: 70, moneyPrinting: false, rdInvestment: 2 }),
  'Zero tax + max spending (fiscal stress test)'
);

// ── TEST 6: Wartime Rebuild — Can any policy help? ──────────────────────
const wartime = COUNTRY_TEMPLATES.find(c => c.name === 'Wartime Rebuild')!.metrics;
runScenario('Wartime Rebuild', wartime,
  Array(8).fill({ ...defaultPolicy, interestRate: 12, taxRate: 30, spending: 40, rdInvestment: 1, foreignLending: 5 }),
  'Emergency stabilisation: high rates, moderate fiscal'
);

// ── TEST 7: Nordic Union — Race to bottom (cut everything) ──────────────
runScenario('Nordic Union', nordic,
  Array(6).fill({ ...defaultPolicy, taxRate: 3, interestRate: 0, spending: 5, rdInvestment: 0 }),
  'RACE TO BOTTOM: slash taxes, rates, spending to near zero'
);

// ── TEST 8: Validation — does innovation actually help GDP over time? ────
const pacific = COUNTRY_TEMPLATES.find(c => c.name === 'Pacific Archipelago')!.metrics;
const lowRD = runScenario('Pacific Archipelago', pacific,
  Array(8).fill({ ...defaultPolicy, rdInvestment: 0 }),
  'ZERO R&D for 8 quarters'
);
const highRD = runScenario('Pacific Archipelago', pacific,
  Array(8).fill({ ...defaultPolicy, rdInvestment: 15 }),
  'MAX R&D (15%) for 8 quarters'
);
console.log(`\n  R&D Impact: Zero RD final GDP = ${fmt(lowRD.finalMetrics.gdp)}, Innovation = ${fmt(lowRD.finalMetrics.innovationIndex)}`);
console.log(`  R&D Impact: High RD final GDP = ${fmt(highRD.finalMetrics.gdp)}, Innovation = ${fmt(highRD.finalMetrics.innovationIndex)}`);