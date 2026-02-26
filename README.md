# DevFlow AI

A developer productivity decision engine that analyzes feature development workflows and determines optimal task ownership between AI and human developers.

## Overview

DevFlow AI uses AI-suitability scoring to classify development tasks into three ownership categories:
- **AI_OWNED**: Tasks suitable for full AI automation
- **HUMAN_SUPERVISES_AI**: Tasks where AI assists but humans review
- **HUMAN_OWNED**: Tasks requiring full human ownership

The system applies policy profiles (Startup, Fintech, Junior Team) to adjust decision thresholds and simulates productivity outcomes including time savings, risk deltas, and deployment recommendations.

## Key Features

- **AI-Suitability Scoring**: Evaluates tasks on 5 attributes (production risk, compliance impact, reversibility, ambiguity, cognitive load)
- **Policy-Driven Classification**: Three configurable policy profiles for different organizational risk tolerances
- **Outcome Simulation**: Calculates time savings, risk changes, and provides deployment recommendations
- **Ownership Distribution**: Visual breakdown of AI vs human task allocation
- **Stateless Architecture**: No database, no authentication, simple deployment
- **TypeScript**: Full type safety and modern development experience

## Architecture

```
DevFlow AI
├── types/                    # TypeScript type definitions
├── lib/
│   ├── scoring/             # AI-suitability scoring and classification
│   ├── policies/            # Policy profile configurations
│   ├── simulation/          # Outcome simulation logic
│   └── analysis/            # Ownership distribution calculations
├── app/
│   ├── api/analyze/         # API endpoint for workflow analysis
│   ├── components/          # React UI components
│   └── page.tsx             # Main UI page
└── docs/                    # Additional documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd devflow-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### 1. AI-Suitability Scoring

Each task is scored based on five attributes (0-1 scale):

```typescript
aiSuitabilityScore = 
  (1 - production_risk) * 0.30 +
  (1 - compliance_impact) * 0.25 +
  reversibility * 0.20 +
  (1 - ambiguity) * 0.15 +
  (1 - cognitive_load) * 0.10
```

**Higher scores** = More suitable for AI automation

### 2. Policy Profiles

Three policy profiles adjust classification thresholds:

| Policy | AI Owned Threshold | Human Supervises Threshold | Use Case |
|--------|-------------------|---------------------------|----------|
| **Startup** | 0.7 | 0.5 | Fast iteration, higher AI adoption |
| **Fintech** | 0.8 | 0.65 | Conservative, compliance-focused |
| **Junior Team** | 0.75 | 0.55 | Balanced, learning-oriented |

### 3. Task Classification

```typescript
if (score >= aiOwnedThreshold) → AI_OWNED
else if (score >= humanSupervisesThreshold) → HUMAN_SUPERVISES_AI
else → HUMAN_OWNED
```

### 4. Outcome Simulation

Calculates productivity metrics:

- **Baseline Time**: Total time if all tasks are human-owned
- **AI-Native Time**: Time with AI assistance applied
- **Throughput Gain**: Percentage time saved
- **Risk Delta**: Change in production risk
- **Deployment Recommendation**: RECOMMENDED | CONDITIONAL | NOT RECOMMENDED | MARGINAL

#### Time Multipliers
- AI_OWNED: 0.35 (AI completes in 35% of human time)
- HUMAN_SUPERVISES_AI: 0.65 (AI + review takes 65% of human time)
- HUMAN_OWNED: 1.0 (100% human time)

#### Risk Multipliers
- AI_OWNED: 1.4 (40% risk increase)
- HUMAN_SUPERVISES_AI: 0.85 (15% risk reduction)
- HUMAN_OWNED: 1.0 (baseline risk)

## Usage Example

### Programmatic Usage

```typescript
import { classifyTask } from './lib/scoring/decision';
import { simulateOutcomes } from './lib/simulation';
import { calculateOwnershipDistribution } from './lib/analysis';

// Score and classify a task
const task = {
  id: '1',
  description: 'Implement user authentication',
  estimatedHours: 5,
  attributes: {
    production_risk: 0.3,
    compliance_impact: 0.4,
    reversibility: 0.7,
    ambiguity: 0.2,
    cognitive_load: 0.3,
  },
};

const classifiedTask = classifyTask(task, 'startup');
console.log(classifiedTask.ownership);    // "AI_OWNED"
console.log(classifiedTask.explanation);  // "High AI-suitability: low production risk..."

// Simulate outcomes for multiple tasks
const simulation = simulateOutcomes([classifiedTask]);
console.log(simulation.throughputGainPercent);  // 65.0
console.log(simulation.deploymentRecommendation); // "RECOMMENDED: High productivity gain..."

// Calculate ownership distribution
const distribution = calculateOwnershipDistribution([classifiedTask]);
console.log(distribution.aiOwnedPercent);  // 100.0
```

### API Usage (When Implemented)

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "user-auth",
    "policyProfile": "startup"
  }'
```

