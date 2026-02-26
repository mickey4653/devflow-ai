import { ClassifiedTask, SimulationResult, OwnershipClassification } from '@/types';

/**
 * Time multipliers based on ownership classification
 * - AI_OWNED: AI completes in 35% of human time
 * - HUMAN_SUPERVISES_AI: AI + review takes 65% of human time
 * - HUMAN_OWNED: Human completes at normal speed
 */
const TIME_MULTIPLIERS: Record<OwnershipClassification, number> = {
  AI_OWNED: 0.35,
  HUMAN_SUPERVISES_AI: 0.65,
  HUMAN_OWNED: 1.0,
};

/**
 * Risk multipliers based on ownership classification
 * - AI_OWNED: AI increases risk by 40%
 * - HUMAN_SUPERVISES_AI: Supervision reduces risk by 15%
 * - HUMAN_OWNED: Human maintains base risk
 */
const RISK_MULTIPLIERS: Record<OwnershipClassification, number> = {
  AI_OWNED: 1.4,
  HUMAN_SUPERVISES_AI: 0.85,
  HUMAN_OWNED: 1.0,
};

/**
 * Calculate baseline total development time assuming all tasks are HUMAN_OWNED
 * @param tasks - Array of classified tasks
 * @returns Total estimated hours for baseline (all human) execution
 */
export function calculateBaselineTime(tasks: ClassifiedTask[]): number {
  return tasks.reduce((total, task) => total + task.estimatedHours, 0);
}

/**
 * Calculate AI-native total development time based on ownership classification
 * @param tasks - Array of classified tasks
 * @returns Total estimated hours with AI assistance applied
 */
export function calculateAiNativeTime(tasks: ClassifiedTask[]): number {
  return tasks.reduce((total, task) => {
    const multiplier = TIME_MULTIPLIERS[task.ownership];
    return total + (task.estimatedHours * multiplier);
  }, 0);
}

/**
 * Calculate throughput gain percentage
 * @param baselineTime - Baseline total time (all human)
 * @param aiNativeTime - AI-native total time
 * @returns Throughput gain as a percentage
 */
export function calculateThroughputGain(baselineTime: number, aiNativeTime: number): number {
  if (baselineTime === 0) return 0;
  return ((baselineTime - aiNativeTime) / baselineTime) * 100;
}

/**
 * Calculate aggregate risk delta between baseline and AI-native execution
 * @param tasks - Array of classified tasks
 * @returns Risk delta (positive means AI-native has higher risk)
 */
export function calculateRiskDelta(tasks: ClassifiedTask[]): number {
  // Baseline risk: assume human execution has 10% of inherent production risk
  const baselineRisk = tasks.reduce((total, task) => {
    return total + (task.attributes.production_risk * 0.1);
  }, 0);

  // AI-native risk: ownership affects risk realization
  const aiNativeRisk = tasks.reduce((total, task) => {
    const riskMultiplier = RISK_MULTIPLIERS[task.ownership];
    return total + (task.attributes.production_risk * 0.1 * riskMultiplier);
  }, 0);

  return aiNativeRisk - baselineRisk;
}

/**
 * Generate deployment recommendation based on throughput gain and risk delta
 * @param throughputGainPercent - Throughput gain percentage
 * @param aggregateRiskDelta - Aggregate risk delta
 * @returns Deployment recommendation string
 */
export function generateDeploymentRecommendation(
  throughputGainPercent: number,
  aggregateRiskDelta: number
): string {
  if (throughputGainPercent > 40 && aggregateRiskDelta < 0.2) {
    return 'RECOMMENDED: High productivity gain with acceptable risk';
  } else if (throughputGainPercent > 20 && aggregateRiskDelta < 0.3) {
    return 'CONDITIONAL: Moderate gains, monitor risk closely';
  } else if (aggregateRiskDelta > 0.5) {
    return 'NOT RECOMMENDED: Risk increase outweighs productivity gains';
  } else {
    return 'MARGINAL: Limited productivity benefit';
  }
}

/**
 * Simulate productivity outcomes for classified tasks
 * Combines all calculation functions into a complete simulation result
 * @param classifiedTasks - Array of tasks with ownership classifications
 * @returns Complete simulation result with metrics and recommendation
 */
export function simulateOutcomes(classifiedTasks: ClassifiedTask[]): SimulationResult {
  const baselineTotalTime = calculateBaselineTime(classifiedTasks);
  const aiNativeTotalTime = calculateAiNativeTime(classifiedTasks);
  const throughputGainPercent = calculateThroughputGain(baselineTotalTime, aiNativeTotalTime);
  const aggregateRiskDelta = calculateRiskDelta(classifiedTasks);
  const deploymentRecommendation = generateDeploymentRecommendation(
    throughputGainPercent,
    aggregateRiskDelta
  );

  return {
    baselineTotalTime,
    aiNativeTotalTime,
    throughputGainPercent,
    aggregateRiskDelta,
    deploymentRecommendation,
  };
}
