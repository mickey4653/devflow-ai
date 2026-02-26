# Scoring Method Comparison

## Visual Differences

### In the UI

**Deterministic Mock (Default)**:
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Deterministic Mock Scoring                          │
│ Task attributes scored using deterministic keyword-    │
│ based logic (always identical)                         │
│ 💡 Tip: Add OPENAI_API_KEY to .env.local to enable    │
│    LLM scoring                                         │
└─────────────────────────────────────────────────────────┘
```
- Gray background
- Clipboard emoji
- Shows tip to enable LLM

**LLM Scoring (With API Key)**:
```
┌─────────────────────────────────────────────────────────┐
│ 🤖 LLM Scoring Active                                  │
│ Task attributes scored using OpenAI API (context-      │
│ aware, slightly variable)                              │
└─────────────────────────────────────────────────────────┘
```
- Blue background
- Robot emoji
- No tip (already enabled)

## Score Differences

### Example: "Integrate Stripe API"

**Deterministic Mock** (Always the same):
```json
{
  "production_risk": 0.85,
  "compliance_impact": 0.90,
  "reversibility": 0.25,
  "ambiguity": 0.35,
  "cognitive_load": 0.75
}
```
- Fixed values based on "stripe" keyword
- Run it 100 times → Same scores every time
- AI-suitability score: Always 0.2425

**LLM Scoring** (Slightly variable):
```json
// Run 1:
{
  "production_risk": 0.82,
  "compliance_impact": 0.88,
  "reversibility": 0.28,
  "ambiguity": 0.32,
  "cognitive_load": 0.73
}

// Run 2:
{
  "production_risk": 0.87,
  "compliance_impact": 0.91,
  "reversibility": 0.23,
  "ambiguity": 0.38,
  "cognitive_load": 0.78
}
```
- Slightly different each time (temperature: 0.3)
- More nuanced and context-aware
- AI-suitability score: Varies slightly (0.24-0.26 range)

### Example: "Write unit tests for auth"

**Deterministic Mock**:
```json
{
  "production_risk": 0.15,
  "compliance_impact": 0.15,
  "reversibility": 0.85,
  "ambiguity": 0.20,
  "cognitive_load": 0.25
}
```
- Based on "test" keyword → Low risk category
- Always identical

**LLM Scoring**:
```json
{
  "production_risk": 0.12,
  "compliance_impact": 0.18,
  "reversibility": 0.88,
  "ambiguity": 0.15,
  "cognitive_load": 0.22
}
```
- Considers "auth" context (slightly higher compliance)
- More granular scores

## Behavioral Differences

### Deterministic Mock

**Pros**:
- ✅ Instant results (no API call)
- ✅ 100% reproducible
- ✅ No cost
- ✅ Works offline
- ✅ Perfect for demos and testing

**Cons**:
- ❌ Only 3 score patterns (High/Moderate/Low)
- ❌ Keyword-based only
- ❌ Doesn't understand context
- ❌ Less nuanced

**How it works**:
1. Scans task description for keywords
2. Finds highest-priority keyword
3. Returns fixed scores for that category

**Keywords**:
- High risk: payment, stripe, pci, compliance, security
- Moderate risk: api, database, webhook, jwt, auth
- Low risk: design, format, csv, test, unit

### LLM Scoring

**Pros**:
- ✅ Context-aware analysis
- ✅ More nuanced scores
- ✅ Understands task complexity
- ✅ Better accuracy

**Cons**:
- ❌ Requires API key
- ❌ Costs money (~$0.0001 per task)
- ❌ Slightly variable results
- ❌ Slower (~1-2 seconds per task)
- ❌ Requires internet

**How it works**:
1. Sends task description to OpenAI
2. AI analyzes full context
3. Returns nuanced scores
4. Falls back to deterministic if fails

## How to Test Both

### Test Deterministic (Current State)

1. Make sure `.env.local` doesn't have `OPENAI_API_KEY`
2. Run: `npm run dev`
3. Analyze "Payment Processing Integration"
4. Note the exact scores
5. Analyze again → **Scores are identical**

### Test LLM (If You Have API Key)

1. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key
   ```
2. Restart: `npm run dev`
3. Analyze "Payment Processing Integration"
4. Note the scores
5. Analyze again → **Scores are slightly different**

## Classification Impact

### Does scoring method affect final classification?

**Usually No** - Both methods produce similar classifications:

Example: "Integrate Stripe API" with Fintech policy
- **Deterministic**: production_risk=0.85 → AI-suitability=0.24 → HUMAN_OWNED
- **LLM**: production_risk=0.82 → AI-suitability=0.26 → HUMAN_OWNED
- **Result**: Same classification ✓

### When might they differ?

**Edge cases near thresholds**:

Example: Task with AI-suitability score near 0.65 (Fintech threshold)
- **Deterministic**: Might score exactly 0.64 → HUMAN_OWNED
- **LLM**: Might score 0.66 → HUMAN_SUPERVISES_AI
- **Result**: Different classification (rare)

## Recommendation

### For Your Submission

**Use Deterministic Mock**:
- ✅ Fully reproducible results
- ✅ No API key needed
- ✅ Instant demonstration
- ✅ No cost concerns
- ✅ Works anywhere

### For Production

**Enable LLM**:
- ✅ More accurate scoring
- ✅ Better handles edge cases
- ✅ Context-aware analysis
- ✅ Still has fallback

## Quick Comparison Table

| Feature | Deterministic Mock | LLM Scoring |
|---------|-------------------|-------------|
| **Reproducibility** | 100% identical | ~95% similar |
| **Speed** | Instant | 1-2 seconds |
| **Cost** | Free | ~$0.0001/task |
| **Accuracy** | Good | Better |
| **Setup** | None | API key needed |
| **Offline** | ✅ Yes | ❌ No |
| **Demo-ready** | ✅ Yes | ⚠️ Requires key |
| **Context-aware** | ❌ No | ✅ Yes |
| **Fallback** | N/A | ✅ To deterministic |

## Console Output Comparison

### Deterministic Mock
```
📋 LLM not enabled - using deterministic mock scoring
📋 LLM not enabled - using deterministic mock scoring
📋 LLM not enabled - using deterministic mock scoring
...
```

### LLM Scoring
```
🤖 LLM enabled - attempting OpenAI scoring for: Integrate Stripe API
✅ LLM scoring successful
🤖 LLM enabled - attempting OpenAI scoring for: Implement webhook handlers
✅ LLM scoring successful
🤖 LLM enabled - attempting OpenAI scoring for: Add payment retry logic
✅ LLM scoring successful
...
```

### LLM with Fallback
```
🤖 LLM enabled - attempting OpenAI scoring for: Integrate Stripe API
⚠️ LLM scoring failed, falling back to deterministic mock
📋 Using deterministic mock scoring
...
```

## Summary

**You can tell them apart by**:
1. 📋 vs 🤖 icon in UI
2. Gray vs Blue background
3. Console log messages
4. Score variability (run twice and compare)
5. Response time (instant vs 1-2 seconds)
6. `scoringMethod` field in API response

**For your demo**: Stick with deterministic mock - it's perfect for showing consistent, reproducible results!
