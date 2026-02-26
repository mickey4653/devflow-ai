import { TaskAttribute, ScoredTask, ClassifiedTask, PolicyProfile, OwnershipClassification } from '@/types';
import { getThresholds } from '@/lib/policies';

/**
 * Calculates an AI-suitability score for a task based on its attributes.
 * 
 * The AI-suitability score measures how suitable a task is for AI ownership.
 * Higher scores indicate better suitability for AI automation.
 * 
 * Formula:
 * - (1 - production_risk): 30% weight
 * - (1 - compliance_impact): 25% weight
 * - reversibility: 20% weight
 * - (1 - ambiguity): 15% weight
 * - (1 - cognitive_load): 10% weight
 * 
 * @param attributes - The task attributes to score
 * @returns An AI-suitability score in the range [0, 1]
 */
export function calculateAiSuitabilityScore(attributes: TaskAttribute): number {
  const aiSuitabilityScore = (
    (1 - attributes.production_risk) * 0.30 +
    (1 - attributes.compliance_impact) * 0.25 +
    attributes.reversibility * 0.20 +
    (1 - attributes.ambiguity) * 0.15 +
    (1 - attributes.cognitive_load) * 0.10
  );

  // Validate output is in [0, 1] range
  if (aiSuitabilityScore < 0 || aiSuitabilityScore > 1) {
    throw new Error(`AI-suitability score ${aiSuitabilityScore} is outside valid range [0, 1]`);
  }

  return aiSuitabilityScore;
}
/**
 * Generates a human-readable explanation for a task classification.
 *
 * The explanation references the two highest contributing attributes to the
 * AI-suitability score and mentions the policy profile influence.
 *
 * @param attributes - The task attributes
 * @param ownership - The ownership classification
 * @param profile - The policy profile applied
 * @returns A human-readable explanation string
 */
function generateExplanation(
  attributes: TaskAttribute,
  ownership: OwnershipClassification,
  profile: PolicyProfile
): string {
  // Calculate contribution of each attribute to AI-suitability score
  // Higher contribution = more favorable for AI ownership
  const attributeContributions: Array<{ name: string; contribution: number; displayValue: number }> = [
    { 
      name: 'production_risk', 
      contribution: (1 - attributes.production_risk) * 0.30,
      displayValue: attributes.production_risk 
    },
    { 
      name: 'compliance_impact', 
      contribution: (1 - attributes.compliance_impact) * 0.25,
      displayValue: attributes.compliance_impact 
    },
    { 
      name: 'reversibility', 
      contribution: attributes.reversibility * 0.20,
      displayValue: attributes.reversibility 
    },
    { 
      name: 'ambiguity', 
      contribution: (1 - attributes.ambiguity) * 0.15,
      displayValue: attributes.ambiguity 
    },
    { 
      name: 'cognitive_load', 
      contribution: (1 - attributes.cognitive_load) * 0.10,
      displayValue: attributes.cognitive_load 
    },
  ];

  // Sort by contribution (descending) to get top 2 contributors
  attributeContributions.sort((a, b) => b.contribution - a.contribution);

  // Get top 2 attributes
  const top1 = attributeContributions[0];
  const top2 = attributeContributions[1];

  // Format attribute names for display
  const formatAttributeName = (name: string): string => {
    return name.replace(/_/g, ' ');
  };

  // Build explanation based on ownership
  let explanation = '';

  if (ownership === 'AI_OWNED') {
    explanation = `High AI-suitability: low ${formatAttributeName(top1.name)} (${top1.displayValue.toFixed(2)}) and ${formatAttributeName(top2.name)} (${top2.displayValue.toFixed(2)}) under ${profile} policy`;
  } else if (ownership === 'HUMAN_SUPERVISES_AI') {
    explanation = `Moderate AI-suitability: ${formatAttributeName(top1.name)} (${top1.displayValue.toFixed(2)}) and ${formatAttributeName(top2.name)} (${top2.displayValue.toFixed(2)}) under ${profile} policy require supervision`;
  } else {
    explanation = `Low AI-suitability: high ${formatAttributeName(top1.name)} (${top1.displayValue.toFixed(2)}) and ${formatAttributeName(top2.name)} (${top2.displayValue.toFixed(2)}) under ${profile} policy require human ownership`;
  }

  return explanation;
}

/**
 * Classifies a task based on its AI-suitability score and policy profile.
 * 
 * Classification logic:
 * - If score >= aiOwnedThreshold: AI_OWNED
 * - If score >= humanSupervisesThreshold: HUMAN_SUPERVISES_AI
 * - Otherwise: HUMAN_OWNED
 * 
 * @param task - The scored task to classify
 * @param profile - The policy profile to apply
 * @returns A classified task with ownership and explanation
 */
export function classifyTask(task: ScoredTask, profile: PolicyProfile): ClassifiedTask {
  // Calculate AI-suitability score
  const aiSuitabilityScore = calculateAiSuitabilityScore(task.attributes);
  
  // Get thresholds for the policy profile
  const thresholds = getThresholds(profile);
  
  // Determine ownership classification
  let ownership: OwnershipClassification;
  if (aiSuitabilityScore >= thresholds.aiOwnedThreshold) {
    ownership = 'AI_OWNED';
  } else if (aiSuitabilityScore >= thresholds.humanSupervisesThreshold) {
    ownership = 'HUMAN_SUPERVISES_AI';
  } else {
    ownership = 'HUMAN_OWNED';
  }
  
  // Generate explanation using the generateExplanation function
  const explanation = generateExplanation(task.attributes, ownership, profile);
  
  return {
    ...task,
    ownership,
    explanation,
  };
}
