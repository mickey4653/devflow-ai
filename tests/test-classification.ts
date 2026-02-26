import { classifyTask } from '../lib/scoring/decision';
import { ScoredTask, PolicyProfile } from '../types';

console.log('=== Testing Task Classification ===\n');

const testTask: ScoredTask = {
  id: '1',
  description: 'Implement user login',
  estimatedHours: 4,
  attributes: {
    production_risk: 0.2,
    compliance_impact: 0.3,
    reversibility: 0.8,
    ambiguity: 0.2,
    cognitive_load: 0.3,
  },
};

console.log('Test Task:', testTask.description);
console.log('Attributes:', testTask.attributes);
console.log();

// Test with different policies
const policies: PolicyProfile[] = ['startup', 'fintech', 'junior_team'];

policies.forEach(policy => {
  console.log(`--- ${policy.toUpperCase()} POLICY ---`);
  const result = classifyTask(testTask, policy);
  console.log(`Ownership: ${result.ownership}`);
  console.log(`Explanation: ${result.explanation}`);
  console.log();
});

console.log('Expected Behavior:');
console.log('- Startup (threshold 0.7): More likely AI_OWNED or HUMAN_SUPERVISES_AI');
console.log('- Fintech (threshold 0.8): More conservative, likely HUMAN_SUPERVISES_AI or HUMAN_OWNED');
console.log('- Junior Team (threshold 0.75): Balanced between the two');
console.log();

// Test with high AI-suitability task
console.log('=== High AI-Suitability Task ===\n');

const highSuitabilityTask: ScoredTask = {
  id: '2',
  description: 'Create simple UI component',
  estimatedHours: 2,
  attributes: {
    production_risk: 0.1,
    compliance_impact: 0.1,
    reversibility: 0.9,
    ambiguity: 0.1,
    cognitive_load: 0.2,
  },
};

console.log('Test Task:', highSuitabilityTask.description);
console.log('Attributes:', highSuitabilityTask.attributes);
console.log();

policies.forEach(policy => {
  const result = classifyTask(highSuitabilityTask, policy);
  console.log(`${policy}: ${result.ownership}`);
});
console.log('Expected: AI_OWNED for all policies');
console.log();

// Test with low AI-suitability task
console.log('=== Low AI-Suitability Task ===\n');

const lowSuitabilityTask: ScoredTask = {
  id: '3',
  description: 'Implement payment processing with PCI compliance',
  estimatedHours: 8,
  attributes: {
    production_risk: 0.9,
    compliance_impact: 0.9,
    reversibility: 0.2,
    ambiguity: 0.3,
    cognitive_load: 0.7,
  },
};

console.log('Test Task:', lowSuitabilityTask.description);
console.log('Attributes:', lowSuitabilityTask.attributes);
console.log();

policies.forEach(policy => {
  const result = classifyTask(lowSuitabilityTask, policy);
  console.log(`${policy}: ${result.ownership}`);
});
console.log('Expected: HUMAN_OWNED for all policies');
console.log();

console.log('=== Classification Tests Complete ===');
