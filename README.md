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
- **Deterministic Mock Scoring**: Keyword-based scoring that's fully reproducible (no randomness)
- **Optional LLM Integration**: OpenAI API integration with automatic fallback to deterministic scoring
- **Policy-Driven Classification**: Three configurable policy profiles for different organizational risk tolerances
- **Outcome Simulation**: Calculates time savings, risk changes, and provides deployment recommendations
- **Ownership Distribution**: Visual breakdown of AI vs human task allocation
- **Comprehensive Testing**: 20+ unit tests with 100% pass rate
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
- (Optional) OpenAI API key for LLM scoring

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd devflow-ai

# Install dependencies
npm install

# (Optional) Add OpenAI API key for LLM scoring
# Create .env.local file:
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Run all tests
npm run test:all

# Run individual test suites
npm run test:scoring
npm run test:classification
npm run test:simulation
npm run test:ownership
npm run test:policies
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

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

### API Usage

The API is fully implemented and ready to use:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "user-auth",
    "policyProfile": "startup"
  }'
```

Available scenarios:
- `user-auth` - User Authentication Feature
- `payment-integration` - Payment Processing Integration
- `data-export` - Data Export Feature

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

#### `/lib/scoring/mock.ts`
Deterministic keyword-based scoring:
- `scoreTaskDeterministic()`: Keyword-based attribute scoring
- 30+ keywords mapped to specific score patterns
- Fully reproducible (no randomness)

#### `/lib/llm/index.ts`
Optional LLM integration:
- `scoreTask()`: Tries LLM first, falls back to deterministic
- Automatic fallback on API errors
- Works without API key (uses deterministic mock)

#### `/lib/llm/openai.ts`
OpenAI API wrapper:
- `scoreTaskWithLLM()`: Calls OpenAI API for task scoring
- Structured JSON output with validation
- Uses gpt-4o-mini model

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

#### `/app/api/analyze/route.ts`
Main API endpoint:
- POST endpoint for workflow analysis
- Three predefined scenarios
- Request validation and error handling
- Complete processing pipeline

### UI Components

#### `/app/components/OwnershipDistribution.tsx`
Visual display of ownership distribution metrics with color-coded percentages.

#### `/app/page.tsx`
Main application page with:
- Scenario selection dropdown (3 predefined scenarios)
- Policy profile selector (Startup, Fintech, Junior Team)
- Analyze button with loading states
- Results display with task classification table
- Ownership distribution visualization
- Simulation metrics display
- Visual indicator for scoring method (LLM vs deterministic)

## Testing

All tests use deterministic scoring (no API key needed):

```bash
# Run all tests
npm run test:all

# Run individual test suites
npm run test:scoring        # AI-suitability scoring tests
npm run test:classification # Task classification tests
npm run test:simulation     # Outcome simulation tests
npm run test:ownership      # Ownership distribution tests
npm run test:policies       # Policy profile tests
```

**Test Results**: 20+ tests, 100% pass rate

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.
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
- ✅ API route implemented (`/api/analyze`)
- ✅ Three predefined workflow scenarios
- ✅ Deterministic mock scoring module
- ✅ Complete UI (scenario selector, policy selector, results display)
- ✅ Optional LLM integration with automatic fallback
- ✅ Error handling and loading states
- ✅ Comprehensive unit tests (20+ tests, 100% pass rate)
- ✅ Documentation (README, testing guides, implementation summary)

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions:
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing help
- See [QUICK_TEST.md](./QUICK_TEST.md) for quick reference
- See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for implementation details
- See [HOW_TO_CHECK_LLM.md](./HOW_TO_CHECK_LLM.md) for LLM integration guide
- See [SCORING_COMPARISON.md](./SCORING_COMPARISON.md) for scoring method comparison
- Check the troubleshooting section in testing guides

## Acknowledgments

Built with a focus on simplicity, type safety, and deterministic behavior for reliable developer productivity analysis.
