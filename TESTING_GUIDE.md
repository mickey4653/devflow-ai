# DevFlow AI - Local Testing Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Terminal/Command prompt access

## Step 1: Install Dependencies

```bash
npm install
```

If you encounter any errors, try:
```bash
npm install --legacy-peer-deps
```

## Step 2: Start the Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

Open your browser and navigate to `http://localhost:3000`

## Step 3: Verify Core Modules

Before testing the full workflow, verify that core modules are working correctly.

### Test AI-Suitability Scoring

Create a test file: `test-scoring.ts`

```typescript
import { calculateAiSuitabilityScore } from './lib/scoring/decision';
import { TaskAttribute } from './types';

// Test case 1: High AI-suitability (low risk, high reversibility)
const highSuitability: TaskAttribute = {
  production_risk: 0.1,
  compliance_impact: 0.1,
  reversibility: 0.9,
  ambiguity: 0.2,
  cognitive_load: 0.2,
};

console.log('High AI-suitability score:', calculateAiSuitabilityScore(highSuitability));
// Expected: ~0.80 (high score = suitable for AI)

// Test case 2: Low AI-suitability (high risk, low reversibility)
const lowSuitability: TaskAttribute = {
  production_risk: 0.9,
  compliance_impact: 0.8,
  reversibility: 0.1,
  ambiguity: 0.7,
  cognitive_load: 0.6,
};

console.log('Low AI-suitability score:', calculateAiSuitabilityScore(lowSuitability));
// Expected: ~0.20 (low score = not suitable for AI)
```

Run with:
```bash
npx tsx test-scoring.ts
```

### Test Task Classification

Create a test file: `test-classification.ts`

```typescript
import { classifyTask } from './lib/scoring/decision';
import { ScoredTask, PolicyProfile } from './types';

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

// Test with different policies
const policies: PolicyProfile[] = ['startup', 'fintech', 'junior_team'];

policies.forEach(policy => {
  const result = classifyTask(testTask, policy);
  console.log(`\nPolicy: ${policy}`);
  console.log(`Ownership: ${result.ownership}`);
  console.log(`Explanation: ${result.explanation}`);
});
```

Run with:
```bash
npx tsx test-classification.ts
```

Expected behavior:
- **Startup policy** (threshold 0.7): More likely to classify as AI_OWNED or HUMAN_SUPERVISES_AI
- **Fintech policy** (threshold 0.8): More conservative, likely HUMAN_SUPERVISES_AI or HUMAN_OWNED
- **Junior Team policy** (threshold 0.75): Balanced between the two

### Test Simulation Module

Create a test file: `test-simulation.ts`

```typescript
import { simulateOutcomes } from './lib/simulation';
import { ClassifiedTask } from './types';

const testTasks: ClassifiedTask[] = [
  {
    id: '1',
    description: 'Simple UI component',
    estimatedHours: 2,
    ownership: 'AI_OWNED',
    explanation: 'Low risk task',
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
    explanation: 'High risk task',
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
    explanation: 'Moderate risk task',
    attributes: {
      production_risk: 0.4,
      compliance_impact: 0.3,
      reversibility: 0.6,
      ambiguity: 0.4,
      cognitive_load: 0.4,
    },
  },
];

const result = simulateOutcomes(testTasks);
console.log('Simulation Results:');
console.log('Baseline Time:', result.baselineTotalTime, 'hours');
console.log('AI-Native Time:', result.aiNativeTotalTime, 'hours');
console.log('Throughput Gain:', result.throughputGainPercent.toFixed(2), '%');
console.log('Risk Delta:', result.aggregateRiskDelta.toFixed(3));
console.log('Recommendation:', result.deploymentRecommendation);
```

Run with:
```bash
npx tsx test-simulation.ts
```

Expected output:
- Baseline Time: 14 hours (2 + 8 + 4)
- AI-Native Time: ~9.3 hours (2*0.35 + 8*1.0 + 4*0.65)
- Throughput Gain: ~33%
- Risk Delta: Positive value (AI increases risk slightly)
- Recommendation: Depends on gain/risk ratio

