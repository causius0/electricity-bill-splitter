/**
 * TimeWindowResults Component
 *
 * Displays the aggregated cost breakdown for a time window with variable occupancy.
 * Shows per-person shares, daily breakdowns, and summary statistics.
 */

import { formatDisplayDate } from '../../utils/dateHelpers';

export function TimeWindowResults({ results }) {
  if (!results) {
    return (
      <div
        style={{
          padding: '24px',
          background: '#f7fafc',
          border: '2px dashed #e2e8f0',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#718096',
        }}
      >
        Select a date range and define occupancy periods to see cost breakdown.
      </div>
    );
  }

  const { totals, dailyBreakdowns } = results;

  return (
    <div>
      {/* Summary Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            opacity: 0.9,
          }}
        >
          Cost Summary for Period
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <StatCard label="Total Days" value={totals.totalDays} />
          <StatCard label="Total Usage" value={`${totals.totalUsage.toFixed(1)} kWh`} />
          <StatCard label="Total Cost" value={`$${totals.totalCost.toFixed(2)}`} />
          <StatCard label="Avg Temp" value={`${totals.avgTemp.toFixed(1)}°F`} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                opacity: 0.8,
                marginBottom: '4px',
              }}
            >
              Your Share
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
              }}
            >
              ${totals.yourShare.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '4px',
              }}
            >
              {((totals.yourShare / totals.totalCost) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                opacity: 0.8,
                marginBottom: '4px',
              }}
            >
              Guala's Share
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
              }}
            >
              ${totals.flatmateShare.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '4px',
              }}
            >
              {((totals.flatmateShare / totals.totalCost) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>

        {/* Legal Minimum Breakdown */}
        <div
          style={{
            gridColumn: '1 / -1',
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '4px' }}>💡 How it works:</strong>
          Legal minimum cost (${totals.legalMinTotal?.toFixed(2) || '$0.00'}) is <strong>always split 50/50</strong> between Causio and Guala, regardless of occupancy.
          Excess heating (${totals.excessTotal?.toFixed(2) || '$0.00'}) goes to the person who was home based on thermostat control.
        </div>
      </div>

      {/* Daily Breakdown */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: '#f7fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#4a5568',
          }}
        >
          Daily Breakdown ({dailyBreakdowns.length} days)
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead
              style={{
                position: 'sticky',
                top: 0,
                background: '#f7fafc',
                zIndex: 1,
              }}
            >
              <tr>
                <TableHeader>Date</TableHeader>
                <TableHeader>Usage</TableHeader>
                <TableHeader>Temp</TableHeader>
                <TableHeader>Cost</TableHeader>
                <TableHeader>You</TableHeader>
                <TableHeader>Flatmate</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>
            <tbody>
              {dailyBreakdowns.map((day, index) => (
                <tr
                  key={day.date}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: index % 2 === 0 ? 'white' : '#f7fafc',
                  }}
                >
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                    {formatDisplayDate(day.date, 'M/d')}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                    {day.usage.toFixed(1)} kWh
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                    {day.temp.toFixed(1)}°F
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                    ${day.cost.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#667eea',
                    }}
                  >
                    ${day.yourShare.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#764ba2',
                    }}
                  >
                    ${day.flatmateShare.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <OccupancyBadge status={day.occupancy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '6px',
        padding: '10px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', fontWeight: '700' }}>{value}</div>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th
      style={{
        padding: '8px 12px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: '600',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </th>
  );
}

function OccupancyBadge({ status }) {
  const config = {
    'both': { label: '🏠 Both', color: '#d1fae5', border: '#10b981', text: '#065f46' },
    'you-only': { label: '👤 Causio', color: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    'flatmate-only': { label: '👤 Guala', color: '#fce7f3', border: '#ec4899', text: '#9f1239' },
    'none': { label: '🏝️ Empty', color: '#f3f4f6', border: '#9ca3af', text: '#374151' },
  };

  const { label, color, border, text } = config[status] || config['none'];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: '500',
        borderRadius: '4px',
        background: color,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      {label}
    </span>
  );
}
