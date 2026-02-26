import { OwnershipDistribution } from '@/types';

interface OwnershipDistributionProps {
  distribution: OwnershipDistribution;
}

export function OwnershipDistributionDisplay({ distribution }: OwnershipDistributionProps) {
  return (
    <div style={{
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      marginBottom: '16px'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '16px', 
        fontWeight: '600',
        color: '#111827'
      }}>
        AI Ownership Distribution
      </h3>
      <div style={{ 
        display: 'flex', 
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div>
          <span style={{ fontWeight: '500', color: '#374151' }}>
            AI Ownership Coverage:
          </span>{' '}
          <span style={{ fontWeight: '600', color: '#059669' }}>
            {distribution.aiOwnedPercent.toFixed(1)}%
          </span>
        </div>
        <div>
          <span style={{ fontWeight: '500', color: '#374151' }}>
            Human Supervision Required:
          </span>{' '}
          <span style={{ fontWeight: '600', color: '#d97706' }}>
            {distribution.humanSupervisesPercent.toFixed(1)}%
          </span>
        </div>
        <div>
          <span style={{ fontWeight: '500', color: '#374151' }}>
            Human Ownership Required:
          </span>{' '}
          <span style={{ fontWeight: '600', color: '#dc2626' }}>
            {distribution.humanOwnedPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