### Test Ownership Distribution

Create a test file: `test-ownership.ts`

```typescript
import { calculateOwnershipDistribution } from './lib/analysis';
import { ClassifiedTask } from './types';

const testTasks: ClassifiedTask[] = [
  // 3 AI_OWNED tasks
  ...Array(3).fill(null).map((_, i) => ({
    id: `ai-${i}`,
    description: 'AI task',
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
    description: 'Supervised task',
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
    description: 'Human task',
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

const distribution = calculateOwnershipDistribution(testTasks);
console.log('Ownership Distribution:');
console.log('AI Ownership Coverage:', distribution.aiOwnedPercent.toFixed(1), '%');
console.log('Human Supervision Required:', distribution.humanSupervisesPercent.toFixed(1), '%');
console.log('Human Ownership Required:', distribution.humanOwnedPercent.toFixed(1), '%');
```

Run with:
```bash
npx tsx test-ownership.ts
```

Expected output:
- AI Ownership Coverage: 50.0% (3 out of 6 tasks)
- Human Supervision Required: 33.3% (2 out of 6 tasks)
- Human Ownership Required: 16.7% (1 out of 6 tasks)

## Step 4: Test Policy Profile Switching

Create a comprehensive test: `test-policies.ts`

```typescript
import { classifyTask } from './lib/scoring/decision';
import { getThresholds } from './lib/policies';
import { ScoredTask, PolicyProfile } from './types';

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

console.log('Testing Policy Profile Switching\n');
console.log('Task: Implement API endpoint with validation');
console.log('Estimated AI-suitability score: ~0.65\n');

const policies: PolicyProfile[] = ['startup', 'fintech', 'junior_team'];

policies.forEach(policy => {
  const thresholds = getThresholds(policy);
  const result = classifyTask(moderateTask, policy);
  
  console.log(`\n--- ${policy.toUpperCase()} POLICY ---`);
  console.log(`AI Owned Threshold: ${thresholds.aiOwnedThreshold}`);
  console.log(`Human Supervises Threshold: ${thresholds.humanSupervisesThreshold}`);
  console.log(`Classification: ${result.ownership}`);
  console.log(`Explanation: ${result.explanation}`);
});

console.log('\n\nExpected Behavior:');
console.log('- Startup (0.7 threshold): Should be HUMAN_SUPERVISES_AI (0.65 < 0.7)');
console.log('- Fintech (0.8 threshold): Should be HUMAN_OWNED (0.65 < 0.65 is false, so < 0.8)');
console.log('- Junior Team (0.75 threshold): Should be HUMAN_SUPERVISES_AI (0.65 < 0.75)');
```

Run with:
```bash
npx tsx test-policies.ts
```

## Step 5: Test Full Workflow (When API is Implemented)

Once the API route is implemented, test the full workflow:

### Sample API Request

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "user-auth",
    "policyProfile": "startup"
  }'
```

### Expected Response Structure

```json
{
  "workflow": {
    "name": "User Authentication Feature",
    "tasks": [...]
  },
  "classifiedTasks": [
    {
      "id": "1",
      "description": "Design database schema for users",
      "estimatedHours": 3,
      "attributes": {...},
      "ownership": "HUMAN_SUPERVISES_AI",
      "explanation": "Moderate AI-suitability: ..."
    }
  ],
  "simulation": {
    "baselineTotalTime": 17,
    "aiNativeTotalTime": 10.5,
    "throughputGainPercent": 38.2,
    "aggregateRiskDelta": 0.15,
    "deploymentRecommendation": "CONDITIONAL: Moderate gains, monitor risk closely"
  },
  "ownershipDistribution": {
    "aiOwnedPercent": 40.0,
    "humanSupervisesPercent": 40.0,
    "humanOwnedPercent": 20.0
  },
  "policyProfile": "startup"
}
```

## Step 6: Verify UI Components

1. Open `http://localhost:3000` in your browser
2. Check that the page loads without errors
3. Open browser DevTools (F12) and check Console for errors
4. Verify the ownership distribution component renders correctly

