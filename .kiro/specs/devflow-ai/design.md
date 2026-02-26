# Design Document

## Introduction

This document describes the technical design for DevFlow AI, a Next.js TypeScript application that analyzes feature development workflows and determines optimal task ownership between AI and human developers. The system uses LLM-based scoring, applies deterministic decision formulas with policy profiles, and simulates productivity outcomes.

## Architecture Overview

DevFlow AI follows a simple layered architecture:

- **Presentation Layer**: Next.js page with React UI
- **API Layer**: Next.js API route handler
- **Business Logic Layer**: Scoring, policy, simulation, and decision modules
- **LLM Integration Layer**: OpenAI API client wrapper

The application is stateless with no database, authentication, or external integrations beyond the LLM API.

## Directory Structure

```
/types           - TypeScript type definitions
/lib/scoring     - Task scoring logic
/lib/policies    - Policy profile definitions
/lib/simulation  - Outcome simulation logic
/lib/llm         - LLM client wrapper
/api/analyze     - API endpoint for workflow analysis
/app/page.tsx    - Main UI page
```

## Component Design

### Types Module (`/types`)

Defines core data structures used throughout the application.

**Types:**

```typescript
// Core domain types
type TaskAttribute = {
  ambiguity: number;           // 0-1
  production_risk: number;     // 0-1
  compliance_impact: number;   // 0-1
  reversibility: number;       // 0-1
  cognitive_load: number;      // 0-1
};

type OwnershipClassification = 'AI_OWNED' | 'HUMAN_SUPERVISES_AI' | 'HUMAN_OWNED';

type Task = {
  id: string;
  description: string;
  estimatedHours: number;
};

type ScoredTask = Task & {
  attributes: TaskAttribute;
};

type ClassifiedTask = ScoredTask & {
  ownership: OwnershipClassification;
  explanation: string;
};

type Workflow = {
  name: string;
  tasks: Task[];
};

type PolicyProfile = 'startup' | 'fintech' | 'junior_team';

type SimulationResult = {
  baselineTotalTime: number;
  aiNativeTotalTime: number;
  throughputGainPercent: number;
  aggregateRiskDelta: number;
  deploymentRecommendation: string;
};

type AnalysisResult = {
  workflow: Workflow;
  classifiedTasks: ClassifiedTask[];
  simulation: SimulationResult;
  policyProfile: PolicyProfile;
};
```

**Design Rationale:**
- All numeric scores are constrained to [0, 1] range for consistency
- Ownership classification uses discriminated union for type safety
- Separation of Task, ScoredTask, and ClassifiedTask reflects the analysis pipeline stages

### LLM Module (`/lib/llm`)

Wraps OpenAI API calls for task attribute scoring.

**Function: `scoreTaskAttributes(taskDescription: string): Promise<TaskAttribute>`**

**Behavior:**
1. Constructs a prompt requesting JSON scores for all five attributes
2. Calls OpenAI API with structured output format
3. Validates response against JSON schema
4. Returns TaskAttribute object or throws validation error

**Prompt Structure:**
```
Analyze this development task and score it on five attributes (0-1 scale):
- ambiguity: How unclear or vague is the requirement?
- production_risk: What's the risk of production issues?
- compliance_impact: Does it affect security/privacy/regulations?
- reversibility: How easy is it to undo if wrong?
- cognitive_load: How much mental effort is required?

Task: {taskDescription}

Return JSON: {"ambiguity": 0.0, "production_risk": 0.0, ...}
```

**Error Handling:**
- Validates all scores are numbers in [0, 1]
- Validates all required fields are present
- Throws descriptive errors for invalid responses

**Design Rationale:**
- Single function keeps LLM interaction simple
- Structured output reduces parsing errors
- Validation happens before returning to caller

### Scoring Module (`/lib/scoring`)

Orchestrates task scoring using the LLM module.

**Function: `scoreTasks(tasks: Task[]): Promise<ScoredTask[]>`**

**Behavior:**
1. Iterates through tasks
2. Calls `scoreTaskAttributes` for each task
3. Validates schema compliance
4. Returns array of ScoredTask objects

**Schema Validation:**
- Checks all attribute values are numbers
- Checks all attribute values are in [0, 1] range
- Checks no required attributes are missing

**Design Rationale:**
- Centralized validation ensures consistency
- Batch processing allows for future optimization
- Clear separation from LLM implementation details

### Policies Module (`/lib/policies`)

Defines policy profiles and threshold configurations.

**Type: `PolicyThresholds`**

```typescript
type PolicyThresholds = {
  aiOwnedThreshold: number;      // Below this = AI_OWNED
  humanSupervisesThreshold: number;  // Below this = HUMAN_SUPERVISES_AI
  // Above humanSupervisesThreshold = HUMAN_OWNED
};
```

**Constant: `POLICY_PROFILES`**

