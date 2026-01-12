/**
 * Calculations Component
 *
 * Explains the methodology and shows scatter plots of the baseline calculations
 * for December 3-8 and January 2-9 periods.
 */

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from 'recharts';

export function Calculations({ historicalData }) {
  // December 3-8 baseline data
  const decBaselineData = useMemo(() => {
    return historicalData.filter(d => d.date >= '2025-12-03' && d.date <= '2025-12-08');
  }, [historicalData]);

  // January 2-9 baseline data
  const janBaselineData = useMemo(() => {
    return historicalData.filter(d => d.date >= '2026-01-02' && d.date <= '2026-01-09');
  }, [historicalData]);

  // Calculate December model using linear regression
  const decemberModel = useMemo(() => {
    if (decBaselineData.length === 0) return null;

    const n = decBaselineData.length;
    const sumX = decBaselineData.reduce((sum, d) => sum + d.temp_mean_f, 0);
    const sumY = decBaselineData.reduce((sum, d) => sum + d.usage_kwh, 0);
    const sumXY = decBaselineData.reduce((sum, d) => sum + (d.temp_mean_f * d.usage_kwh), 0);
    const sumX2 = decBaselineData.reduce((sum, d) => sum + (d.temp_mean_f * d.temp_mean_f), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }, [decBaselineData]);

  // Calculate regression line data for December (with extrapolation)
  const decemberLineData = useMemo(() => {
    if (!decemberModel) return [];
    const minTemp = Math.min(...decBaselineData.map(d => d.temp_mean_f));
    const maxTemp = Math.max(...decBaselineData.map(d => d.temp_mean_f));

    // Extend 5 degrees beyond the data range for extrapolation
    const extrapolationBuffer = 5;
    const extendedMin = minTemp - extrapolationBuffer;
    const extendedMax = maxTemp + extrapolationBuffer;

    // Create multiple points for smooth line with segments
    return [
      { temp: extendedMin, usage: decemberModel.intercept + decemberModel.slope * extendedMin, isExtrapolation: true },
      { temp: minTemp, usage: decemberModel.intercept + decemberModel.slope * minTemp, isExtrapolation: false },
      { temp: maxTemp, usage: decemberModel.intercept + decemberModel.slope * maxTemp, isExtrapolation: false },
      { temp: extendedMax, usage: decemberModel.intercept + decemberModel.slope * extendedMax, isExtrapolation: true },
    ];
  }, [decemberModel, decBaselineData]);

  // Calculate X-axis domain for December (tighter range)
  const decemberDomain = useMemo(() => {
    if (decBaselineData.length === 0) return [0, 80];
    const minTemp = Math.min(...decBaselineData.map(d => d.temp_mean_f));
    const maxTemp = Math.max(...decBaselineData.map(d => d.temp_mean_f));
    const padding = (maxTemp - minTemp) * 0.15; // 15% padding on each side
    return [minTemp - padding, maxTemp + padding];
  }, [decBaselineData]);

  // January model is fixed: Expected Usage = 50.75 - (0.888 × Temperature) with extrapolation
  const januaryLineData = useMemo(() => {
    if (janBaselineData.length === 0) return [];
    const minTemp = Math.min(...janBaselineData.map(d => d.temp_mean_f));
    const maxTemp = Math.max(...janBaselineData.map(d => d.temp_mean_f));

    // Extend 5 degrees beyond the data range for extrapolation
    const extrapolationBuffer = 5;
    const extendedMin = minTemp - extrapolationBuffer;
    const extendedMax = maxTemp + extrapolationBuffer;

    // Create multiple points for smooth line with segments
    return [
      { temp: extendedMin, usage: 50.75 - 0.888 * extendedMin, isExtrapolation: true },
      { temp: minTemp, usage: 50.75 - 0.888 * minTemp, isExtrapolation: false },
      { temp: maxTemp, usage: 50.75 - 0.888 * maxTemp, isExtrapolation: false },
      { temp: extendedMax, usage: 50.75 - 0.888 * extendedMax, isExtrapolation: true },
    ];
  }, [janBaselineData]);

  // Calculate X-axis domain for January (tighter range)
  const januaryDomain = useMemo(() => {
    if (janBaselineData.length === 0) return [0, 80];
    const minTemp = Math.min(...janBaselineData.map(d => d.temp_mean_f));
    const maxTemp = Math.max(...janBaselineData.map(d => d.temp_mean_f));
    const padding = (maxTemp - minTemp) * 0.15; // 15% padding on each side
    return [minTemp - padding, maxTemp + padding];
  }, [janBaselineData]);

  // Format scatter data for December
  const decScatterData = decBaselineData.map(d => ({
    temp: d.temp_mean_f,
    usage: d.usage_kwh,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Format scatter data for January
  const janScatterData = janBaselineData.map(d => ({
    temp: d.temp_mean_f,
    usage: d.usage_kwh,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div>
      {/* Methodology */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        background: '#fffbeb',
        border: '2px solid #fcd34d',
        borderRadius: '8px',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#92400e', marginBottom: '16px' }}>
          📚 Methodology: How Baseline Models Are Calculated
        </h2>
        <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>Linear Regression:</strong> Both baseline models are calculated using linear regression,
            which finds the best-fit line through actual usage data points.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>Formula:</strong> Expected Usage = intercept + (slope × Temperature)
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>How it works:</strong>
          </p>
          <ul style={{ marginLeft: '24px', marginBottom: '12px' }}>
            <li>Each day's actual usage is plotted against the outdoor temperature</li>
            <li>Linear regression finds the line that best fits all the data points</li>
            <li><strong>Intercept:</strong> The expected usage when temperature = 0°F (baseline heating demand)</li>
            <li><strong>Slope:</strong> How much expected usage changes for each 1°F increase in temperature</li>
            <li>Negative slope means higher temperature = lower usage (less heating needed)</li>
          </ul>
          <p>
            <strong>Cost Splitting:</strong> Once we have the baseline model, we calculate expected usage for each day.
            If actual usage exceeds expected, the excess cost goes to the person using electricity.
            If actual usage is below expected, the actual cost is split 50/50.
          </p>
        </div>
      </div>

      {/* December Baseline Graph */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#4a5568',
          marginBottom: '16px',
        }}>
          📊 December Baseline (Dec 3-8)
        </h3>

        {decemberModel ? (
          <>
            <div style={{
              padding: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#1e40af',
            }}>
              <strong>Model:</strong> Expected Usage = {decemberModel.intercept.toFixed(2)} + ({decemberModel.slope.toFixed(3)} × Temperature °F)<br/>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>
                Derived from {decBaselineData.length} days of actual usage data when using new heating schedule (no heater)
              </span>
            </div>

            <div style={{ height: '400px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="temp"
                    type="number"
                    name="Temperature"
                    unit="°F"
                    domain={decemberDomain}
                    label={{ value: 'Outdoor Temperature (°F)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    dataKey="usage"
                    type="number"
                    name="Usage"
                    unit="kWh"
                    label={{ value: 'Usage (kWh)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{data.date}</div>
                            <div>Temp: {data.temp.toFixed(1)}°F</div>
                            <div>Usage: {data.usage.toFixed(1)} kWh</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter name="Actual Usage" data={decScatterData} fill="#3b82f6" shape="circle" />
                  {/* Solid line for interpolation (within data range) */}
                  <Line
                    name="Baseline Model (Interpolation)"
                    data={decemberLineData.filter(d => !d.isExtrapolation)}
                    type="linear"
                    dataKey="usage"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                  {/* Dotted line for extrapolation (beyond data range) */}
                  <Line
                    name="Baseline Model (Extrapolation)"
                    data={decemberLineData.filter(d => d.isExtrapolation)}
                    type="linear"
                    dataKey="usage"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: '13px', color: '#718096', textAlign: 'center' }}>
              <strong>Blue dots:</strong> Actual usage for each day | <strong>Solid red line:</strong> Baseline model (within data range) | <strong>Dotted red line:</strong> Extrapolation beyond data
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            No December 3-8 data available. Please import data to see the baseline calculation.
          </div>
        )}
      </div>

      {/* January Baseline Graph */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#4a5568',
          marginBottom: '16px',
        }}>
          📊 January Baseline (Jan 2-9) - Legal Minimum
        </h3>

        {janBaselineData.length > 0 ? (
          <>
            <div style={{
              padding: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#1e40af',
            }}>
              <strong>Model:</strong> Expected Usage = 50.75 - (0.888 × Temperature °F)<br/>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>
                Derived from {janBaselineData.length} days of actual usage data when thermostat was at legal minimum (60°F)
              </span>
            </div>

            <div style={{ height: '400px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="temp"
                    type="number"
                    name="Temperature"
                    unit="°F"
                    domain={januaryDomain}
                    label={{ value: 'Outdoor Temperature (°F)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    dataKey="usage"
                    type="number"
                    name="Usage"
                    unit="kWh"
                    label={{ value: 'Usage (kWh)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{data.date}</div>
                            <div>Temp: {data.temp.toFixed(1)}°F</div>
                            <div>Usage: {data.usage.toFixed(1)} kWh</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter name="Actual Usage" data={janScatterData} fill="#10b981" shape="circle" />
                  {/* Solid line for interpolation (within data range) */}
                  <Line
                    name="Legal Minimum Model (Interpolation)"
                    data={januaryLineData.filter(d => !d.isExtrapolation)}
                    type="linear"
                    dataKey="usage"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                  {/* Dotted line for extrapolation (beyond data range) */}
                  <Line
                    name="Legal Minimum Model (Extrapolation)"
                    data={januaryLineData.filter(d => d.isExtrapolation)}
                    type="linear"
                    dataKey="usage"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: '13px', color: '#718096', textAlign: 'center' }}>
              <strong>Green dots:</strong> Actual usage for each day | <strong>Solid red line:</strong> Legal minimum model (within data range) | <strong>Dotted red line:</strong> Extrapolation beyond data
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#166534',
            }}>
              <strong>Why this model:</strong> This model represents electricity usage when the thermostat is set to the
              legal minimum (60°F). It's used for all periods from Jan 2 onwards, including when Guala was away (Dec 18+).
              The slope (-0.888) means usage decreases by 0.888 kWh for every 1°F increase in outdoor temperature.
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            No January 2-9 data available. Please import data to see the baseline calculation.
          </div>
        )}
      </div>
    </div>
  );
}
