/**
 * DecemberBillSplit Component
 *
 * Shows the December bill breakdown from November 21 to December 29, 2025
 * Includes daily occupancy tracking and fair cost allocation.
 *
 * Key dates:
 * - Nov 21 - Dec 29: Bill period (39 days)
 * - Dec 18: Guala present in the house
 * - Other days: Default occupancy (adjust as needed)
 */

import { useMemo, useState } from 'react';
import { COST_PER_KWH, LEGAL_MIN_INTERCEPT, LEGAL_MIN_SLOPE } from '../../utils/constants';

// Default occupancy map - you can adjust this
// Format: 'YYYY-MM-DD': { causio: number, guala: number }
const DEFAULT_OCCUPANCY = {
  // Nov 21 - Dec 18: Both present (auto-generated, no need to list each day)
  // Dec 19 - Dec 29: Causio only (auto-generated, no need to list each day)
};

// For Nov 21 - Dec 18: Both present
const BOTH_PRESENT_OCCUPANCY = { causio: 1, guala: 1 };

// For Dec 19 - Dec 29: Causio only
const CAUSIO_ONLY_OCCUPANCY = { causio: 1, guala: 0 };

export function DecemberBillSplit({ historicalData }) {
  const [occupancyMap, setOccupancyMap] = useState(DEFAULT_OCCUPANCY);

  // Filter data for the bill period: Nov 21 - Dec 29, 2025
  const billPeriodData = useMemo(() => {
    return historicalData.filter(d => d.date >= '2025-11-21' && d.date <= '2025-12-29');
  }, [historicalData]);

  // Calculate December baseline model (from Dec 3-7 data) for heater period
  const decemberModel = useMemo(() => {
    const decBaselineData = historicalData.filter(d => d.date >= '2025-12-03' && d.date <= '2025-12-07');
    if (decBaselineData.length === 0) return null;

    const n = decBaselineData.length;
    const sumX = decBaselineData.reduce((sum, d) => sum + d.temp_mean_f, 0);
    const sumY = decBaselineData.reduce((sum, d) => sum + d.usage_kwh, 0);
    const sumXY = decBaselineData.reduce((sum, d) => sum + (d.temp_mean_f * d.usage_kwh), 0);
    const sumXX = decBaselineData.reduce((sum, d) => sum + (d.temp_mean_f * d.temp_mean_f), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { intercept, slope };
  }, [historicalData]);

  // Calculate legal minimum (January baseline) expected usage
  const getJanuaryExpected = (temp) => {
    return LEGAL_MIN_INTERCEPT + (LEGAL_MIN_SLOPE * temp);
  };

  // Calculate December baseline expected usage (for heater period)
  const getDecemberExpected = (temp) => {
    if (!decemberModel) return getJanuaryExpected(temp);
    return decemberModel.intercept + (decemberModel.slope * temp);
  };

  // Determine which model to use based on date
  const getExpectedUsage = (date, temp) => {
    // Nov 21 - Dec 2: No baseline model (use January model as fallback)
    // Dec 3-7: December baseline days - use December model (excess will be 0)
    if (date >= '2025-12-03' && date <= '2025-12-07') {
      return getDecemberExpected(temp);
    }
    // Dec 8 - Dec 18: Use December baseline (heater period)
    if (date >= '2025-12-08' && date <= '2025-12-18') {
      return getDecemberExpected(temp);
    }
    // Dec 19 - Dec 29: Use January baseline
    return getJanuaryExpected(temp);
  };

  // Determine cost split method based on date
  const getCostSplitMethod = (date) => {
    // Nov 21 - Dec 2: No baseline model - actual cost split 50/50
    if (date >= '2025-11-21' && date <= '2025-12-02') {
      return '50-50';
    }
    // Dec 3-7: December baseline days - actual cost split 50/50 (excess = 0 by definition)
    if (date >= '2025-12-03' && date <= '2025-12-07') {
      return 'december-baseline';
    }
    // Dec 8 - Dec 18: Heater period with December model (both present, excess goes to Guala)
    if (date >= '2025-12-08' && date <= '2025-12-18') {
      return 'heater';
    }
    // Dec 19 - Dec 29: January model period (Causio present, expected 50/50, excess to Causio)
    return 'january-model';
  };

  // Get occupancy for a specific date based on periods
  const getOccupancy = (date) => {
    // Nov 21 - Dec 18: Both present
    if (date >= '2025-11-21' && date <= '2025-12-18') {
      return BOTH_PRESENT_OCCUPANCY;
    }
    // Dec 19 - Dec 29: Causio only
    if (date >= '2025-12-19' && date <= '2025-12-29') {
      return CAUSIO_ONLY_OCCUPANCY;
    }
    return occupancyMap[date] || CAUSIO_ONLY_OCCUPANCY;
  };

  // Calculate daily breakdown with occupancy-based cost split
  const dailyBreakdown = useMemo(() => {
    return billPeriodData.map(day => {
      const expectedUsage = getExpectedUsage(day.date, day.temp_mean_f);
      const actualUsage = day.usage_kwh;
      const excessUsage = actualUsage - expectedUsage;
      const excessCost = excessUsage * COST_PER_KWH;
      const expectedCost = expectedUsage * COST_PER_KWH;
      const actualCost = actualUsage * COST_PER_KWH;

      const occupancy = getOccupancy(day.date);
      const splitMethod = getCostSplitMethod(day.date);

      // Calculate cost splits based on method
      let causioShare, gualaShare;

      if (splitMethod === '50-50') {
        // Nov 21 - Dec 2: No baseline model - actual cost split evenly
        causioShare = actualCost / 2;
        gualaShare = actualCost / 2;
      } else if (splitMethod === 'december-baseline') {
        // Dec 3-7: December baseline days - actual cost split 50/50 (excess should be ~0)
        causioShare = actualCost / 2;
        gualaShare = actualCost / 2;
      } else if (splitMethod === 'heater') {
        // Dec 8 - Dec 18: December model - expected 50/50, excess goes to Guala
        if (excessUsage < 0) {
          // Below expected: split actual 50/50
          causioShare = actualCost / 2;
          gualaShare = actualCost / 2;
        } else {
          // Above expected: expected split 50/50, excess goes to Guala
          causioShare = expectedCost / 2;
          gualaShare = (expectedCost / 2) + excessCost;
        }
      } else {
        // Dec 19 - Dec 29: January model - Causio present, expected 50/50, excess to Causio
        if (excessUsage < 0) {
          // Below expected: split actual 50/50
          causioShare = actualCost / 2;
          gualaShare = actualCost / 2;
        } else {
          // Above expected: expected split 50/50, excess goes to Causio
          causioShare = (expectedCost / 2) + excessCost;
          gualaShare = expectedCost / 2;
        }
      }

      return {
        date: day.date,
        temp: day.temp_mean_f,
        expectedUsage,
        actualUsage,
        excessUsage,
        excessCost,
        expectedCost,
        actualCost,
        causioShare,
        gualaShare,
        occupancy,
        splitMethod,
      };
    });
  }, [billPeriodData, decemberModel]);

  // Calculate totals
  const totals = useMemo(() => {
    return dailyBreakdown.reduce((acc, day) => ({
      totalDays: acc.totalDays + 1,
      totalUsage: acc.totalUsage + day.actualUsage,
      totalExpectedUsage: acc.totalExpectedUsage + day.expectedUsage,
      totalCost: acc.totalCost + day.actualCost,
      totalExpectedCost: acc.totalExpectedCost + day.expectedCost,
      totalExcessUsage: acc.totalExcessUsage + day.excessUsage,
      totalExcessCost: acc.totalExcessCost + day.excessCost,
      totalCausioShare: acc.totalCausioShare + day.causioShare,
      totalGualaShare: acc.totalGualaShare + day.gualaShare,
      avgTemp: acc.avgTemp + day.temp,
      causioDaysPresent: acc.causioDaysPresent + (day.occupancy.causio > 0 ? 1 : 0),
      gualaDaysPresent: acc.gualaDaysPresent + (day.occupancy.guala > 0 ? 1 : 0),
    }), {
      totalDays: 0,
      totalUsage: 0,
      totalExpectedUsage: 0,
      totalCost: 0,
      totalExpectedCost: 0,
      totalExcessUsage: 0,
      totalExcessCost: 0,
      totalCausioShare: 0,
      totalGualaShare: 0,
      avgTemp: 0,
      causioDaysPresent: 0,
      gualaDaysPresent: 0,
    });
  }, [dailyBreakdown]);

  totals.avgTemp = totals.totalDays > 0 ? totals.avgTemp / totals.totalDays : 0;

  // Toggle occupancy for a specific date
  const toggleOccupancy = (date, person) => {
    setOccupancyMap(prev => {
      const current = prev[date] || { ...DEFAULT_DAILY_OCCUPANCY };
      const updated = {
        ...current,
        [person]: current[person] === 1 ? 0 : 1
      };
      return {
        ...prev,
        [date]: updated
      };
    });
  };

  if (billPeriodData.length === 0) {
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
          Bill Period Data Not Available
        </h3>
        <p>Please import PECO data from November 21 - December 29, 2025 to view the bill breakdown.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Period Info */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>
          📅 December Bill Period & Cost Split Rules
        </h3>
        <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
          <p><strong>Period:</strong> November 21, 2025 - December 29, 2025 ({billPeriodData.length} days)</p>
          <div style={{ marginTop: '12px' }}>
            <strong>Cost Split Rules:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li><strong>Nov 21 - Dec 2:</strong> No baseline available → Actual cost split 50/50</li>
              <li><strong>Dec 3-7:</strong> December baseline days → Actual cost split 50/50 (excess = 0 by definition)</li>
              <li><strong>Dec 8 - Dec 18:</strong> Both present → Expected 50/50, heater excess goes to Guala</li>
              <li><strong>Dec 19 - Dec 29:</strong> Causio present → Expected 50/50, excess goes to Causio, below expected split 50/50</li>
            </ul>
          </div>
          <div style={{ marginTop: '12px' }}>
            <strong>Prediction Models:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li><strong>December Model:</strong> Built from Dec 3-7 data, used for Dec 8-18</li>
              <li><strong>January Model:</strong> Built from Jan 2-10 data, used for Dec 19-29</li>
              <li><strong>Nov 21 - Dec 2:</strong> No prediction model available (no baseline)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Total Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="Total Period Usage"
          value={`${totals.totalUsage.toFixed(1)}`}
          unit="kWh"
        />
        <StatCard
          label="Total Cost"
          value={`$${totals.totalCost.toFixed(2)}`}
        />
        <StatCard
          label="Avg Temperature"
          value={`${totals.avgTemp.toFixed(1)}°F`}
        />
        <StatCard
          label="Causio Days Present"
          value={`${totals.causioDaysPresent}`}
          unit="days"
        />
        <StatCard
          label="Guala Days Present"
          value={`${totals.gualaDaysPresent}`}
          unit="days"
        />
      </div>

      {/* Cost Split Summary */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        borderRadius: '12px',
        marginBottom: '24px',
        color: 'white',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          opacity: 0.9,
        }}>
          💰 Fair Cost Split (Nov 21 - Dec 29)
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>
              Total Bill
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              ${totals.totalCost.toFixed(2)}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>
              Causio's Share
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              ${totals.totalCausioShare.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
              {((totals.totalCausioShare / totals.totalCost) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>
              Guala's Share
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              ${totals.totalGualaShare.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
              {((totals.totalGualaShare / totals.totalCost) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#4a5568',
          marginBottom: '16px',
        }}>
          📊 Daily Breakdown
        </h3>
        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
          Click on Causio or Guala to toggle their presence for that day.
        </p>

        <div style={{
          maxHeight: '600px',
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f7fafc', zIndex: 10 }}>
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
              {dailyBreakdown.map((day) => {
                // Determine row background color based on period
                let rowBackground = '#ffffff';
                let methodBadge = null;

                if (day.splitMethod === '50-50') {
                  // Nov 21 - Dec 2: No baseline
                  rowBackground = '#dbeafe'; // Light blue for Nov 21 - Dec 2 (no baseline)
                  methodBadge = (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      50/50
                    </span>
                  );
                } else if (day.splitMethod === 'december-baseline') {
                  // Dec 3-7: December baseline days - excess should be ~0
                  rowBackground = '#dcfce7'; // Darker green for Dec 3-7 (baseline days)
                  methodBadge = (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      background: '#22c55e',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Model
                    </span>
                  );
                } else if (day.splitMethod === 'heater') {
                  rowBackground = '#fef3c7'; // Yellow for Dec 8 - Dec 18
                  methodBadge = (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      background: '#f59e0b',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Heater
                    </span>
                  );
                } else {
                  rowBackground = '#e0e7ff'; // Light purple for Dec 19 - Dec 29
                  methodBadge = (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      background: '#8b5cf6',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Causio+
                    </span>
                  );
                }

                return (
                  <tr
                    key={day.date}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: rowBackground,
                    }}
                  >
                    <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                      {day.date.substring(5).split('-').slice(0, 2).join('/')}
                      {methodBadge}
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
                      color: '#4b5563'
                    }}>
                      ${day.actualCost.toFixed(2)}
                    </td>
                    <td style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#4b5563'
                    }}>
                      ${day.causioShare.toFixed(2)}
                    </td>
                    <td style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: day.gualaShare > 0 ? '#dc2626' : '#4b5563'
                    }}>
                      ${day.gualaShare.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#166534',
      }}>
        <strong>📊 Period Legend:</strong><br/>
        • <strong>Blue (50/50):</strong> Nov 21 - Dec 2, no baseline, actual cost split 50/50<br/>
        • <strong>Dark Green (Model):</strong> Dec 3-7, December baseline days, excess ≈ 0 (used to build model)<br/>
        • <strong>Yellow (Heater):</strong> Dec 8 - Dec 18, December model, expected 50/50, heater excess goes to Guala<br/>
        • <strong>Purple (Causio+):</strong> Dec 19 - Dec 29, January model, expected 50/50, excess to Causio, below expected split 50/50
      </div>
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
