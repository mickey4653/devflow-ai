# Implementation Plan: DevFlow AI

## Overview

This implementation plan builds DevFlow AI incrementally, starting with core types and data structures, then implementing the policy and decision logic, followed by simulation capabilities, and finally the API and UI layers. LLM integration is excluded from this phase - mocked TaskAttribute data will be used for testing.

## Tasks

- [x] 1. Set up project structure and core types
  - Initialize Next.js TypeScript project with strict mode
  - Create directory structure: `/types`, `/lib/scoring`, `/lib/policies`, `/lib/simulation`, `/api/analyze`, `/app`
  - Define all TypeScript types in `/types/index.ts`: TaskAttribute, OwnershipClassification, Task, ScoredTask, ClassifiedTask, Workflow, PolicyProfile, SimulationResult, AnalysisResult
  - Configure tsconfig.json with strict mode and path aliases
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 2. Implement policy profiles module
  - [x] 2.1 Create policy types and constants
    - Define PolicyThresholds type in `/lib/policies/index.ts`
    - Implement POLICY_PROFILES constant with startup, fintech, and junior_team configurations
    - Implement getThresholds function to retrieve thresholds by profile
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_
  
  - [ ]* 2.2 Write unit tests for policy module
    - Test getThresholds returns correct values for each profile
    - Test threshold ordering (aiOwnedThreshold < humanSupervisesThreshold)
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Implement decision engine
  - [x] 3.1 Create risk score calculation
    - Implement calculateRiskScore function in `/lib/scoring/decision.ts`
    - Apply weighted formula: ambiguity(0.2) + production_risk(0.3) + compliance_impact(0.25) + (1-reversibility)(0.15) + cognitive_load(0.1)
    - Validate output is in [0, 1] range
    - _Requirements: 3.1, 3.4_
  
  - [ ]* 3.2 Write unit tests for risk calculation
    - Test risk score with known attribute values
    - Test reversibility inversion logic
    - Test boundary cases (all 0s, all 1s)
    - _Requirements: 3.1, 3.4_
  
  - [x] 3.3 Implement task classification logic
    - Implement classifyTask function in `/lib/scoring/decision.ts`
    - Apply threshold comparison logic to determine ownership
    - Ensure deterministic classification for identical inputs
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.4 Implement explanation generation
    - Create generateExplanation function that identifies top 2 attributes
    - Generate human-readable explanation referencing attributes and policy
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ]* 3.5 Write unit tests for classification
    - Test classification with different risk scores and policies
    - Test explanation includes attribute references
    - Test explanation reflects policy profile
    - _Requirements: 3.2, 3.3, 3.4, 11.1, 11.2, 11.3_

- [ ] 4. Checkpoint - Ensure decision engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement simulation module
  - [x] 5.1 Create baseline time calculation
    - Implement calculateBaselineTime function in `/lib/simulation/index.ts`
    - Sum all task estimatedHours
    - _Requirements: 5.1_
  
  - [x] 5.2 Create AI-native time calculation
    - Implement calculateAiNativeTime function with ownership multipliers
    - Use multipliers: AI_OWNED(0.3), HUMAN_SUPERVISES_AI(0.6), HUMAN_OWNED(1.0)
    - _Requirements: 5.2_
  
  - [x] 5.3 Implement throughput gain calculation
    - Calculate percentage gain: ((baseline - aiNative) / baseline) * 100
    - _Requirements: 5.3_
  
  - [x] 5.4 Implement risk delta calculation
    - Calculate baseline risk with 10% base risk multiplier
    - Calculate AI-native risk with ownership multipliers: AI_OWNED(1.5), HUMAN_SUPERVISES_AI(0.8), HUMAN_OWNED(1.0)
    - Compute aggregate risk delta
    - _Requirements: 5.4_
  
  - [x] 5.5 Implement deployment recommendation logic
    - Apply decision rules based on throughput gain and risk delta
    - Return one of four recommendation levels
    - _Requirements: 5.5_
  
  - [x] 5.6 Create simulateOutcomes orchestration function
    - Combine all calculation functions into single simulateOutcomes function
    - Return complete SimulationResult object
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 5.7 Write unit tests for simulation
    - Test time calculations with known task sets
    - Test risk delta with various ownership distributions
    - Test recommendation logic boundary conditions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Checkpoint - Ensure simulation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create mock scoring module
  - [ ] 7.1 Implement mock task scoring
    - Create scoreTasks function in `/lib/scoring/index.ts` that returns mocked TaskAttribute data
    - Use realistic mock values for testing (vary by task description keywords)
    - Validate all mock scores are in [0, 1] range
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 7.2 Write unit tests for mock scoring
    - Test scoreTasks returns valid TaskAttribute objects
    - Test schema validation catches invalid scores
    - _Requirements: 2.6, 2.7, 2.8_

