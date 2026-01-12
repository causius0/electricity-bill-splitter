/**
 * DateRangeCalculator Component
 *
 * Main container for time-window calculations.
 * Combines date range picker, occupancy editor, and results display.
 */

import { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { OccupancyEditor } from '../Occupancy/OccupancyEditor';
import { TimeWindowResults } from './TimeWindowResults';
import { useTimeWindowCalculation } from '../../hooks/useElectricityModel';

export function DateRangeCalculator({ historicalData }) {
  const [dateRange, setDateRange] = useState({
    start: '2025-12-18', // Example: flatmate away period
    end: '2026-01-12',
  });

  const [occupancyPeriods, setOccupancyPeriods] = useState([
    {
      id: 1,
      start: '2025-12-18',
      end: '2026-01-12',
      residents: {
        you: 1,
        flatmate: 0, // Flatmate away
      },
      thermostatController: 'you',
    },
  ]);

  // Calculate time window costs
  const results = useTimeWindowCalculation(historicalData, dateRange, occupancyPeriods);

  return (
    <div>
      <DateRangePicker dateRange={dateRange} onChange={setDateRange} />

      <OccupancyEditor periods={occupancyPeriods} onChange={setOccupancyPeriods} />

      <TimeWindowResults results={results} />
    </div>
  );
}
