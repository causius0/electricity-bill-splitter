/**
 * DecemberBaseline Component
 *
 * Analyzes December 2025 period with new heating schedule and electric heater.
 * Key dates:
 * - Dec 3, 2025: New heating schedule agreed
 * - Dec 8, 2025: Guala got electric heater
 * - Dec 3-8, 2025: Baseline period (new schedule, no heater)
 * - Dec 8-17, 2025: Heater analysis period (includes electric heater usage)
 */

import { useMemo } from 'react';
import { calculateLegalMinimum } from '../../utils/calculations';
import { COST_PER_KWH, LEGAL_MIN_INTERCEPT, LEGAL_MIN_SLOPE } from '../../utils/constants';

export function DecemberBaseline({ historicalData, outdoorTemp }) {
  // Filter December data
  const decemberData = useMemo(() => {
    return historicalData.filter(d => d.date.startsWith('2025-12'));
  }, [historicalData]);

  // Key periods
  // Dec 3-8: Baseline period (new heating schedule, no heater)
  const decBaselineData = useMemo(() => {
    return decemberData.filter(d => d.date >= '2025-12-03' && d.date <= '2025-12-08');
  }, [decemberData]);

  // Dec 9-17: Heater analysis period (assuming heater wasn't used on Dec 8)
  const decHeaterPeriodData = useMemo(() => {
    return decemberData.filter(d => d.date >= '2025-12-09' && d.date <= '2025-12-17');
  }, [decemberData]);

  // Calculate December baseline model (from Dec 3-8 data)
  // Uses linear regression: Expected Usage = intercept + (slope × temperature)
  const decemberModel = useMemo(() => {
    if (decBaselineData.length === 0) return null;

    // Simple linear regression: usage vs temperature
    const n = decBaselineData.length;
    const sumX = decBaselineData.reduce((sum, d) => sum + d.temp_mean_f, 0);
    const sumY = decBaselineData.reduce((sum, d) => sum + d.usage_kwh, 0);
    const sumXY = decBaselineData.reduce((sum, d) => sum + (d.temp_mean_f * d.usage_kwh), 0);
    const sumXX = decBaselineData.reduce((sum, d) => sum + (d.temp_mean_f * d.temp_mean_f), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { intercept, slope, r2: null };
  }, [decBaselineData]);

  // Calculate expected usage for December model (from Dec 3-8 data)
  const getDecemberExpected = (temp) => {
    if (!decemberModel) return 0;
    return decemberModel.intercept + (decemberModel.slope * temp);
  };

  // Calculate expected usage for January model (from Jan 2+ data)
  // Formula: Expected Usage = 50.75 + (-0.888 × temperature)
  const getJanuaryExpected = (temp) => {
    return LEGAL_MIN_INTERCEPT + (LEGAL_MIN_SLOPE * temp);
  };

  // Analyze Dec 9-17 period for heater impact
  const heaterAnalysis = useMemo(() => {
    if (decHeaterPeriodData.length === 0) return null;

    // Calculate expected usage (using December baseline model)
    // and actual usage with heater
    const analysis = decHeaterPeriodData.map(day => {
      const expectedUsage = decemberModel ? getDecemberExpected(day.temp_mean_f) : 0;
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
  }, [decHeaterPeriodData, decemberModel]);

  if (decemberData.length === 0) {
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
          December Data Not Available
        </h3>
        <p>Please import December 2025 PECO data to analyze the new heating schedule and electric heater period.</p>
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
          <p><strong>December Baseline (Dec 3-8):</strong></p>
          <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
            <li>Calculates expected usage via linear regression on Dec 3-8 data</li>
            <li>Formula: <code>Expected Usage = intercept + (slope × Temperature °F)</code></li>
            <li>Used for Dec 9-17 heater analysis period and temperature slider</li>
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
          📊 December 2025 Baseline Model
        </h3>
        <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
          <p><strong>Key Dates:</strong></p>
          <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
            <li><strong>Dec 3</strong>: New heating schedule agreed</li>
            <li><strong>Dec 8</strong>: Guala got electric heater</li>
            <li><strong>Dec 3-8</strong>: Baseline period (new schedule, no heater)</li>
            <li><strong>Dec 9-17</strong>: Heater analysis period (use Dec 3-8 baseline)</li>
          </ul>
          {decemberModel && (
            <p style={{ marginTop: '12px' }}>
              <strong>December Model</strong> (from {decBaselineData.length} days, Dec 3-8):<br/>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>
                Expected Usage = {decemberModel.intercept.toFixed(2)} + ({decemberModel.slope.toFixed(3)} × Temperature °F)
              </span>
            </p>
          )}
        </div>
      </div>

      {/* December Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="December Days"
          value={decemberData.length}
          unit="days"
        />
        <StatCard
          label="Baseline Period"
          value={decBaselineData.length}
          unit="days (Dec 3-8)"
        />
        <StatCard
          label="Heater Period"
          value={decHeaterPeriodData.length}
          unit="days (Dec 9-17)"
        />
        <StatCard
          label="Total Usage"
          value={decemberData.reduce((sum, d) => sum + d.usage_kwh, 0).toFixed(1)}
          unit="kWh"
        />
      </div>

      {/* Temperature Slider Prediction */}
      {decemberModel && outdoorTemp !== undefined && (
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
            Based on December model (Dec 3-8 data), at {outdoorTemp}°F outdoor temperature:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <StatCard
              label="Expected Usage"
              value={`${getDecemberExpected(outdoorTemp).toFixed(1)}`}
              unit="kWh"
            />
            <StatCard
              label="Expected Cost"
              value={`$${(getDecemberExpected(outdoorTemp) * COST_PER_KWH).toFixed(2)}`}
            />
            <StatCard
              label="Causio's Share (50%)"
              value={`$${(getDecemberExpected(outdoorTemp) * COST_PER_KWH / 2).toFixed(2)}`}
            />
            <StatCard
              label="Guala's Share (50%)"
              value={`$${(getDecemberExpected(outdoorTemp) * COST_PER_KWH / 2).toFixed(2)}`}
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
            <strong>Note:</strong> This is the expected usage and cost based on the December baseline model.
            The cost is split 50/50 between Causio and Guala. Any actual usage above or below this amount
            would be adjusted based on who used the electricity.
          </div>
        </div>
      )}

      {/* Heater Analysis (Dec 9-17) */}
      {heaterAnalysis && (
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
            🔥 Electric Heater Analysis (Dec 9-17)
          </h3>

          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
            Comparing expected usage (from Dec 3-8 baseline) vs actual usage with electric heater.
          </p>

          {/* Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <StatCard
              label="Period"
              value={`Dec 9-17 (${heaterAnalysis.totals.totalDays} days)`}
            />
            <StatCard
              label="Avg Temperature"
              value={`${heaterAnalysis.totals.avgTemp.toFixed(1)}°F`}
            />
            <StatCard
              label="Total Usage"
              value={`${heaterAnalysis.totals.totalActualUsage.toFixed(1)} kWh`}
            />
            <StatCard
              label="Total Cost"
              value={`$${(heaterAnalysis.totals.totalActualUsage * COST_PER_KWH).toFixed(2)}`}
            />
          </div>

          {/* Cost Split Breakdown */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '12px',
            marginBottom: '20px',
            color: 'white',
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              opacity: 0.9,
            }}>
              💰 Fair Cost Split (Dec 9-17)
            </h4>

            <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
              <strong>How it works:</strong> Expected cost is always split 50/50.
              Electric heater excess goes to Guala (she got the heater).
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
                  Expected Total
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH).toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  50/50 split
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
                  Heater Excess Total
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  ${heaterAnalysis.totals.totalExcessCost.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  Guala pays
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
                  Causio's Share
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>
                  ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH / 2).toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  50% of expected
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
                  Guala's Share
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>
                  ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH / 2 + heaterAnalysis.totals.totalExcessCost).toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  50% expected + heater
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>
              Daily Breakdown
            </h4>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f7fafc' }}>
                  <tr>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Temp</TableHeader>
                    <TableHeader>Expected</TableHeader>
                    <TableHeader>Actual</TableHeader>
                    <TableHeader>Excess</TableHeader>
                    <TableHeader>Cost</TableHeader>
                    <TableHeader>Causio</TableHeader>
                    <TableHeader>Guala</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {heaterAnalysis.analysis.map((day) => (
                    <tr
                      key={day.date}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: day.excessUsage > 0 ? '#fef2f2' : '#ffffff',
                      }}
                    >
                      <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                        {day.date.substring(5).split('-').slice(0, 2).join('/')}
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                        {day.temp.toFixed(1)}°F
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                        {day.expectedUsage.toFixed(1)} kWh
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '600' }}>
                        {day.actualUsage.toFixed(1)} kWh
                      </td>
                      <td style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: day.excessUsage > 0 ? '#dc2626' : '#059669'
                      }}>
                        {day.excessUsage > 0 ? '+' : ''}{day.excessUsage.toFixed(1)} kWh
                      </td>
                      <td style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: day.excessCost > 0 ? '#dc2626' : '#059669'
                      }}>
                        {day.excessCost > 0 ? '+' : ''}${day.excessCost.toFixed(2)}
                      </td>
                      <td style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#4b5563'
                      }}>
                        ${(day.excessUsage < 0
                          ? (day.actualUsage * COST_PER_KWH / 2)
                          : (day.expectedUsage * COST_PER_KWH / 2)
                        ).toFixed(2)}
                      </td>
                      <td style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: day.excessUsage < 0 ? '#4b5563' : '#dc2626'
                      }}>
                        ${(day.excessUsage < 0
                          ? (day.actualUsage * COST_PER_KWH / 2)
                          : (day.expectedUsage * COST_PER_KWH / 2 + day.excessCost)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#991b1b',
          }}>
            <strong>🔥 Heater Cost Breakdown (Dec 9-17):</strong><br/>
            • <strong>Expected</strong>: ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH).toFixed(2)} → Split 50/50<br/>
            &nbsp;&nbsp;- Causio pays: ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH / 2).toFixed(2)}<br/>
            &nbsp;&nbsp;- Guala pays: ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH / 2).toFixed(2)}<br/>
            • <strong>Heater excess</strong>: ${heaterAnalysis.totals.totalExcessCost.toFixed(2)} → Guala pays 100%<br/>
            • <strong>Total:</strong><br/>
            &nbsp;&nbsp;- Causio: ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH / 2).toFixed(2)}<br/>
            &nbsp;&nbsp;- Guala: ${(heaterAnalysis.totals.totalExpectedUsage * COST_PER_KWH / 2 + heaterAnalysis.totals.totalExcessCost).toFixed(2)}
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
