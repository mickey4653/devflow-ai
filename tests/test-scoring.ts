import { calculateAiSuitabilityScore } from '../lib/scoring/decision';
import { TaskAttribute } from '../types';

console.log('=== Testing AI-Suitability Scoring ===\n');

// Test case 1: High AI-suitability (low risk, high reversibility)
const highSuitability: TaskAttribute = {
  production_risk: 0.1,
  compliance_impact: 0.1,
  reversibility: 0.9,
  ambiguity: 0.2,
  cognitive_load: 0.2,
};

console.log('Test 1: High AI-suitability task');
console.log('Attributes:', highSuitability);
const highScore = calculateAiSuitabilityScore(highSuitability);
console.log('AI-suitability score:', highScore.toFixed(3));
console.log('Expected: ~0.80 (high score = suitable for AI)');
console.log('Result:', highScore > 0.75 ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 2: Low AI-suitability (high risk, low reversibility)
const lowSuitability: TaskAttribute = {
  production_risk: 0.9,
  compliance_impact: 0.8,
  reversibility: 0.1,
  ambiguity: 0.7,
  cognitive_load: 0.6,
};

console.log('Test 2: Low AI-suitability task');
console.log('Attributes:', lowSuitability);
const lowScore = calculateAiSuitabilityScore(lowSuitability);
console.log('AI-suitability score:', lowScore.toFixed(3));
console.log('Expected: ~0.20 (low score = not suitable for AI)');
console.log('Result:', lowScore < 0.30 ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 3: Moderate AI-suitability
const moderateSuitability: TaskAttribute = {
  production_risk: 0.4,
  compliance_impact: 0.3,
  reversibility: 0.6,
  ambiguity: 0.4,
  cognitive_load: 0.4,
};

console.log('Test 3: Moderate AI-suitability task');
console.log('Attributes:', moderateSuitability);
const moderateScore = calculateAiSuitabilityScore(moderateSuitability);
console.log('AI-suitability score:', moderateScore.toFixed(3));
console.log('Expected: ~0.60 (moderate score)');
console.log('Result:', moderateScore > 0.55 && moderateScore < 0.65 ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 4: Edge case - all zeros
const allZeros: TaskAttribute = {
  production_risk: 0,
  compliance_impact: 0,
  reversibility: 0,
  ambiguity: 0,
  cognitive_load: 0,
};

console.log('Test 4: Edge case - all zeros');
console.log('Attributes:', allZeros);
const zeroScore = calculateAiSuitabilityScore(allZeros);
console.log('AI-suitability score:', zeroScore.toFixed(3));
console.log('Expected: 0.80 (high suitability: (1-0)*0.30 + (1-0)*0.25 + 0*0.20 + (1-0)*0.15 + (1-0)*0.10 = 0.80)');
console.log('Result:', Math.abs(zeroScore - 0.80) < 0.01 ? '✓ PASS' : '✗ FAIL');
console.log();

// Test case 5: Edge case - all ones
const allOnes: TaskAttribute = {
  production_risk: 1,
  compliance_impact: 1,
  reversibility: 1,
  ambiguity: 1,
  cognitive_load: 1,
};

console.log('Test 5: Edge case - all ones');
console.log('Attributes:', allOnes);
const oneScore = calculateAiSuitabilityScore(allOnes);
console.log('AI-suitability score:', oneScore.toFixed(3));
console.log('Expected: 0.20 (low suitability due to high risks, but high reversibility helps)');
console.log('Result:', Math.abs(oneScore - 0.20) < 0.01 ? '✓ PASS' : '✗ FAIL');
console.log();

console.log('=== Scoring Tests Complete ===');