- [ ] 8. Implement predefined scenarios
  - [ ] 8.1 Create scenarios data structure
    - Define SCENARIOS constant in `/api/analyze/scenarios.ts`
    - Implement three scenarios: user-auth, payment-integration, data-export
    - Each scenario includes name and 5 tasks with descriptions and estimated hours
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 8.2 Write unit tests for scenarios
    - Test all scenarios have required fields
    - Test task IDs are unique within scenarios
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 9. Implement API route
  - [ ] 9.1 Create API route handler
    - Implement POST handler in `/app/api/analyze/route.ts`
    - Validate request body (scenarioId, policyProfile)
    - Return 400 for invalid requests, 404 for unknown scenarios
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [ ] 9.2 Implement analysis orchestration
    - Load workflow from SCENARIOS
    - Call scoreTasks (mocked)
    - Call classifyTask for each scored task
    - Call simulateOutcomes
    - Return complete AnalysisResult
    - _Requirements: 1.2, 1.3, 3.1, 4.5, 5.1, 6.1, 6.5_
  
  - [ ] 9.3 Add error handling
    - Catch and format errors with descriptive messages
    - Return appropriate HTTP status codes
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 9.4 Write integration tests for API route
    - Test successful analysis flow
    - Test error cases (invalid scenario, invalid policy)
    - Test response format matches AnalysisResult type
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Checkpoint - Ensure API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement UI components
  - [ ] 11.1 Create scenario selector component
    - Build dropdown component for scenario selection
    - Display scenario name and task count
    - _Requirements: 1.1, 1.2, 8.5_
  
  - [ ] 11.2 Create policy selector component
    - Build radio button group for policy profile selection
    - Add descriptions for each profile
    - _Requirements: 4.1, 4.2, 4.3, 8.5_
  
  - [ ] 11.3 Create analyze button component
    - Implement button that triggers API call
    - Show loading state during analysis
    - Handle and display errors
    - _Requirements: 8.4, 8.5_
  
  - [ ] 11.4 Create results display component
    - Build table showing classified tasks with ownership and explanation
    - Display simulation metrics in summary card
    - Show deployment recommendation with visual badge
    - _Requirements: 3.2, 5.1, 5.2, 5.3, 5.4, 5.5, 8.2, 8.5, 11.1_
  
  - [ ] 11.5 Integrate components in main page
    - Wire up state management in `/app/page.tsx`
    - Implement API call logic with fetch
    - Connect all components with proper props
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 8.1, 8.2, 8.5_

- [ ] 12. Add basic styling
  - [ ] 12.1 Style UI components
    - Add Tailwind CSS classes for layout and spacing
    - Style tables, buttons, and form elements
    - Add loading and error state styling
    - _Requirements: 8.5_
  
  - [ ] 12.2 Add responsive design
    - Ensure UI works on mobile and desktop
    - Test layout at different screen sizes
    - _Requirements: 8.5_

- [ ] 13. Final checkpoint and validation
  - Run full application locally
  - Test all three scenarios with all three policy profiles
  - Verify results display correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- LLM integration is explicitly excluded - mock data is used for task scoring
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Implementation follows the design document's architecture
- Focus on type safety and deterministic behavior
