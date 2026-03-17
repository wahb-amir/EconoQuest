'use server';
/**
 * @fileOverview A mock generator for dynamic economic scenarios for the EconoQuest game.
 * Replaces the Genkit AI flow for faster testing and development.
 */

export type DynamicScenarioOutput = {
  initialInflation: number;
  initialUnemployment: number;
  initialGDP: number;
  contextualDescription: string;
};

export async function generateDynamicScenario(): Promise<DynamicScenarioOutput> {
  // Mock data to simulate different starting conditions
  const scenarios = [
    {
      initialInflation: 2.5,
      initialUnemployment: 5.2,
      initialGDP: 3.1,
      contextualDescription: "The nation is stable but growth is slowing. Tech stocks are volatile, and consumer spending is cautious. How will you steer the economy through the next year?",
    },
    {
      initialInflation: 8.2,
      initialUnemployment: 3.8,
      initialGDP: 5.5,
      contextualDescription: "Inflation is surging due to energy costs! The labor market is tight, but people are struggling with the cost of living. Can you cool the economy without causing a recession?",
    },
    {
      initialInflation: 0.8,
      initialUnemployment: 9.1,
      initialGDP: -1.2,
      contextualDescription: "A global downturn has hit exports hard. Unemployment is rising and deflation is a real threat. It's time for aggressive fiscal and monetary intervention.",
    }
  ];
  
  // Artificial delay to simulate "consulting models"
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}
