/**
 * JanuaryBaseline Component
 *
 * Analyzes December 18 - January 8 period using the legal minimum baseline model.
 * Key dates:
 * - Dec 18, 2025: Guala left (Causio alone in apartment)
 * - Jan 2, 2026: Thermostat set to legal minimum (60°F)
 * - Jan 8, 2026: End of analysis period
 * - Uses the established baseline model: Expected Usage = 50.75 - (0.888 × Temperature)
 */

import { useMemo } from 'react';
import { COST_PER_KWH, LEGAL_MIN_INTERCEPT, LEGAL_MIN_SLOPE } from '../../utils/constants';

export function JanuaryBaseline({ historicalData, outdoorTemp }) {
  // Filter January data
  const januaryData = useMemo(() => {
    return historicalData.filter(d => d.date.startsWith('2026-01'));
  }, [historicalData]);

  // Dec 18 - Jan 8: Use January baseline model (when Guala was not home)
  const dec18OnwardsData = useMemo(() => {
    return historicalData.filter(d => d.date >= '2025-12-18' && d.date <= '2026-01-08');
  }, [historicalData]);

  // Jan 2+: Period when thermostat was at legal minimum
  const janBaselineData = useMemo(() => {
    return januaryData.filter(d => d.date >= '2026-01-02');
  }, [januaryData]);

  // Calculate expected usage for January model (legal minimum)
  // Formula: Expected Usage = 50.75 - (0.888 × temperature)
  const getJanuaryExpected = (temp) => {
    return LEGAL_MIN_INTERCEPT + (LEGAL_MIN_SLOPE * temp);
  };

  // Analyze Dec 18 onwards period using January legal minimum model
  const dec18Analysis = useMemo(() => {
    if (dec18OnwardsData.length === 0) return null;

    // Calculate expected usage (using January legal minimum model)
    // and actual usage
    const analysis = dec18OnwardsData.map(day => {
      const expectedUsage = getJanuaryExpected(day.temp_mean_f);
      const actualUsage = day.usage_kwh;
      const excessUsage = actualUsage - expectedUsage;
      const excessCost = excessUsage * COST_PER_KWH;

      return {
        date: day.date,
        temp: day.temp_mean_f,
        expectedUsage,
        actualUsage,
        excessUsage,
        excessCost,
      };
    });

    // Totals
    const totals = analysis.reduce((acc, day) => ({
      totalDays: acc.totalDays + 1,
      totalExpectedUsage: acc.totalExpectedUsage + day.expectedUsage,
      totalActualUsage: acc.totalActualUsage + day.actualUsage,
      totalExcessUsage: acc.totalExcessUsage + day.excessUsage,
      totalExcessCost: acc.totalExcessCost + day.excessCost,
      avgTemp: acc.avgTemp + day.temp,
    }), {
      totalDays: 0,
      totalExpectedUsage: 0,
      totalActualUsage: 0,
      totalExcessUsage: 0,
      totalExcessCost: 0,
      avgTemp: 0,
    });

    totals.avgTemp = totals.totalDays > 0 ? totals.avgTemp / totals.totalDays : 0;

    return { analysis, totals };
  }, [dec18OnwardsData]);

  if (januaryData.length === 0 && !dec18Analysis) {
    return (
      <div style={{
        padding: '24px',
        background: '#f7fafc',
        border: '2px dashed #e2e8f0',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#718096',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          January Data Not Available
        </h3>
        <p>Please import January 2026 PECO data to analyze the legal minimum baseline period.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Methodology */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        background: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
          📚 Methodology
        </h3>
        <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
          <p><strong>January Baseline (Jan 2+):</strong></p>
          <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
            <li>Uses the established legal minimum model from Jan 2+ data</li>
            <li>Formula: <code>Expected Usage = 50.75 - (0.888 × Temperature °F)</code></li>
            <li><strong>Where the numbers come from:</strong> Derived from linear regression on actual usage data when thermostat was at legal minimum (60°F)</li>
            <li><strong>50.75 (intercept):</strong> Baseline electricity usage at 0°F (heating demand is maximum)</li>
            <li><strong>-0.888 (slope):</strong> For each 1°F increase in outdoor temperature, expected usage decreases by 0.888 kWh (less heating needed)</li>
            <li>Example: At 30°F → 50.75 - (0.888 × 30) = 24.11 kWh expected usage</li>
            <li>Example: At 50°F → 50.75 - (0.888 × 50) = 6.35 kWh expected usage</li>
            <li>Represents electricity usage when thermostat is at legal minimum (60°F)</li>
            <li>Used for temperature slider and all post-December calculations (Dec 18+)</li>
          </ul>

          <p style={{ marginTop: '12px' }}>
            <strong>Cost Split Rules:</strong>
          </p>
          <ul style={{ marginLeft: '20px' }}>
            <li><strong>Expected cost</strong> is always split 50/50 between Causio and Guala</li>
            <li><strong>Excess cost</strong> (actual - expected) goes to the person using the electricity</li>
            <li><strong>When usage is below expected</strong>: total actual cost is split 50/50</li>
          </ul>
        </div>
      </div>

      {/* Model Info */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>
          📊 January 2026 Baseline Model
        </h3>
        <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
          <p><strong>Key Dates:</strong></p>
          <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
            <li><strong>Jan 2</strong>: Thermostat set to legal minimum (60°F)</li>
            <li><strong>Jan 2+</strong>: Baseline period for legal minimum model</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            <strong>January Model:</strong><br/>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>
              Expected Usage = 50.75 - (0.888 × Temperature °F)
            </span>
          </p>
        </div>
      </div>

      {/* January Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="January Days"
          value={januaryData.length}
          unit="days"
        />
        <StatCard
          label="From Jan 2+"
          value={janBaselineData.length}
          unit="days"
        />
        <StatCard
          label="Total Usage"
          value={januaryData.reduce((sum, d) => sum + d.usage_kwh, 0).toFixed(1)}
          unit="kWh"
        />
        <StatCard
          label="Total Cost"
          value={`$${(januaryData.reduce((sum, d) => sum + d.usage_kwh, 0) * COST_PER_KWH).toFixed(2)}`}
        />
      </div>

      {/* Temperature Slider Prediction */}
      {outdoorTemp !== undefined && (
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '16px',
          }}>
            🌡️ Expected Cost at {outdoorTemp}°F
          </h3>

          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
            Based on January legal minimum model, at {outdoorTemp}°F outdoor temperature:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <StatCard
              label="Expected Usage"
              value={`${getJanuaryExpected(outdoorTemp).toFixed(1)}`}
              unit="kWh"
            />
            <StatCard
              label="Expected Cost"
              value={`$${(getJanuaryExpected(outdoorTemp) * COST_PER_KWH).toFixed(2)}`}
            />
            <StatCard
              label="Causio's Share (50%)"
              value={`$${(getJanuaryExpected(outdoorTemp) * COST_PER_KWH / 2).toFixed(2)}`}
            />
            <StatCard
              label="Guala's Share (50%)"
              value={`$${(getJanuaryExpected(outdoorTemp) * COST_PER_KWH / 2).toFixed(2)}`}
            />
          </div>

          <div style={{
            padding: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1e40af',
          }}>
            <strong>Note:</strong> This is the expected usage and cost based on the January legal minimum model.
            The cost is split 50/50 between Causio and Guala. This model applies to the period when Guala was away (Dec 18 - Jan 8).
          </div>
        </div>
      )}

      {/* Daily Breakdown: Dec 18 - Jan 8 */}
      {dec18Analysis && (
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '16px',
          }}>
            📅 Daily Breakdown: Dec 18 - Jan 8 (January Baseline Model)
          </h3>

          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
            Using the January legal minimum baseline model to calculate expected usage and allocate costs.
            When actual usage is below expected, the actual cost is split 50/50.
          </p>

          {/* Summary Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <StatCard
              label="Total Days"
              value={dec18Analysis.totals.totalDays}
              unit="days"
            />
            <StatCard
              label="Avg Temperature"
              value={dec18Analysis.totals.avgTemp.toFixed(1)}
              unit="°F"
            />
            <StatCard
              label="Total Expected"
              value={dec18Analysis.totals.totalExpectedUsage.toFixed(1)}
              unit="kWh"
            />
            <StatCard
              label="Total Actual"
              value={dec18Analysis.totals.totalActualUsage.toFixed(1)}
              unit="kWh"
            />
            <StatCard
              label="Total Excess"
              value={dec18Analysis.totals.totalExcessUsage.toFixed(1)}
              unit="kWh"
            />
            <StatCard
              label="Expected Cost"
              value={`$${(dec18Analysis.totals.totalExpectedUsage * COST_PER_KWH).toFixed(2)}`}
            />
            <StatCard
              label="Actual Cost"
              value={`$${(dec18Analysis.totals.totalActualUsage * COST_PER_KWH).toFixed(2)}`}
            />
            <StatCard
              label="Excess Cost"
              value={`$${dec18Analysis.totals.totalExcessCost.toFixed(2)}`}
            />
          </div>

          {/* Daily Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0',
                    whiteSpace: 'nowrap'
                  }}>Date</th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Temp<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>(°F)</span></th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Expected<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>(kWh)</span></th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Actual<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>(kWh)</span></th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Excess<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>(kWh)</span></th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Cost<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>($)</span></th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Causio<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>($)</span></th>
                  <th style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#4a5568',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Guala<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>($)</span></th>
                </tr>
              </thead>
              <tbody>
                {dec18Analysis.analysis.map((day, index) => (
                  <tr key={day.date} style={{
                    background: index % 2 === 0 ? 'white' : '#f7fafc',
                  }}>
                    <td style={{
                      padding: '8px',
                      borderBottom: '1px solid #e2e8f0',
                      fontWeight: '500',
                      color: '#2d3748'
                    }}>
                      {day.date.substring(5).split('-').slice(0, 2).join('/')}
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: day.temp < 32 ? '#e53e3e' : '#4a5568',
                      fontWeight: day.temp < 32 ? '600' : '400'
                    }}>
                      {day.temp.toFixed(1)}
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#4a5568'
                    }}>
                      {day.expectedUsage.toFixed(1)}
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#2d3748',
                      fontWeight: '600'
                    }}>
                      {day.actualUsage.toFixed(1)}
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: day.excessUsage > 0 ? '#e53e3e' : day.excessUsage < 0 ? '#38a169' : '#4a5568',
                      fontWeight: '600'
                    }}>
                      {day.excessUsage > 0 ? '+' : ''}{day.excessUsage.toFixed(1)}
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#2d3748'
                    }}>
                      ${(day.actualUsage * COST_PER_KWH).toFixed(2)}
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {/* When actual < expected: split actual cost 50/50 */}
                      {/* When actual >= expected: Causio pays 50% of expected + 100% of excess */}
                      ${day.excessUsage < 0
                        ? (day.actualUsage * COST_PER_KWH / 2).toFixed(2)
                        : (day.expectedUsage * COST_PER_KWH / 2 + day.excessCost).toFixed(2)
                      }
                    </td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#2d3748',
                      fontWeight: '500'
                    }}>
                      {/* When actual < expected: split actual cost 50/50 */}
                      {/* When actual >= expected: Guala pays 50% of expected */}
                      ${day.excessUsage < 0
                        ? (day.actualUsage * COST_PER_KWH / 2).toFixed(2)
                        : (day.expectedUsage * COST_PER_KWH / 2).toFixed(2)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#276749',
          }}>
            <strong>💰 Cost Summary (Dec 18 - {dec18Analysis.analysis[dec18Analysis.analysis.length - 1].date.substring(5).split('-').slice(0, 2).join('/')}):</strong><br/>
            <span style={{ marginLeft: '20px' }}>
              Total Cost: ${(dec18Analysis.totals.totalActualUsage * COST_PER_KWH).toFixed(2)} |
              Causio pays: ${dec18Analysis.analysis.reduce((sum, day) =>
                sum + (day.excessUsage < 0
                  ? day.actualUsage * COST_PER_KWH / 2
                  : day.expectedUsage * COST_PER_KWH / 2 + day.excessCost
                ), 0
              ).toFixed(2)} |
              Guala pays: ${dec18Analysis.analysis.reduce((sum, day) =>
                sum + (day.excessUsage < 0
                  ? day.actualUsage * COST_PER_KWH / 2
                  : day.expectedUsage * COST_PER_KWH / 2
                ), 0
              ).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div
      style={{
        padding: '12px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
      }}
    >
      <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>
        {value}
        {unit && <span style={{ fontSize: '13px', fontWeight: '500', color: '#718096' }}> {unit}</span>}
      </div>
    </div>
  );
}
