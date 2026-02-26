import { simulateOutcomes } from '../lib/simulation';
import { ClassifiedTask } from '../types';

console.log('=== Testing Simulation Module ===\n');

const testTasks: ClassifiedTask[] = [
  {
    id: '1',
    description: 'Simple UI component',
    estimatedHours: 2,
    ownership: 'AI_OWNED',
    explanation: 'Low risk task suitable for AI',
    attributes: {
      production_risk: 0.1,
      compliance_impact: 0.1,
      reversibility: 0.9,
      ambiguity: 0.1,
      cognitive_load: 0.2,
    },
  },
  {
    id: '2',
    description: 'Payment processing',
    estimatedHours: 8,
    ownership: 'HUMAN_OWNED',
    explanation: 'High risk task requiring human ownership',
    attributes: {
      production_risk: 0.9,
      compliance_impact: 0.9,
      reversibility: 0.2,
      ambiguity: 0.3,
      cognitive_load: 0.7,
    },
  },
  {
    id: '3',
    description: 'API endpoint',
    estimatedHours: 4,
    ownership: 'HUMAN_SUPERVISES_AI',
    explanation: 'Moderate risk task requiring supervision',
    attributes: {
      production_risk: 0.4,
      compliance_impact: 0.3,
      reversibility: 0.6,
      ambiguity: 0.4,
      cognitive_load: 0.4,
    },
  },
];

console.log('Test Tasks:');
testTasks.forEach(task => {
  console.log(`- ${task.description} (${task.estimatedHours}h): ${task.ownership}`);
});
console.log();

const result = simulateOutcomes(testTasks);

console.log('=== Simulation Results ===\n');

console.log('Baseline Time:', result.baselineTotalTime, 'hours');
console.log('Expected: 14 hours (2 + 8 + 4)');
console.log('Result:', result.baselineTotalTime === 14 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('AI-Native Time:', result.aiNativeTotalTime.toFixed(2), 'hours');
console.log('Expected: ~9.30 hours (2*0.35 + 8*1.0 + 4*0.65)');
const expectedAiTime = 2 * 0.35 + 8 * 1.0 + 4 * 0.65;
console.log('Calculation: 2*0.35 + 8*1.0 + 4*0.65 =', expectedAiTime.toFixed(2));
console.log('Result:', Math.abs(result.aiNativeTotalTime - expectedAiTime) < 0.01 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('Throughput Gain:', result.throughputGainPercent.toFixed(2), '%');
const expectedGain = ((14 - expectedAiTime) / 14) * 100;
console.log('Expected:', expectedGain.toFixed(2), '%');
console.log('Result:', Math.abs(result.throughputGainPercent - expectedGain) < 0.1 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('Risk Delta:', result.aggregateRiskDelta.toFixed(3));
console.log('Expected: Small value (can be positive or negative depending on supervision)');
console.log('Note: Negative means AI reduces risk, positive means AI increases risk');
console.log('Result:', Math.abs(result.aggregateRiskDelta) < 0.1 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('Deployment Recommendation:', result.deploymentRecommendation);
console.log('Expected: One of [RECOMMENDED, CONDITIONAL, NOT RECOMMENDED, MARGINAL]');
const validRecommendations = ['RECOMMENDED', 'CONDITIONAL', 'NOT RECOMMENDED', 'MARGINAL'];
const isValid = validRecommendations.some(rec => result.deploymentRecommendation.includes(rec));
console.log('Result:', isValid ? '✓ PASS' : '✗ FAIL');
console.log();

// Test with all AI_OWNED tasks
console.log('=== Test: All AI_OWNED Tasks ===\n');

const allAiTasks: ClassifiedTask[] = [
  {
    id: '1',
    description: 'Task 1',
    estimatedHours: 3,
    ownership: 'AI_OWNED',
    explanation: 'Low risk',
    attributes: {
      production_risk: 0.1,
      compliance_impact: 0.1,
      reversibility: 0.9,
      ambiguity: 0.1,
      cognitive_load: 0.2,
    },
  },
  {
    id: '2',
    description: 'Task 2',
    estimatedHours: 5,
    ownership: 'AI_OWNED',
    explanation: 'Low risk',
    attributes: {
      production_risk: 0.1,
      compliance_impact: 0.1,
      reversibility: 0.9,
      ambiguity: 0.1,
      cognitive_load: 0.2,
    },
  },
];

const allAiResult = simulateOutcomes(allAiTasks);
console.log('Baseline Time:', allAiResult.baselineTotalTime, 'hours');
console.log('AI-Native Time:', allAiResult.aiNativeTotalTime.toFixed(2), 'hours');
console.log('Throughput Gain:', allAiResult.throughputGainPercent.toFixed(2), '%');
console.log('Expected Gain: 65% (since AI_OWNED uses 0.35 multiplier)');
console.log('Result:', Math.abs(allAiResult.throughputGainPercent - 65) < 1 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('=== Simulation Tests Complete ===');
