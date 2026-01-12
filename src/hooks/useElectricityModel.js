/**
 * useElectricityModel Hook
 *
 * Custom React hook that encapsulates the electricity cost model.
 * Provides memoized calculations to avoid unnecessary recomputations.
 */

import { useMemo } from 'react';
import {
  calculateLegalMinimum,
  calculateDailySplit,
  calculatePredictedCost,
  calculateTimeWindowSplit,
} from '../utils/calculations';

/**
 * Hook for single-day cost calculations
 *
 * @param {number|null} actualUsage - Actual usage in kWh (null for predict mode)
 * @param {number} outdoorTemp - Outdoor temperature in °F
 * @param {string} thermostatController - 'you' or 'flatmate'
 * @returns {Object} Cost breakdown
 *
 * @example
 * const results = useElectricityModel(51, 30, 'flatmate');
 * // { legalMinUsage, legalMinCost, actualCost, yourShare, flatmateShare, ... }
 */
export function useElectricityModel(actualUsage, outdoorTemp, thermostatController = 'flatmate') {
  return useMemo(() => {
    if (actualUsage !== null) {
      return calculateDailySplit(actualUsage, outdoorTemp, thermostatController);
    } else {
      return calculatePredictedCost(outdoorTemp);
    }
  }, [actualUsage, outdoorTemp, thermostatController]);
}

/**
 * Hook for predicted costs (no actual usage data)
 *
 * @param {number} outdoorTemp - Outdoor temperature in °F
 * @returns {Object} Predicted costs
 *
 * @example
 * const prediction = usePredictedCost(30);
 * // { legalMinUsage: 24.11, legalMinCost: 4.97, yourShare: 2.49, flatmateShare: 2.49 }
 */
export function usePredictedCost(outdoorTemp) {
  return useMemo(() => {
    return calculatePredictedCost(outdoorTemp);
  }, [outdoorTemp]);
}

/**
 * Hook for legal minimum calculation
 *
 * @param {number} outdoorTemp - Outdoor temperature in °F
 * @returns {number} Legal minimum usage in kWh/day
 *
 * @example
 * const legalMin = useLegalMinimum(30);
 * // 24.11
 */
export function useLegalMinimum(outdoorTemp) {
  return useMemo(() => {
    return calculateLegalMinimum(outdoorTemp);
  }, [outdoorTemp]);
}

/**
 * Hook for time-window calculations (partial occupancy periods)
 *
 * @param {Array} data - Historical data array
 * @param {Object} dateRange - { start, end } date strings
 * @param {Array} occupancyPeriods - Occupancy configurations
 * @returns {Object} Time window results
 *
 * @example
 * const results = useTimeWindowCalculation(
 *   historicalData,
 *   { start: '2025-12-18', end: '2026-01-12' },
 *   [{ start: '2025-12-18', end: '2026-01-12', residents: { you: 1, flatmate: 0 } }]
 * );
 */
export function useTimeWindowCalculation(data, dateRange, occupancyPeriods) {
  return useMemo(() => {
    if (!data || !dateRange || !occupancyPeriods) {
      return null;
    }

    return calculateTimeWindowSplit(data, dateRange, occupancyPeriods);
  }, [data, dateRange, occupancyPeriods]);
}
