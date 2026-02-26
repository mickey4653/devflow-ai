# DevFlow AI - Test Suite

This directory contains test files for verifying the core functionality of DevFlow AI.

## Setup

First, install the `tsx` package (if not already installed):

```bash
npm install
```

This will install `tsx` which is needed to run TypeScript files directly.

## Running Tests

### Run Individual Tests

```bash
# Test AI-suitability scoring
npm run test:scoring

# Test task classification
npm run test:classification

# Test simulation module
npm run test:simulation

# Test ownership distribution
npm run test:ownership

# Test policy profile switching
npm run test:policies
```

### Run All Tests

```bash
npm run test:all
```

## Test Files

### `test-scoring.ts`
Tests the AI-suitability scoring algorithm:
- High AI-suitability tasks (score ~0.80)
- Low AI-suitability tasks (score ~0.20)
- Moderate AI-suitability tasks (score ~0.60)
- Edge cases (all zeros, all ones)

### `test-classification.ts`
Tests task classification with different policy profiles:
- Classification with startup policy
- Classification with fintech policy
- Classification with junior team policy
- High/low suitability task classification

### `test-simulation.ts`
Tests outcome simulation:
- Baseline time calculation
- AI-native time calculation with multipliers
- Throughput gain percentage
- Risk delta calculation
- Deployment recommendations

### `test-ownership.ts`
Tests ownership distribution calculations:
- Distribution with mixed ownership types
- Edge case: empty task array
- Edge case: all same ownership type
- Percentage sum validation (should equal 100%)

### `test-policies.ts`
Tests policy profile switching:
- Threshold comparison across policies
- Boundary case testing
- Policy aggressiveness comparison
- Same task classified under different policies

## Expected Results

All tests include:
- ✓ PASS indicators for successful tests
- ✗ FAIL indicators for failed tests
- Expected values for comparison
- Detailed output for debugging

## Troubleshooting

### Error: "Cannot find module"

Make sure you're running from the project root:
```bash
cd /path/to/devflow-ai
npm run test:scoring
```

### Error: "tsx: command not found"

Install dependencies:
```bash
npm install
```

### TypeScript Errors

Make sure the project builds successfully:
```bash
npm run build
```

## Manual Testing

You can also run tests directly with tsx:

```bash
npx tsx tests/test-scoring.ts
npx tsx tests/test-classification.ts
npx tsx tests/test-simulation.ts
npx tsx tests/test-ownership.ts
npx tsx tests/test-policies.ts
```

## Adding New Tests

To add a new test file:

1. Create a new file in the `tests/` directory
2. Import the modules you want to test
3. Add test cases with console.log output
4. Add a script to `package.json`:
   ```json
   "test:mytest": "tsx tests/test-mytest.ts"
   ```
5. Run with `npm run test:mytest`

## Test Coverage

Current test coverage:
- ✅ AI-suitability scoring algorithm
- ✅ Task classification logic
- ✅ Policy profile thresholds
- ✅ Simulation calculations
- ✅ Ownership distribution
- ⏳ API endpoints (pending implementation)
- ⏳ UI components (pending implementation)
- ⏳ LLM integration (pending implementation)