## Common Errors and Solutions

### Error: "Module not found"

**Cause**: TypeScript path aliases not resolved correctly

**Solution**:
```bash
# Restart the dev server
npm run dev
```

### Error: "AI-suitability score outside valid range"

**Cause**: Task attributes not in [0, 1] range

**Solution**: Verify all attribute values are between 0 and 1:
```typescript
// Bad
{ production_risk: 1.5 }  // > 1

// Good
{ production_risk: 0.8 }  // 0-1 range
```

### Error: "Cannot read property 'ownership' of undefined"

**Cause**: Task not properly classified

**Solution**: Ensure `classifyTask` is called before accessing ownership:
```typescript
const classifiedTask = classifyTask(scoredTask, policyProfile);
console.log(classifiedTask.ownership);  // Now safe
```

### LLM Response Parsing Failures (Future Implementation)

When LLM integration is added, watch for:

**Error**: "Invalid JSON from LLM"

**Debugging steps**:
1. Log the raw LLM response:
   ```typescript
   console.log('Raw LLM response:', response);
   ```
2. Check if response contains valid JSON
3. Verify all required fields are present
4. Add retry logic with exponential backoff

**Error**: "Score out of range"

**Solution**: Add validation and clamping:
```typescript
function clampScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}
```

## Debugging Tips

### Enable Verbose Logging

Add console logs to track execution:

```typescript
// In decision.ts
export function calculateAiSuitabilityScore(attributes: TaskAttribute): number {
  console.log('Calculating AI-suitability for:', attributes);
  const score = /* calculation */;
  console.log('Calculated score:', score);
  return score;
}
```

### Use TypeScript Strict Mode

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Check Network Requests

In browser DevTools:
1. Go to Network tab
2. Trigger an analysis
3. Check the request/response for `/api/analyze`
4. Verify status code is 200
5. Inspect response payload

### Verify Calculations Manually

For a task with known attributes, calculate expected values:

```
Given attributes:
- production_risk: 0.2
- compliance_impact: 0.3
- reversibility: 0.8
- ambiguity: 0.2
- cognitive_load: 0.3

AI-suitability score:
= (1 - 0.2) * 0.30 + (1 - 0.3) * 0.25 + 0.8 * 0.20 + (1 - 0.2) * 0.15 + (1 - 0.3) * 0.10
= 0.8 * 0.30 + 0.7 * 0.25 + 0.8 * 0.20 + 0.8 * 0.15 + 0.7 * 0.10
= 0.24 + 0.175 + 0.16 + 0.12 + 0.07
= 0.765

With startup policy (threshold 0.7):
0.765 >= 0.7 → AI_OWNED ✓
```

## Performance Benchmarks

Expected response times (without LLM):
- AI-suitability calculation: < 1ms per task
- Task classification: < 1ms per task
- Simulation: < 5ms for 10 tasks
- Ownership distribution: < 1ms for 10 tasks

With LLM (future):
- Per-task scoring: 500-2000ms (depends on LLM API)
- Full workflow (5 tasks): 2.5-10 seconds

## Next Steps

1. Implement the API route (`app/api/analyze/route.ts`)
2. Add predefined scenarios
3. Implement mock scoring module
4. Build complete UI with scenario/policy selectors
5. Add LLM integration
6. Implement error handling and loading states

## Troubleshooting Checklist

- [ ] Node.js version 18+ installed
- [ ] Dependencies installed successfully
- [ ] Dev server running on port 3000
- [ ] No TypeScript compilation errors
- [ ] Core modules (scoring, policies, simulation) working
- [ ] Browser console shows no errors
- [ ] Network requests returning 200 status
- [ ] Response data matches expected structure
- [ ] UI components rendering correctly
- [ ] Ownership distribution displaying percentages

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify all files are saved
4. Restart the dev server
5. Clear browser cache and reload
