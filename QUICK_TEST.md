# DevFlow AI - Quick Test Reference

## Quick Start

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Quick Module Tests

### Test AI-Suitability Scoring

```typescript
import { calculateAiSuitabilityScore } from './lib/scoring/decision';

const score = calculateAiSuitabilityScore({
  production_risk: 0.2,
  compliance_impact: 0.3,
  reversibility: 0.8,
  ambiguity: 0.2,
  cognitive_load: 0.3,
});

console.log(score); // Expected: ~0.765
```

### Test Classification

```typescript
import { classifyTask } from './lib/scoring/decision';

const result = classifyTask(scoredTask, 'startup');
console.log(result.ownership);     // AI_OWNED | HUMAN_SUPERVISES_AI | HUMAN_OWNED
console.log(result.explanation);   // Human-readable explanation
```

### Test Policy Thresholds

| Policy | AI Owned | Human Supervises | Behavior |
|--------|----------|------------------|----------|
| Startup | 0.7 | 0.5 | Most aggressive |
| Fintech | 0.8 | 0.65 | Most conservative |
| Junior Team | 0.75 | 0.55 | Balanced |

### Test Simulation

```typescript
import { simulateOutcomes } from './lib/simulation';

const result = simulateOutcomes(classifiedTasks);
// Returns: baselineTotalTime, aiNativeTotalTime, throughputGainPercent, 
//          aggregateRiskDelta, deploymentRecommendation
```

### Test Ownership Distribution

```typescript
import { calculateOwnershipDistribution } from './lib/analysis';

const dist = calculateOwnershipDistribution(classifiedTasks);
// Returns: aiOwnedPercent, humanSupervisesPercent, humanOwnedPercent
```

## Expected Multipliers

### Time Multipliers
- AI_OWNED: 0.35 (35% of human time)
- HUMAN_SUPERVISES_AI: 0.65 (65% of human time)
- HUMAN_OWNED: 1.0 (100% of human time)

### Risk Multipliers
- AI_OWNED: 1.4 (40% risk increase)
- HUMAN_SUPERVISES_AI: 0.85 (15% risk reduction)
- HUMAN_OWNED: 1.0 (baseline risk)

## Sample Test Data

### High AI-Suitability Task
```typescript
{
  production_risk: 0.1,
  compliance_impact: 0.1,
  reversibility: 0.9,
  ambiguity: 0.1,
  cognitive_load: 0.2,
}
// Expected score: ~0.85 → AI_OWNED (most policies)
```

### Low AI-Suitability Task
```typescript
{
  production_risk: 0.9,
  compliance_impact: 0.8,
  reversibility: 0.2,
  ambiguity: 0.7,
  cognitive_load: 0.6,
}
// Expected score: ~0.25 → HUMAN_OWNED (all policies)
```

### Moderate AI-Suitability Task
```typescript
{
  production_risk: 0.4,
  compliance_impact: 0.3,
  reversibility: 0.6,
  ambiguity: 0.4,
  cognitive_load: 0.4,
}
// Expected score: ~0.60 → Varies by policy
```

## Common Issues

| Error | Quick Fix |
|-------|-----------|
| Module not found | Restart dev server |
| Score out of range | Check attributes are 0-1 |
| TypeScript errors | Run `npm run build` |
| Port 3000 in use | Kill process or use different port |

## Verification Checklist

- [ ] Score calculation returns 0-1 range
- [ ] Classification matches policy thresholds
- [ ] Explanation references 2+ attributes
- [ ] Simulation calculates time correctly
- [ ] Distribution percentages sum to 100%
- [ ] UI component renders without errors

## Quick Calculation Check

For attributes: `{0.2, 0.3, 0.8, 0.2, 0.3}`

```
AI-suitability = (1-0.2)*0.30 + (1-0.3)*0.25 + 0.8*0.20 + (1-0.2)*0.15 + (1-0.3)*0.10
               = 0.24 + 0.175 + 0.16 + 0.12 + 0.07
               = 0.765
```

With startup policy (0.7 threshold): `0.765 >= 0.7` → **AI_OWNED** ✓
