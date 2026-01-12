/**
 * Electricity Bill Splitter - Pure Calculation Functions
 *
 * All business logic for calculating electricity costs, legal minimum usage,
 * and fair cost splits between flatmates.
 *
 * These functions are PURE (no side effects) making them easy to test
 * and reason about. They don't depend on React or any external state.
 */

import {
  LEGAL_MIN_INTERCEPT,
  LEGAL_MIN_SLOPE,
  COST_PER_KWH,
  MIN_LEGAL_MIN_USAGE,
  MAX_LEGAL_MIN_USAGE,
} from './constants';

/**
 * Calculate legal minimum electricity usage based on outdoor temperature
 *
 * The legal minimum is the baseline electricity usage when thermostat is
 * set to the legal minimum temperature (60°F in Philadelphia). This includes
 * heating costs required to maintain that temperature.
 *
 * @param {number} outdoorTempF - Outdoor temperature in Fahrenheit
 * @returns {number} Legal minimum usage in kWh/day
 *
 * @example
 * calculateLegalMinimum(30) // returns ~24.11 kWh
 * calculateLegalMinimum(50) // returns ~6.35 kWh
 * calculateLegalMinimum(80) // returns ~-20.29 kWh (negative = no heating needed)
 */
export function calculateLegalMinimum(outdoorTempF) {
  const usage = LEGAL_MIN_INTERCEPT + (LEGAL_MIN_SLOPE * outdoorTempF);

  // Clamp to reasonable bounds to prevent unrealistic values
  // This handles edge cases like extreme temperatures
  return Math.max(MIN_LEGAL_MIN_USAGE, Math.min(MAX_LEGAL_MIN_USAGE, usage));
}

/**
 * Calculate excess usage and cost compared to legal minimum
 *
 * Excess is the difference between actual usage and legal minimum.
 * - Positive excess: Used more than legal minimum (thermostat set higher)
 * - Negative excess: Used less than legal minimum (unusually efficient day)
 *
 * @param {number} actualUsage - Actual electricity usage in kWh
 * @param {number} legalMinUsage - Legal minimum usage in kWh
 * @returns {Object} { usage: number, cost: number, isNegative: boolean }
 *
 * @example
 * calculateExcess(51, 24.11) // { usage: 26.89, cost: 5.54, isNegative: false }
 * calculateExcess(15, 24.11) // { usage: -9.11, cost: -1.88, isNegative: true }
 */
export function calculateExcess(actualUsage, legalMinUsage) {
  const excessUsage = actualUsage - legalMinUsage;
  const excessCost = excessUsage * COST_PER_KWH;

  return {
    usage: excessUsage,
    cost: excessCost,
    isNegative: excessUsage < 0,
  };
}

/**
 * Calculate fair cost split for a single day
 *
 * Splits electricity costs fairly between two flatmates:
 * - Legal minimum cost: Split 50/50 (both benefit from baseline electricity)
 * - Excess cost: Charged to thermostat controller (person who controls temperature)
 *
 * @param {number} actualUsage - Actual electricity usage in kWh
 * @param {number} outdoorTempF - Outdoor temperature in Fahrenheit
 * @param {string} thermostatController - 'you' or 'flatmate' who controls thermostat
 * @returns {Object} Cost breakdown with all intermediate values
 *
 * @example
 * calculateDailySplit(51, 30, 'flatmate')
 * // Returns:
 * // {
 * //   legalMinUsage: 24.11,
 * //   legalMinCost: 4.97,
 * //   actualCost: 10.51,
 * //   excessUsage: 26.89,
 * //   excessCost: 5.54,
 * //   yourShare: 2.49,  // 50% of legal minimum
 * //   flatmateShare: 8.06, // 50% of legal minimum + excess
 * // }
 */
export function calculateDailySplit(actualUsage, outdoorTempF, thermostatController = 'flatmate') {
  // Calculate legal minimum baseline
  const legalMinUsage = calculateLegalMinimum(outdoorTempF);
  const legalMinCost = legalMinUsage * COST_PER_KWH;

  // Calculate actual total cost
  const actualCost = actualUsage * COST_PER_KWH;

  // Calculate excess usage and cost
  const { usage: excessUsage, cost: excessCost, isNegative } = calculateExcess(
    actualUsage,
    legalMinUsage
  );

  // Split legal minimum cost 50/50
  const legalMinShareEach = legalMinCost / 2;

  // Allocate excess cost to thermostat controller
  // If excess is negative (efficient day), share the savings equally
  let yourShare, flatmateShare;

  if (isNegative) {
    // Negative excess means we used less than legal minimum
    // Share the total savings equally
    yourShare = actualCost / 2;
    flatmateShare = actualCost / 2;
  } else {
    // Positive excess: someone used extra heating
    if (thermostatController === 'flatmate') {
      yourShare = legalMinShareEach;
      flatmateShare = legalMinShareEach + excessCost;
    } else {
      yourShare = legalMinShareEach + excessCost;
      flatmateShare = legalMinShareEach;
    }
  }

  return {
    legalMinUsage,
    legalMinCost,
    actualCost,
    excessUsage,
    excessCost,
    yourShare,
    flatmateShare,
    thermostatController,
  };
}

