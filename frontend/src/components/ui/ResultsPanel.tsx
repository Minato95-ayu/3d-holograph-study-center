import React from 'react';

export interface Metric {
  label: string;
  value: number;
  unit: string;
  percentage: number;
  color: string;
  icon?: string;
}

export interface ResultsData {
  experimentName: string;
  metrics: Metric[];
  explanation: string;
  suggestions: string[];
  isRunning?: boolean;
}

interface ResultsPanelProps {
  data: ResultsData;
  onRetry?: () => void;
  onSave?: () => void;
  onCompare?: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  data,
  onRetry,
  onSave,
  onCompare,
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 20, 50, 0.95) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 240, 255, 0.1), inset 0 1px 0 rgba(0, 240, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00f0ff',
            margin: '0',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
          }}
        >
          📊 {data.experimentName}
        </h2>
        {data.isRunning && (
          <p
            style={{
              fontSize: '12px',
              color: '#00ff00',
              margin: '8px 0 0 0',
              animation: 'pulse 1s infinite',
            }}
          >
            ⚡ Simulation Running...
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {data.metrics.map((metric, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(0, 20, 40, 0.6)',
              border: `1px solid ${metric.color}40`,
              borderRadius: '8px',
              padding: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
              e.currentTarget.style.borderColor = metric.color;
              e.currentTarget.style.boxShadow = `0 0 15px ${metric.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 20, 40, 0.6)';
              e.currentTarget.style.borderColor = `${metric.color}40`;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Metric Label */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#b0d4ff', fontWeight: '600' }}>
                {metric.icon} {metric.label}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: metric.color,
                  fontFamily: 'monospace',
                }}
              >
                {metric.value} {metric.unit}
              </span>
            </div>

            {/* Metric Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: `1px solid ${metric.color}30`,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(metric.percentage, 100)}%`,
                  background: metric.color,
                  boxShadow: `0 0 10px ${metric.color}`,
                  transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Percentage */}
            <div
              style={{
                fontSize: '11px',
                color: '#80a0d0',
                marginTop: '8px',
                textAlign: 'right',
              }}
            >
              {metric.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Explanation Box */}
      <div
        style={{
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: '#b0d4ff',
            lineHeight: '1.6',
            margin: '0',
            letterSpacing: '0.3px',
          }}
        >
          💬 {data.explanation}
        </p>
      </div>

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <div
          style={{
            background: 'rgba(255, 106, 0, 0.08)',
            border: '1px solid rgba(255, 106, 0, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#ff6b00',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            💡 Recommendations
          </h3>
          <ul
            style={{
              listStyle: 'none',
              margin: '0',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {data.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '13px',
                  color: '#c0b0ff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <span style={{ color: '#ff6b00', marginTop: '2px' }}>▸</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 16px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔄 Retry
          </button>
        )}

        {onSave && (
          <button
            onClick={onSave}
            style={{
              padding: '10px 16px',
              background: 'rgba(0, 255, 0, 0.1)',
              border: '1px solid #00ff00',
              color: '#00ff00',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            💾 Save
          </button>
        )}

        {onCompare && (
          <button
            onClick={onCompare}
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 0, 255, 0.1)',
              border: '1px solid #ff00ff',
              color: '#ff00ff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📊 Compare
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};
