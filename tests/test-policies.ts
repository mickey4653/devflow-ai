import { classifyTask } from '../lib/scoring/decision';
import { getThresholds } from '../lib/policies';
import { ScoredTask, PolicyProfile } from '../types';

console.log('=== Testing Policy Profile Switching ===\n');

// Task with moderate AI-suitability score (~0.65)
const moderateTask: ScoredTask = {
  id: '1',
  description: 'Implement API endpoint with validation',
  estimatedHours: 5,
  attributes: {
    production_risk: 0.3,
    compliance_impact: 0.4,
    reversibility: 0.7,
    ambiguity: 0.3,
    cognitive_load: 0.4,
  },
};

console.log('Task: Implement API endpoint with validation');
console.log('Attributes:', moderateTask.attributes);
console.log('Estimated AI-suitability score: ~0.65\n');

const policies: PolicyProfile[] = ['startup', 'fintech', 'junior_team'];

policies.forEach(policy => {
  const thresholds = getThresholds(policy);
  const result = classifyTask(moderateTask, policy);
  
  console.log(`--- ${policy.toUpperCase()} POLICY ---`);
  console.log(`AI Owned Threshold: ${thresholds.aiOwnedThreshold}`);
  console.log(`Human Supervises Threshold: ${thresholds.humanSupervisesThreshold}`);
  console.log(`Classification: ${result.ownership}`);
  console.log(`Explanation: ${result.explanation}`);
  console.log();
});

console.log('Expected Behavior:');
console.log('- Startup (0.7 threshold): Should be HUMAN_SUPERVISES_AI (0.65 < 0.7)');
console.log('- Fintech (0.8 threshold): Should be HUMAN_OWNED (0.65 < 0.65 is false, so between 0.65 and 0.8)');
console.log('- Junior Team (0.75 threshold): Should be HUMAN_SUPERVISES_AI (0.65 < 0.75)');
console.log();

// Test with high suitability task across policies
console.log('=== High AI-Suitability Task (~0.85) ===\n');

const highTask: ScoredTask = {
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

console.log('Task:', highTask.description);
console.log('Attributes:', highTask.attributes);
console.log();

policies.forEach(policy => {
  const result = classifyTask(highTask, policy);
  console.log(`${policy}: ${result.ownership}`);
});
console.log('Expected: AI_OWNED for all policies (score > all thresholds)');
console.log();

// Test with low suitability task across policies
console.log('=== Low AI-Suitability Task (~0.25) ===\n');

const lowTask: ScoredTask = {
  id: '3',
  description: 'Implement payment processing with PCI compliance',
  estimatedHours: 8,
  attributes: {
    production_risk: 0.9,
    compliance_impact: 0.9,
    reversibility: 0.2,
    ambiguity: 0.7,
    cognitive_load: 0.6,
  },
};

console.log('Task:', lowTask.description);
console.log('Attributes:', lowTask.attributes);
console.log();

policies.forEach(policy => {
  const result = classifyTask(lowTask, policy);
  console.log(`${policy}: ${result.ownership}`);
});
console.log('Expected: HUMAN_OWNED for all policies (score < all thresholds)');
console.log();

// Test boundary cases
console.log('=== Boundary Case Testing ===\n');

// Task with score exactly at startup threshold (0.7)
const boundaryTask: ScoredTask = {
  id: '4',
  description: 'Boundary test task',
  estimatedHours: 3,
  attributes: {
    production_risk: 0.25,
    compliance_impact: 0.3,
    reversibility: 0.75,
    ambiguity: 0.25,
    cognitive_load: 0.3,
  },
};

console.log('Task with score near 0.7 threshold:');
console.log('Attributes:', boundaryTask.attributes);
console.log();

policies.forEach(policy => {
  const thresholds = getThresholds(policy);
  const result = classifyTask(boundaryTask, policy);
  console.log(`${policy} (threshold ${thresholds.aiOwnedThreshold}): ${result.ownership}`);
});
console.log();

// Compare policy aggressiveness
console.log('=== Policy Aggressiveness Comparison ===\n');

console.log('Most Aggressive (most AI ownership):');
console.log('  Startup - AI Owned: 0.7, Human Supervises: 0.5');
console.log();

console.log('Most Conservative (least AI ownership):');
console.log('  Fintech - AI Owned: 0.8, Human Supervises: 0.65');
console.log();

console.log('Balanced:');
console.log('  Junior Team - AI Owned: 0.75, Human Supervises: 0.55');
console.log();

console.log('=== Policy Tests Complete ===');
