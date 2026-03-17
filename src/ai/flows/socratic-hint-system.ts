'use server';
/**
 * @fileOverview A mock Socratic hint system for economic policy decisions.
 * Replaces the Genkit AI flow for faster testing and development.
 */

export type SocraticHintInput = {
  inflation: number;
  unemployment: number;
  gdp: number;
  publicMood: number;
  quarter: number;
  recentDecision: {
    policyType: string;
    oldValue: number;
    newValue: number;
    impactDescription: string;
  };
};

export type SocraticHintOutput = {
  hint: string;
};

export async function generateSocraticHint(input: SocraticHintInput): Promise<SocraticHintOutput> {
  // Artificial delay to simulate thinking
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (input.inflation > 6) {
    return { hint: "With inflation this high, the currency is losing value quickly. What lever could you pull to reduce the amount of money chasing too few goods?" };
  }
  
  if (input.unemployment > 8) {
    return { hint: "High unemployment suggests businesses aren't hiring. Would lower taxes or higher spending give them the confidence to expand?" };
  }

  if (input.gdp < 0) {
    return { hint: "The economy is shrinking. Consider how interest rates affect borrowing costs for businesses looking to invest in new projects." };
  }

  if (input.publicMood < 40) {
    return { hint: "The citizens are unhappy. Taxes might be too high, or they feel the economy isn't working for them. How can you boost mood without blowing the budget?" };
  }

  return { hint: "The economy is currently in a balanced state. Reflect on how your next move might disrupt this equilibrium. Is 'steady as she goes' a valid strategy?" };
}
