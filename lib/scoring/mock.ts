import { TaskAttribute } from '@/types';

/**
 * Deterministic mock task scoring function
 * Generates consistent scores based on task description keywords
 * No randomness - identical inputs always produce identical outputs
 */
export function deterministicMockScore(description: string): TaskAttribute {
  const lowerDesc = description.toLowerCase();
  
  // Calculate keyword scores (deterministic)
  const keywordScores = {
    // High-risk keywords
    payment: lowerDesc.includes('payment') ? 0.9 : 0,
    stripe: lowerDesc.includes('stripe') ? 0.85 : 0,
    pci: lowerDesc.includes('pci') ? 0.95 : 0,
    compliance: lowerDesc.includes('compliance') ? 0.9 : 0,
    security: lowerDesc.includes('security') ? 0.85 : 0,
    refund: lowerDesc.includes('refund') ? 0.75 : 0,
    
    // Moderate-risk keywords
    api: lowerDesc.includes('api') ? 0.4 : 0,
    database: lowerDesc.includes('database') ? 0.45 : 0,
    schema: lowerDesc.includes('schema') ? 0.4 : 0,
    webhook: lowerDesc.includes('webhook') ? 0.5 : 0,
    jwt: lowerDesc.includes('jwt') ? 0.45 : 0,
    token: lowerDesc.includes('token') ? 0.4 : 0,
    auth: lowerDesc.includes('auth') ? 0.5 : 0,
    login: lowerDesc.includes('login') ? 0.45 : 0,
    password: lowerDesc.includes('password') ? 0.5 : 0,
    hashing: lowerDesc.includes('hashing') ? 0.35 : 0,
    retry: lowerDesc.includes('retry') ? 0.45 : 0,
    background: lowerDesc.includes('background') ? 0.4 : 0,
    job: lowerDesc.includes('job') ? 0.4 : 0,
    processing: lowerDesc.includes('processing') ? 0.45 : 0,
    
    // Low-risk keywords
    design: lowerDesc.includes('design') ? 0.15 : 0,
    format: lowerDesc.includes('format') ? 0.1 : 0,
    csv: lowerDesc.includes('csv') ? 0.1 : 0,
    test: lowerDesc.includes('test') ? 0.15 : 0,
    unit: lowerDesc.includes('unit') ? 0.1 : 0,
    download: lowerDesc.includes('download') ? 0.2 : 0,
    export: lowerDesc.includes('export') ? 0.25 : 0,
    history: lowerDesc.includes('history') ? 0.15 : 0,
    tracking: lowerDesc.includes('tracking') ? 0.2 : 0,
    serialization: lowerDesc.includes('serialization') ? 0.3 : 0,
  };
  
  // Calculate aggregate risk level
  const maxKeywordScore = Math.max(...Object.values(keywordScores));
  const avgKeywordScore = Object.values(keywordScores).reduce((a, b) => a + b, 0) / Object.keys(keywordScores).length;
  
  // Determine category
  const isHighRisk = maxKeywordScore >= 0.7;
  const isModerateRisk = maxKeywordScore >= 0.35 && maxKeywordScore < 0.7;
  const isLowRisk = maxKeywordScore < 0.35;
  
  // Return deterministic scores based on category
  if (isHighRisk) {
    return {
      production_risk: 0.85,
      compliance_impact: 0.90,
      reversibility: 0.25,
      ambiguity: 0.35,
      cognitive_load: 0.75,
    };
  } else if (isModerateRisk) {
    return {
      production_risk: 0.45,
      compliance_impact: 0.40,
      reversibility: 0.60,
      ambiguity: 0.40,
      cognitive_load: 0.50,
    };
  } else {
    return {
      production_risk: 0.15,
      compliance_impact: 0.15,
      reversibility: 0.85,
      ambiguity: 0.20,
      cognitive_load: 0.25,
    };
  }
}
