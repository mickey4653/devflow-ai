import { TaskAttribute } from '@/types';
import { scoreTaskWithLLM, isLLMEnabled } from './openai';
import { deterministicMockScore } from '../scoring/mock';

/**
 * Score a task using LLM if available, otherwise fall back to deterministic mock
 * This ensures the system always works, even without LLM API access
 * Returns both the score and the method used
 */
export async function scoreTask(taskDescription: string): Promise<{ 
  attributes: TaskAttribute; 
  method: 'llm' | 'deterministic-mock' 
}> {
  // Try LLM scoring first if enabled
  if (isLLMEnabled()) {
    console.log('🤖 LLM enabled - attempting OpenAI scoring for:', taskDescription);
    const llmScore = await scoreTaskWithLLM(taskDescription);
    if (llmScore) {
      console.log('✅ LLM scoring successful');
      return { attributes: llmScore, method: 'llm' };
    }
    // If LLM fails, fall through to deterministic mock
    console.log('⚠️ LLM scoring failed, falling back to deterministic mock');
  } else {
    console.log('📋 LLM not enabled - using deterministic mock scoring');
  }

  // Fall back to deterministic mock scoring
  return { attributes: deterministicMockScore(taskDescription), method: 'deterministic-mock' };
}

/**
 * Check if LLM integration is available
 */
export { isLLMEnabled } from './openai';