```typescript
const POLICY_PROFILES: Record<PolicyProfile, PolicyThresholds> = {
  startup: {
    aiOwnedThreshold: 0.3,
    humanSupervisesThreshold: 0.6,
  },
  fintech: {
    aiOwnedThreshold: 0.2,
    humanSupervisesThreshold: 0.4,
  },
  junior_team: {
    aiOwnedThreshold: 0.25,
    humanSupervisesThreshold: 0.5,
  },
};
```

**Function: `getThresholds(profile: PolicyProfile): PolicyThresholds`**

Returns threshold configuration for specified profile.

**Design Rationale:**
- Startup profile is more aggressive (higher thresholds = more AI ownership)
- Fintech profile is conservative (lower thresholds = more human oversight)
- Junior team profile is balanced (moderate thresholds)
- Thresholds are tunable without code changes

### Decision Engine (`/lib/scoring`)

Classifies tasks based on attributes and policy thresholds.

**Function: `classifyTask(task: ScoredTask, profile: PolicyProfile): ClassifiedTask`**

**Behavior:**
1. Calculates risk score using weighted formula
2. Retrieves thresholds for policy profile
3. Compares risk score to thresholds
4. Assigns ownership classification
5. Generates explanation referencing attributes and policy

**Risk Score Formula:**
```
riskScore = (
  ambiguity * 0.2 +
  production_risk * 0.3 +
  compliance_impact * 0.25 +
  (1 - reversibility) * 0.15 +
  cognitive_load * 0.1
)
```

**Classification Logic:**
```
if riskScore < aiOwnedThreshold:
  return AI_OWNED
else if riskScore < humanSupervisesThreshold:
  return HUMAN_SUPERVISES_AI
else:
  return HUMAN_OWNED
```

**Explanation Generation:**
- References the two highest-scoring attributes
- Mentions policy profile influence
- Example: "High production_risk (0.8) and compliance_impact (0.7) under fintech policy require human ownership"

**Design Rationale:**
- Deterministic formula ensures reproducibility
- Weighted attributes reflect relative importance
- Reversibility is inverted (low reversibility = high risk)
- Explanations build trust through transparency

### Simulation Module (`/lib/simulation`)

Calculates productivity metrics based on ownership classifications.

**Function: `simulateOutcomes(classifiedTasks: ClassifiedTask[]): SimulationResult`**

**Behavior:**
1. Calculates baseline time (all tasks as HUMAN_OWNED)
2. Calculates AI-native time with ownership-based multipliers
3. Computes throughput gain percentage
4. Computes aggregate risk delta
5. Generates deployment recommendation

**Time Calculation:**

```typescript
// Baseline: all tasks at 1.0x human speed
baselineTotalTime = sum(task.estimatedHours)

// AI-native: apply multipliers based on ownership
multipliers = {
  AI_OWNED: 0.3,              // AI completes in 30% of human time
  HUMAN_SUPERVISES_AI: 0.6,   // AI + review takes 60% of human time
  HUMAN_OWNED: 1.0,           // Human completes at normal speed
}

aiNativeTotalTime = sum(task.estimatedHours * multipliers[task.ownership])
```

**Throughput Gain:**
```
throughputGainPercent = ((baselineTotalTime - aiNativeTotalTime) / baselineTotalTime) * 100
```

**Risk Delta Calculation:**

```typescript
// Baseline risk: assume human execution has base risk
baselineRisk = sum(task.attributes.production_risk * 0.1)  // 10% of inherent risk

// AI-native risk: ownership affects risk realization
riskMultipliers = {
  AI_OWNED: 1.5,              // AI increases risk by 50%
  HUMAN_SUPERVISES_AI: 0.8,   // Supervision reduces risk by 20%
  HUMAN_OWNED: 1.0,           // Human maintains base risk
}

aiNativeRisk = sum(task.attributes.production_risk * 0.1 * riskMultipliers[task.ownership])
aggregateRiskDelta = aiNativeRisk - baselineRisk
```

**Deployment Recommendation:**

```typescript
if (throughputGainPercent > 40 && aggregateRiskDelta < 0.2):
  return "RECOMMENDED: High productivity gain with acceptable risk"
else if (throughputGainPercent > 20 && aggregateRiskDelta < 0.3):
  return "CONDITIONAL: Moderate gains, monitor risk closely"
else if (aggregateRiskDelta > 0.5):
  return "NOT RECOMMENDED: Risk increase outweighs productivity gains"
else:
  return "MARGINAL: Limited productivity benefit"
```

**Design Rationale:**
- Time multipliers reflect realistic AI productivity patterns
- Risk model accounts for AI's tendency to introduce subtle bugs
- Supervision reduces risk through human review
- Recommendation logic balances speed vs. safety

### API Route (`/api/analyze`)

Next.js API route that orchestrates the analysis pipeline.

**Endpoint: `POST /api/analyze`**

**Request Body:**
```typescript
{
  scenarioId: string;
  policyProfile: PolicyProfile;
}
```

