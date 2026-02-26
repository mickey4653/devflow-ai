import { calculateRiskScore, classifyTask } from './decision';
import { ScoredTask, TaskAttribute } from '@/types';

describe('classifyTask', () => {
  const createScoredTask = (attributes: TaskAttribute): ScoredTask => ({
    id: '1',
    description: 'Test task',
    estimatedHours: 5,
    attributes,
  });

  describe('startup policy', () => {
    it('should classify low risk task as AI_OWNED', () => {
      const task = createScoredTask({
        ambiguity: 0.1,
        production_risk: 0.1,
        compliance_impact: 0.1,
        reversibility: 0.9,
        cognitive_load: 0.1,
      });

      const result = classifyTask(task, 'startup');
      
      expect(result.ownership).toBe('AI_OWNED');
      expect(result.explanation).toContain('startup');
    });

    it('should classify medium risk task as HUMAN_SUPERVISES_AI', () => {
      const task = createScoredTask({
        ambiguity: 0.4,
        production_risk: 0.4,
        compliance_impact: 0.4,
        reversibility: 0.6,
        cognitive_load: 0.4,
      });

      const result = classifyTask(task, 'startup');
      
      expect(result.ownership).toBe('HUMAN_SUPERVISES_AI');
    });

    it('should classify high risk task as HUMAN_OWNED', () => {
      const task = createScoredTask({
        ambiguity: 0.8,
        production_risk: 0.8,
        compliance_impact: 0.8,
        reversibility: 0.2,
        cognitive_load: 0.8,
      });

      const result = classifyTask(task, 'startup');
      
      expect(result.ownership).toBe('HUMAN_OWNED');
    });
  });

  describe('fintech policy', () => {
    it('should be more conservative than startup', () => {
      const task = createScoredTask({
        ambiguity: 0.25,
        production_risk: 0.25,
        compliance_impact: 0.25,
        reversibility: 0.75,
        cognitive_load: 0.25,
      });

      const startupResult = classifyTask(task, 'startup');
      const fintechResult = classifyTask(task, 'fintech');
      
      // Same task should get more conservative classification in fintech
      expect(startupResult.ownership).toBe('AI_OWNED');
      expect(fintechResult.ownership).toBe('HUMAN_SUPERVISES_AI');
    });
  });

  describe('deterministic behavior', () => {
    it('should produce identical classifications for identical inputs', () => {
      const task = createScoredTask({
        ambiguity: 0.5,
        production_risk: 0.5,
        compliance_impact: 0.5,
        reversibility: 0.5,
        cognitive_load: 0.5,
      });

      const result1 = classifyTask(task, 'junior_team');
      const result2 = classifyTask(task, 'junior_team');
      
      expect(result1.ownership).toBe(result2.ownership);
      expect(result1.explanation).toBe(result2.explanation);
    });
  });

  describe('preserves task properties', () => {
    it('should include all original task properties', () => {
      const task = createScoredTask({
        ambiguity: 0.3,
        production_risk: 0.3,
        compliance_impact: 0.3,
        reversibility: 0.7,
        cognitive_load: 0.3,
      });

      const result = classifyTask(task, 'startup');
      
      expect(result.id).toBe(task.id);
      expect(result.description).toBe(task.description);
      expect(result.estimatedHours).toBe(task.estimatedHours);
      expect(result.attributes).toEqual(task.attributes);
    });
  });
});