/**
 * Calculate cost split for a time period with variable occupancy
 *
 * IMPORTANT RULES:
 * 1. Legal minimum cost is ALWAYS split 50/50 between Causio and Guala
 *    - This represents baseline electricity both benefit from
 *    - Applies even when one person is away!
 *
 * 2. Excess heating cost depends on occupancy:
 *    - If both present: excess goes to thermostat controller
 *    - If only one present: excess goes to that person
 *    - If neither present: no excess allocation
 *
 * @param {Array} data - Array of daily records: [{date, usage_kwh, temp_mean_f}, ...]
 * @param {Object} dateRange - { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 * @param {Array} occupancyPeriods - Array of occupancy configurations
 *   [{ start, end, residents: {you: 0|1, flatmate: 0|1}, thermostatController }]
 * @returns {Object} Aggregated costs and daily breakdowns
 *
 * @example
 * calculateTimeWindowSplit(
 *   dailyData,
 *   { start: '2025-12-18', end: '2026-01-12' },
 *   [
 *     {
 *       start: '2025-12-18',
 *       end: '2026-01-12',
 *       residents: { you: 1, flatmate: 0 },
 *       thermostatController: 'you'
 *     }
 *   ]
 * )
 */
export function calculateTimeWindowSplit(data, dateRange, occupancyPeriods) {
  // Filter data to date range
  const filteredData = data.filter((record) => {
    const date = record.date;
    return date >= dateRange.start && date <= dateRange.end;
  });

  // Calculate costs for each day
  const dailyBreakdowns = filteredData.map((record) => {
    // Find which occupancy period applies to this day
    const occupancy = occupancyPeriods.find((period) => {
      return record.date >= period.start && record.date <= period.end;
    }) || {
      // Default: both present, flatmate controls thermostat
      residents: { you: 1, flatmate: 1 },
      thermostatController: 'flatmate',
    };

    const { you, flatmate } = occupancy.residents;
    const totalResidents = you + flatmate;

    // Calculate daily values
    const legalMinUsage = calculateLegalMinimum(record.temp_mean_f);
    const legalMinCost = legalMinUsage * COST_PER_KWH;
    const actualCost = record.usage_kwh * COST_PER_KWH;
    const { cost: excessCost, isNegative } = calculateExcess(
      record.usage_kwh,
      legalMinUsage
    );

    let yourShare, flatmateShare;

    if (isNegative) {
      // Negative excess: share total cost equally (both pay 50%)
      yourShare = actualCost / 2;
      flatmateShare = actualCost / 2;
    } else {
      // CRITICAL: Legal minimum is ALWAYS split 50/50
      const yourLegalMinShare = legalMinCost / 2;
      const flatmateLegalMinShare = legalMinCost / 2;

      // Excess allocation depends on occupancy
      if (totalResidents === 0) {
        // No one home: no excess allocation
        yourShare = yourLegalMinShare;
        flatmateShare = flatmateLegalMinShare;
      } else if (totalResidents === 1) {
        // Only one person present: they pay the excess
        if (you === 1) {
          yourShare = yourLegalMinShare + excessCost;
          flatmateShare = flatmateLegalMinShare;
        } else {
          yourShare = yourLegalMinShare;
          flatmateShare = flatmateLegalMinShare + excessCost;
        }
      } else {
        // Both present: excess goes to thermostat controller
        if (occupancy.thermostatController === 'flatmate') {
          yourShare = yourLegalMinShare;
          flatmateShare = flatmateLegalMinShare + excessCost;
        } else {
          yourShare = yourLegalMinShare + excessCost;
          flatmateShare = flatmateLegalMinShare;
        }
      }
    }

    return {
      date: record.date,
      usage: record.usage_kwh,
      temp: record.temp_mean_f,
      cost: actualCost,
      yourShare,
      flatmateShare,
      occupancy: totalResidents === 0 ? 'none' : totalResidents === 1 ? (you ? 'you-only' : 'flatmate-only') : 'both',
      legalMinCost,
      excessCost,
    };
  });

  // Aggregate totals
  const totals = dailyBreakdowns.reduce(
    (acc, day) => ({
      totalDays: acc.totalDays + 1,
      totalUsage: acc.totalUsage + day.usage,
      totalCost: acc.totalCost + day.cost,
      yourShare: acc.yourShare + day.yourShare,
      flatmateShare: acc.flatmateShare + day.flatmateShare,
      avgTemp: acc.avgTemp + day.temp,
      legalMinTotal: acc.legalMinTotal + day.legalMinCost,
      excessTotal: acc.excessTotal + day.excessCost,
    }),
    {
      totalDays: 0,
      totalUsage: 0,
      totalCost: 0,
      yourShare: 0,
      flatmateShare: 0,
      avgTemp: 0,
      legalMinTotal: 0,
      excessTotal: 0,
    }
  );

  // Calculate average temperature
  totals.avgTemp = totals.totalDays > 0 ? totals.avgTemp / totals.totalDays : 0;

  return {
    dateRange,
    totals,
    dailyBreakdowns,
  };
}

/**
 * Calculate predicted costs based on temperature (no actual usage data)
 *
 * Used in "Predict Mode" to estimate daily costs at a given temperature
 * assuming thermostat is set to legal minimum.
 *
 * @param {number} outdoorTempF - Outdoor temperature in Fahrenheit
 * @returns {Object} Predicted costs
 *
 * @example
 * calculatePredictedCost(30)
 * // Returns:
 * // {
 * //   temp: 30,
 * //   legalMinUsage: 24.11,
 * //   legalMinCost: 4.97,
 * //   yourShare: 2.49,
 * //   flatmateShare: 2.49,
 * // }
 */
export function calculatePredictedCost(outdoorTempF) {
  const legalMinUsage = calculateLegalMinimum(outdoorTempF);
  const legalMinCost = legalMinUsage * COST_PER_KWH;
  const shareEach = legalMinCost / 2;

  return {
    temp: outdoorTempF,
    legalMinUsage,
    legalMinCost,
    yourShare: shareEach,
    flatmateShare: shareEach,
  };
}
