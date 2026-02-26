import { TaskAttribute } from '@/types';

/**
 * OpenAI API configuration
 * Set OPENAI_API_KEY environment variable to enable LLM scoring
 */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // Fast and cost-effective model

/**
 * Check if LLM integration is enabled
 */
export function isLLMEnabled(): boolean {
  return !!OPENAI_API_KEY;
}

/**
 * Score a task using OpenAI API
 * Returns TaskAttribute scores or null if LLM call fails
 */
export async function scoreTaskWithLLM(
  taskDescription: string
): Promise<TaskAttribute | null> {
  if (!OPENAI_API_KEY) {
    return null;
  }

  try {
    const prompt = `Analyze this development task and score it on five attributes (0-1 scale):

Task: "${taskDescription}"

Provide scores for:
- production_risk: Risk of production issues or bugs (0=no risk, 1=critical risk)
- compliance_impact: Impact on security, privacy, or regulations (0=none, 1=critical)
- reversibility: How easy to undo if wrong (0=irreversible, 1=easily reversible)
- ambiguity: How unclear or vague the requirement is (0=crystal clear, 1=very vague)
- cognitive_load: Mental effort required (0=trivial, 1=extremely complex)

Return ONLY a JSON object with these exact keys and numeric values between 0 and 1.
Example: {"production_risk": 0.3, "compliance_impact": 0.2, "reversibility": 0.8, "ambiguity": 0.1, "cognitive_load": 0.4}`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineering analyst. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Low temperature for more consistent results
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response');
      return null;
    }

    // Parse JSON response
    const scores = JSON.parse(content.trim());

    // Validate schema
    const requiredKeys: (keyof TaskAttribute)[] = [
      'production_risk',
      'compliance_impact',
      'reversibility',
      'ambiguity',
      'cognitive_load',
    ];

    for (const key of requiredKeys) {
      if (typeof scores[key] !== 'number' || scores[key] < 0 || scores[key] > 1) {
        console.error(`Invalid score for ${key}:`, scores[key]);
        return null;
      }
    }

    return scores as TaskAttribute;
  } catch (error) {
    console.error('LLM scoring error:', error);
    return null;
  }
}
