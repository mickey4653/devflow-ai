import { NextRequest, NextResponse } from 'next/server';
import { classifyTask } from '@/lib/scoring/decision';
import { simulateOutcomes } from '@/lib/simulation';
import { calculateOwnershipDistribution } from '@/lib/analysis';
import { scoreTask } from '@/lib/llm';
import { 
  Workflow, 
  PolicyProfile, 
  AnalysisResult, 
  ScoredTask,
} from '@/types';

// Predefined workflow scenarios
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

/**
 * POST /api/analyze
 * Analyzes a workflow scenario with a given policy profile
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { scenarioId, policyProfile } = body;

    // Validate scenarioId
    if (!scenarioId || typeof scenarioId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid scenarioId' },
        { status: 400 }
      );
    }

    // Validate policyProfile
    const validPolicies: PolicyProfile[] = ['startup', 'fintech', 'junior_team'];
    if (!policyProfile || !validPolicies.includes(policyProfile)) {
      return NextResponse.json(
        { error: 'Missing or invalid policyProfile. Must be one of: startup, fintech, junior_team' },
        { status: 400 }
      );
    }

    // Load workflow scenario
    const workflow = SCENARIOS[scenarioId];
    if (!workflow) {
      return NextResponse.json(
        { error: `Scenario '${scenarioId}' not found. Available scenarios: ${Object.keys(SCENARIOS).join(', ')}` },
        { status: 404 }
      );
    }

    // Score tasks (uses LLM if available, otherwise deterministic mock)
    const scoringResults = await Promise.all(
      workflow.tasks.map(async (task) => ({
        task,
        result: await scoreTask(task.description),
      }))
    );

    // Extract scoring method (all tasks use the same method)
    const scoringMethod = scoringResults[0]?.result.method || 'deterministic-mock';

    // Build scored tasks
    const scoredTasks: ScoredTask[] = scoringResults.map(({ task, result }) => ({
      ...task,
      attributes: result.attributes,
    }));

    // Classify tasks using decision engine
    const classifiedTasks = scoredTasks.map(task => 
      classifyTask(task, policyProfile)
    );

    // Run simulation
    const simulation = simulateOutcomes(classifiedTasks);

    // Calculate ownership distribution
    const ownershipDistribution = calculateOwnershipDistribution(classifiedTasks);

    // Build analysis result
    const analysisResult: AnalysisResult = {
      workflow,
      classifiedTasks,
      simulation,
      ownershipDistribution,
      policyProfile,
      scoringMethod,
    };

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