Response:
```json
{
  "workflow": {
    "name": "User Authentication Feature",
    "tasks": [...]
  },
  "classifiedTasks": [...],
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

## Project Structure

### Core Modules

#### `/types/index.ts`
Type definitions for all data structures:
- `TaskAttribute`: Task scoring attributes
- `OwnershipClassification`: AI_OWNED | HUMAN_SUPERVISES_AI | HUMAN_OWNED
- `Task`, `ScoredTask`, `ClassifiedTask`: Task progression types
- `PolicyProfile`: startup | fintech | junior_team
- `SimulationResult`: Outcome metrics
- `OwnershipDistribution`: Distribution percentages
- `AnalysisResult`: Complete analysis response

#### `/lib/scoring/decision.ts`
AI-suitability scoring and classification:
- `calculateAiSuitabilityScore()`: Computes 0-1 suitability score
- `classifyTask()`: Determines ownership based on policy
- `generateExplanation()`: Creates human-readable rationale

#### `/lib/policies/index.ts`
Policy profile configurations:
- `POLICY_PROFILES`: Threshold definitions
- `getThresholds()`: Retrieves thresholds by profile

#### `/lib/simulation/index.ts`
Outcome simulation:
- `calculateBaselineTime()`: All-human baseline
- `calculateAiNativeTime()`: With AI assistance
- `calculateThroughputGain()`: Percentage improvement
- `calculateRiskDelta()`: Risk change
- `generateDeploymentRecommendation()`: Decision guidance
- `simulateOutcomes()`: Complete simulation

#### `/lib/analysis/ownership.ts`
Ownership distribution:
- `calculateOwnershipDistribution()`: Percentage breakdown

### UI Components

#### `/app/components/OwnershipDistribution.tsx`
Visual display of ownership distribution metrics with color-coded percentages.

#### `/app/page.tsx`
Main application page (to be fully implemented).

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

Quick test:
```bash
# Run individual module tests
npx tsx test-scoring.ts
npx tsx test-classification.ts
npx tsx test-simulation.ts
npx tsx test-ownership.ts
```

See [QUICK_TEST.md](./QUICK_TEST.md) for quick reference.

## Configuration

### Policy Profiles

Edit `/lib/policies/index.ts` to adjust thresholds:

```typescript
export const POLICY_PROFILES: Record<PolicyProfile, PolicyThresholds> = {
  startup: {
    aiOwnedThreshold: 0.7,        // Adjust for more/less AI ownership
    humanSupervisesThreshold: 0.5,
  },
  // ... other profiles
};
```

### Simulation Multipliers

Edit `/lib/simulation/index.ts` to adjust time/risk multipliers:

```typescript
const TIME_MULTIPLIERS: Record<OwnershipClassification, number> = {
  AI_OWNED: 0.35,              // Adjust AI speed advantage
  HUMAN_SUPERVISES_AI: 0.65,
  HUMAN_OWNED: 1.0,
};
```

## Design Principles

### Stateless
- No database required
- No session management
- Each request is independent
- Easy to scale horizontally

### Type-Safe
- Full TypeScript coverage
- Strict mode enabled
- Explicit type definitions
- No `any` types in public APIs

### Deterministic
- Same inputs always produce same outputs
- No randomness in calculations
- Reproducible results for testing

### Minimal
- No external integrations (Jira, GitHub, etc.)
- No authentication/authorization
- Clean, focused architecture
- Essential functionality only

## Roadmap

### Current Status
- ✅ Core types defined
- ✅ AI-suitability scoring implemented
- ✅ Policy profiles configured
- ✅ Decision engine complete
- ✅ Simulation module complete
- ✅ Ownership distribution analysis
- ✅ UI component for distribution display

### Next Steps
- [ ] Implement API route (`/api/analyze`)
- [ ] Add predefined workflow scenarios
- [ ] Implement mock scoring module
- [ ] Build complete UI (scenario selector, policy selector, results display)
- [ ] Add LLM integration for real task scoring
- [ ] Implement error handling and loading states
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Performance optimization
- [ ] Documentation improvements

### Future Enhancements
- [ ] Custom policy profile creation
- [ ] Workflow history (requires state)
- [ ] Export results to PDF/CSV
- [ ] Parallel LLM calls for faster scoring
- [ ] JSON workflow editing UI
- [ ] Advanced analytics dashboard

## Technical Stack

- **Framework**: Next.js 14
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Styling**: Inline styles (minimal, no external CSS framework)
- **State Management**: React hooks (no external state library)
- **API**: Next.js API routes
- **LLM**: OpenAI API (future integration)

## Contributing

1. Follow the existing code style
2. Maintain type safety (no `any` types)
3. Keep functions pure and deterministic
4. Add tests for new features
5. Update documentation

## License

[Your License Here]

## Support

For issues, questions, or contributions:
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing help
- See [QUICK_TEST.md](./QUICK_TEST.md) for quick reference
- Check the troubleshooting section in testing guides

## Acknowledgments

Built with a focus on simplicity, type safety, and deterministic behavior for reliable developer productivity analysis.
