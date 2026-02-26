# LLM Integration Module

Optional OpenAI integration for task attribute scoring.

## Overview

The system uses **deterministic mock scoring by default** and optionally integrates with OpenAI's API for more sophisticated task analysis. The core decision engine remains fully deterministic and does not depend on LLM responses.

## Architecture

```
scoreTask(description)
    ↓
Is LLM enabled? (OPENAI_API_KEY set)
    ↓ YES                    ↓ NO
Call OpenAI API         Use deterministic mock
    ↓                           ↓
Success? ────NO────→ Use deterministic mock
    ↓ YES                       ↓
Return LLM scores ←──────────────┘
```

## Setup (Optional)

### 1. Get OpenAI API Key

Sign up at [platform.openai.com](https://platform.openai.com) and create an API key.

### 2. Set Environment Variable

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Restart Development Server

```bash
npm run dev
```

## Behavior

### Without API Key (Default)
- Uses **deterministic keyword-based scoring**
- Identical inputs always produce identical outputs
- No external API calls
- Perfect for demos and testing

### With API Key
- Attempts to use OpenAI API for scoring
- Falls back to deterministic mock if API fails
- More nuanced and context-aware scoring
- Slightly variable results (LLM temperature: 0.3)

## LLM Scoring Process

1. **Prompt Construction**: Task description + scoring criteria
2. **API Call**: POST to OpenAI with structured output request
3. **Response Parsing**: Extract JSON scores
4. **Schema Validation**: Verify all attributes present and in [0, 1] range
5. **Fallback**: Use deterministic mock if any step fails

## Deterministic Mock Scoring

The fallback scoring uses keyword analysis:

### High-Risk Keywords
- payment, stripe, pci, compliance, security, refund
- Scores: production_risk=0.85, compliance_impact=0.90, reversibility=0.25

### Moderate-Risk Keywords
- api, database, webhook, jwt, auth, login, password
- Scores: production_risk=0.45, compliance_impact=0.40, reversibility=0.60

### Low-Risk Keywords
- design, format, csv, test, unit, download, export
- Scores: production_risk=0.15, compliance_impact=0.15, reversibility=0.85

## API Usage

```typescript
import { scoreTask, isLLMEnabled } from '@/lib/llm';

// Check if LLM is available
if (isLLMEnabled()) {
  console.log('LLM integration enabled');
}

// Score a task (automatically uses LLM or falls back to mock)
const attributes = await scoreTask('Implement payment processing');
// Returns: TaskAttribute object
```

## Error Handling

All LLM errors are caught and logged, with automatic fallback to deterministic scoring:

- Network errors
- API rate limits
- Invalid API key
- Malformed responses
- Schema validation failures

## Cost Considerations

- Model: `gpt-4o-mini` (fast and cost-effective)
- Temperature: 0.3 (more consistent)
- Max tokens: 200 per request
- Typical cost: ~$0.0001 per task

For a 5-task workflow: ~$0.0005 per analysis

## Testing

Test with deterministic mock (no API key needed):
```bash
npm run test:all
```

Test with LLM (requires API key):
```bash
OPENAI_API_KEY=sk-... npm run dev
```

## Security

- API key stored in environment variable (never committed)
- No API key = system still works with deterministic mock
- All API calls use HTTPS
- No sensitive data sent to OpenAI (only task descriptions)

## Limitations

- LLM scoring is not deterministic (slight variations possible)
- Requires internet connection
- Subject to OpenAI rate limits
- Adds latency (~1-2 seconds per task)

## Recommendation

For **demos and testing**: Use deterministic mock (no API key)
For **production**: Enable LLM for better accuracy