**Response Body:**
```typescript
AnalysisResult
```

**Processing Flow:**
1. Validate request body
2. Load predefined workflow for scenarioId
3. Score tasks using LLM
4. Classify tasks using decision engine
5. Simulate outcomes
6. Return complete analysis result

**Error Handling:**
- 400 for invalid request body
- 404 for unknown scenarioId
- 500 for LLM or processing errors
- All errors return JSON with descriptive message

**Predefined Scenarios:**

```typescript
const SCENARIOS: Record<string, Workflow> = {
  'user-auth': {
    name: 'User Authentication Feature',
    tasks: [
      { id: '1', description: 'Design database schema for users', estimatedHours: 3 },
      { id: '2', description: 'Implement password hashing', estimatedHours: 2 },
      { id: '3', description: 'Create login API endpoint', estimatedHours: 4 },
      { id: '4', description: 'Add JWT token generation', estimatedHours: 3 },
      { id: '5', description: 'Write unit tests for auth', estimatedHours: 5 },
    ],
  },
  'payment-integration': {
    name: 'Payment Processing Integration',
    tasks: [
      { id: '1', description: 'Integrate Stripe API', estimatedHours: 6 },
      { id: '2', description: 'Implement webhook handlers', estimatedHours: 4 },
      { id: '3', description: 'Add payment retry logic', estimatedHours: 5 },
      { id: '4', description: 'Create refund workflow', estimatedHours: 4 },
      { id: '5', description: 'Add PCI compliance logging', estimatedHours: 3 },
    ],
  },
  'data-export': {
    name: 'Data Export Feature',
    tasks: [
      { id: '1', description: 'Design CSV export format', estimatedHours: 2 },
      { id: '2', description: 'Implement data serialization', estimatedHours: 4 },
      { id: '3', description: 'Add background job processing', estimatedHours: 5 },
      { id: '4', description: 'Create download endpoint', estimatedHours: 3 },
      { id: '5', description: 'Add export history tracking', estimatedHours: 3 },
    ],
  },
};
```

**Design Rationale:**
- Predefined scenarios eliminate input validation complexity
- Scenarios represent realistic feature development workflows
- API route is thin orchestration layer
- Error responses follow REST conventions

### UI Page (`/app/page.tsx`)

Simple React page for scenario selection and result display.

**Components:**

1. **ScenarioSelector**
   - Dropdown to select predefined scenario
   - Displays scenario name and task count

2. **PolicySelector**
   - Radio buttons for policy profile selection
   - Shows brief description of each profile

3. **AnalyzeButton**
   - Triggers API call to `/api/analyze`
   - Shows loading state during analysis

4. **ResultsDisplay**
   - Table showing classified tasks with ownership and explanation
   - Summary card with simulation metrics
   - Deployment recommendation badge

**State Management:**
```typescript
const [selectedScenario, setSelectedScenario] = useState<string>('user-auth');
const [selectedPolicy, setSelectedPolicy] = useState<PolicyProfile>('startup');
const [result, setResult] = useState<AnalysisResult | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**API Call:**
```typescript
async function handleAnalyze() {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId: selectedScenario,
        policyProfile: selectedPolicy,
      }),
    });
    if (!response.ok) throw new Error('Analysis failed');
    const data = await response.json();
    setResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

**Design Rationale:**
- Single-page application keeps navigation simple
- Client-side state sufficient for stateless app
- Loading and error states provide feedback
- Results display emphasizes actionable insights

## Data Flow

1. User selects scenario and policy profile in UI
2. UI sends POST request to `/api/analyze`
3. API route loads predefined workflow
4. Scoring module calls LLM for each task
5. Decision engine classifies tasks using policy thresholds
6. Simulation module calculates productivity metrics
7. API route returns complete analysis result
8. UI displays classified tasks and simulation results

## Non-Functional Considerations

**Performance:**
- LLM calls are sequential (no parallel optimization initially)
- Expected response time: 10-20 seconds for 5-task workflow
- No caching (stateless requirement)

**Error Handling:**
- LLM failures propagate to API with descriptive errors
- Validation errors return 400 with field-level details
- All errors logged to console for debugging

**Type Safety:**
- All module boundaries use explicit TypeScript types
- No `any` types in public interfaces
- Strict mode enabled in tsconfig.json

**Extensibility:**
- New scenarios added to SCENARIOS constant
- New policy profiles added to POLICY_PROFILES constant
- Risk formula weights can be adjusted in decision engine

## Deployment

- Next.js application deployed as single service
- Environment variable for OpenAI API key
- No database or external service dependencies
- Stateless design allows horizontal scaling

## Future Enhancements (Out of Scope)

- JSON workflow editing UI (optional feature)
- Parallel LLM calls for faster scoring
- Custom policy profile creation
- Workflow history (requires state)
- Export results to PDF/CSV
