import { calculateOwnershipDistribution } from '../lib/analysis';
import { ClassifiedTask } from '../types';

console.log('=== Testing Ownership Distribution ===\n');

const testTasks: ClassifiedTask[] = [
  // 3 AI_OWNED tasks
  ...Array(3).fill(null).map((_, i) => ({
    id: `ai-${i}`,
    description: `AI task ${i + 1}`,
    estimatedHours: 2,
    ownership: 'AI_OWNED' as const,
    explanation: 'Low risk',
    attributes: {
      production_risk: 0.1,
      compliance_impact: 0.1,
      reversibility: 0.9,
      ambiguity: 0.1,
      cognitive_load: 0.2,
    },
  })),
  // 2 HUMAN_SUPERVISES_AI tasks
  ...Array(2).fill(null).map((_, i) => ({
    id: `supervised-${i}`,
    description: `Supervised task ${i + 1}`,
    estimatedHours: 4,
    ownership: 'HUMAN_SUPERVISES_AI' as const,
    explanation: 'Moderate risk',
    attributes: {
      production_risk: 0.4,
      compliance_impact: 0.3,
      reversibility: 0.6,
      ambiguity: 0.4,
      cognitive_load: 0.4,
    },
  })),
  // 1 HUMAN_OWNED task
  {
    id: 'human-1',
    description: 'Human task 1',
    estimatedHours: 8,
    ownership: 'HUMAN_OWNED' as const,
    explanation: 'High risk',
    attributes: {
      production_risk: 0.9,
      compliance_impact: 0.9,
      reversibility: 0.2,
      ambiguity: 0.3,
      cognitive_load: 0.7,
    },
  },
];

console.log('Test Tasks (6 total):');
console.log('- 3 AI_OWNED tasks');
console.log('- 2 HUMAN_SUPERVISES_AI tasks');
console.log('- 1 HUMAN_OWNED task');
console.log();

const distribution = calculateOwnershipDistribution(testTasks);

console.log('=== Distribution Results ===\n');

console.log('AI Ownership Coverage:', distribution.aiOwnedPercent.toFixed(1), '%');
console.log('Expected: 50.0% (3 out of 6 tasks)');
console.log('Result:', Math.abs(distribution.aiOwnedPercent - 50.0) < 0.1 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('Human Supervision Required:', distribution.humanSupervisesPercent.toFixed(1), '%');
console.log('Expected: 33.3% (2 out of 6 tasks)');
console.log('Result:', Math.abs(distribution.humanSupervisesPercent - 33.333) < 0.1 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('Human Ownership Required:', distribution.humanOwnedPercent.toFixed(1), '%');
console.log('Expected: 16.7% (1 out of 6 tasks)');
console.log('Result:', Math.abs(distribution.humanOwnedPercent - 16.667) < 0.1 ? '✓ PASS' : '✗ FAIL');
console.log();

// Verify percentages sum to 100
const total = distribution.aiOwnedPercent + distribution.humanSupervisesPercent + distribution.humanOwnedPercent;
console.log('Total Percentage:', total.toFixed(1), '%');
console.log('Expected: 100.0%');
console.log('Result:', Math.abs(total - 100) < 0.1 ? '✓ PASS' : '✗ FAIL');
console.log();

// Test with empty array
console.log('=== Test: Empty Task Array ===\n');

const emptyDistribution = calculateOwnershipDistribution([]);
console.log('AI Ownership Coverage:', emptyDistribution.aiOwnedPercent, '%');
console.log('Human Supervision Required:', emptyDistribution.humanSupervisesPercent, '%');
console.log('Human Ownership Required:', emptyDistribution.humanOwnedPercent, '%');
console.log('Expected: All 0%');
const allZero = emptyDistribution.aiOwnedPercent === 0 && 
                emptyDistribution.humanSupervisesPercent === 0 && 
                emptyDistribution.humanOwnedPercent === 0;
console.log('Result:', allZero ? '✓ PASS' : '✗ FAIL');
console.log();

// Test with all same ownership
console.log('=== Test: All AI_OWNED Tasks ===\n');

const allAiTasks: ClassifiedTask[] = Array(5).fill(null).map((_, i) => ({
  id: `ai-${i}`,
  description: `AI task ${i + 1}`,
  estimatedHours: 2,
  ownership: 'AI_OWNED' as const,
  explanation: 'Low risk',
  attributes: {
    production_risk: 0.1,
    compliance_impact: 0.1,
    reversibility: 0.9,
    ambiguity: 0.1,
    cognitive_load: 0.2,
  },
}));

const allAiDistribution = calculateOwnershipDistribution(allAiTasks);
console.log('AI Ownership Coverage:', allAiDistribution.aiOwnedPercent.toFixed(1), '%');
console.log('Human Supervision Required:', allAiDistribution.humanSupervisesPercent.toFixed(1), '%');
console.log('Human Ownership Required:', allAiDistribution.humanOwnedPercent.toFixed(1), '%');
console.log('Expected: 100% AI, 0% others');
const correctAllAi = allAiDistribution.aiOwnedPercent === 100 && 
                     allAiDistribution.humanSupervisesPercent === 0 && 
                     allAiDistribution.humanOwnedPercent === 0;
console.log('Result:', correctAllAi ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('=== Ownership Distribution Tests Complete ===');
