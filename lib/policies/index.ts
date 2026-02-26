import { PolicyProfile } from '@/types';

export type PolicyThresholds = {
  aiOwnedThreshold: number;      // At or above this = AI_OWNED
  humanSupervisesThreshold: number;  // At or above this = HUMAN_SUPERVISES_AI
  // Below humanSupervisesThreshold = HUMAN_OWNED
};

export const POLICY_PROFILES: Record<PolicyProfile, PolicyThresholds> = {
  startup: {
    aiOwnedThreshold: 0.7,
    humanSupervisesThreshold: 0.5,
  },
  fintech: {
    aiOwnedThreshold: 0.8,
    humanSupervisesThreshold: 0.65,
  },
  junior_team: {
    aiOwnedThreshold: 0.75,
    humanSupervisesThreshold: 0.55,
  },
};

export function getThresholds(profile: PolicyProfile): PolicyThresholds {
  return POLICY_PROFILES[profile];
}
