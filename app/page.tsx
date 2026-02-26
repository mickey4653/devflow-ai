'use client';

import { useState } from 'react';
import { AnalysisResult, PolicyProfile } from '@/types';
import { OwnershipDistributionDisplay } from './components/OwnershipDistribution';

// Predefined scenarios (will be moved to API later)
const SCENARIOS = {
  'user-auth': 'User Authentication Feature',
  'payment-integration': 'Payment Processing Integration',
  'data-export': 'Data Export Feature',
};

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<string>('user-auth');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyProfile>('startup');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          policyProfile: selectedPolicy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
          DevFlow AI
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Developer Productivity Decision Engine
        </p>
      </div>

      {/* Input Section */}
      <div style={{ 
        padding: '24px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
          Configure Analysis
        </h2>

        {/* Scenario Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Select Workflow Scenario
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              color: '#111827'
            }}
          >
            {Object.entries(SCENARIOS).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Policy Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#374151' }}>
            Select Policy Profile
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { value: 'startup', label: 'Startup', description: 'Fast iteration, higher AI adoption' },
              { value: 'fintech', label: 'Fintech', description: 'Conservative, compliance-focused' },
              { value: 'junior_team', label: 'Junior Team', description: 'Balanced, learning-oriented' },
            ].map((policy) => (
              <label
                key={policy.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px',
                  border: selectedPolicy === policy.value ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedPolicy === policy.value ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="policy"
                  value={policy.value}
                  checked={selectedPolicy === policy.value}
                  onChange={(e) => setSelectedPolicy(e.target.value as PolicyProfile)}
                  style={{ marginTop: '2px', marginRight: '12px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                    {policy.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {policy.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 24px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Workflow'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                Analysis Failed
              </div>
              <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Analyzing workflow with {selectedPolicy} policy...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div>
          {/* Scoring Method Indicator */}
          <div style={{
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: result.scoringMethod === 'llm' ? '#eff6ff' : '#f9fafb',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>
              {result.scoringMethod === 'llm' ? '🤖' : '📋'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                {result.scoringMethod === 'llm' ? 'LLM Scoring Active' : 'Deterministic Mock Scoring'}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                {result.scoringMethod === 'llm' 
                  ? 'Task attributes scored using OpenAI API (context-aware, slightly variable)'
                  : 'Task attributes scored using deterministic keyword-based logic (always identical)'
                }
              </div>
              {result.scoringMethod === 'deterministic-mock' && (
                <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                  💡 Tip: Add OPENAI_API_KEY to .env.local to enable LLM scoring
                </div>
              )}
            </div>
          </div>

          {/* Ownership Distribution */}
          <OwnershipDistributionDisplay distribution={result.ownershipDistribution} />

          {/* Simulation Metrics */}
          <div style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              Simulation Results
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Baseline Time</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                  {result.simulation.baselineTotalTime.toFixed(1)}h
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>AI-Native Time</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#3b82f6' }}>
                  {result.simulation.aiNativeTotalTime.toFixed(1)}h
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Throughput Gain</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#059669' }}>
                  {result.simulation.throughputGainPercent.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Risk Delta</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: result.simulation.aggregateRiskDelta > 0 ? '#dc2626' : '#059669' }}>
                  {result.simulation.aggregateRiskDelta > 0 ? '+' : ''}{result.simulation.aggregateRiskDelta.toFixed(3)}
                </div>
              </div>
            </div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deployment Recommendation</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                {result.simulation.deploymentRecommendation}
              </div>
            </div>
          </div>

          {/* Task Classification Table */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Task Classifications
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                      Task
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                      Hours
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                      Ownership
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                      Explanation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.classifiedTasks.map((task, index) => (
                    <tr key={task.id} style={{ borderBottom: index < result.classifiedTasks.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                        {task.description}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                        {task.estimatedHours}h
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: 
                            task.ownership === 'AI_OWNED' ? '#d1fae5' :
                            task.ownership === 'HUMAN_SUPERVISES_AI' ? '#fed7aa' :
                            '#fecaca',
                          color:
                            task.ownership === 'AI_OWNED' ? '#065f46' :
                            task.ownership === 'HUMAN_SUPERVISES_AI' ? '#9a3412' :
                            '#991b1b'
                        }}>
                          {task.ownership.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                        {task.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
