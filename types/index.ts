// Core domain types

export type TaskAttribute = {
  ambiguity: number;           // 0-1
  production_risk: number;     // 0-1
  compliance_impact: number;   // 0-1
  reversibility: number;       // 0-1
  cognitive_load: number;      // 0-1
};

export type OwnershipClassification = 'AI_OWNED' | 'HUMAN_SUPERVISES_AI' | 'HUMAN_OWNED';

export type Task = {
  id: string;
  description: string;
  estimatedHours: number;
};

export type ScoredTask = Task & {
  attributes: TaskAttribute;
};

export type ClassifiedTask = ScoredTask & {
  ownership: OwnershipClassification;
  explanation: string;
};

export type Workflow = {
  name: string;
  tasks: Task[];
};

export type PolicyProfile = 'startup' | 'fintech' | 'junior_team';

export type OwnershipDistribution = {
  aiOwnedPercent: number;
  humanSupervisesPercent: number;
  humanOwnedPercent: number;
};

export type SimulationResult = {
  baselineTotalTime: number;
  aiNativeTotalTime: number;
  throughputGainPercent: number;
  aggregateRiskDelta: number;
  deploymentRecommendation: string;
};

export type AnalysisResult = {
  workflow: Workflow;
  classifiedTasks: ClassifiedTask[];
  simulation: SimulationResult;
  ownershipDistribution: OwnershipDistribution;
  policyProfile: PolicyProfile;
  scoringMethod?: 'llm' | 'deterministic-mock';
};
