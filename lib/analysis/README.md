# Ownership Distribution Analysis

## Usage

The `calculateOwnershipDistribution` function calculates the percentage distribution of tasks across ownership classifications.

### In API Route

```typescript
import { calculateOwnershipDistribution } from '@/lib/analysis';
import { simulateOutcomes } from '@/lib/simulation';
import { classifyTask } from '@/lib/scoring/decision';

// After classifying tasks
const classifiedTasks = tasks.map(task => classifyTask(task, policyProfile));

// Calculate ownership distribution
const ownershipDistribution = calculateOwnershipDistribution(classifiedTasks);

// Calculate simulation results
const simulation = simulateOutcomes(classifiedTasks);

// Return complete analysis result
const analysisResult: AnalysisResult = {
  workflow,
  classifiedTasks,
  simulation,
  ownershipDistribution,
  policyProfile,
};
```

### In UI Component

```typescript
import { OwnershipDistributionDisplay } from '@/app/components/OwnershipDistribution';

// In your component
{result && result.ownershipDistribution && (
  <OwnershipDistributionDisplay distribution={result.ownershipDistribution} />
)}
```

## Calculation Rules

- **AI Ownership Coverage** = (Number of AI_OWNED tasks / Total tasks) × 100
- **Human Supervision Required** = (Number of HUMAN_SUPERVISES_AI tasks / Total tasks) × 100
- **Human Ownership Required** = (Number of HUMAN_OWNED tasks / Total tasks) × 100

## Example Output

```
AI Ownership Coverage: 60.0%
Human Supervision Required: 30.0%
Human Ownership Required: 10.0%
```
