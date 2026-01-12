/**
 * Electricity Bill Splitter - Model Constants
 *
 * These constants define the electricity cost model based on actual usage data
 * from Jan 2+ 2026 when thermostat was set to legal minimum (60°F).
 *
 * The model was derived from 71 days of real data (Oct 31, 2025 - Jan 9, 2026)
 * correlating outdoor temperature with electricity usage.
 */

/**
 * Legal minimum usage model: Usage = intercept + (slope × temperature)
 *
 * At legal minimum thermostat setting (60°F), baseline usage follows this linear
 * relationship with outdoor temperature.
 *
 * Example:
 * - At 30°F: 50.75 + (-0.888 × 30) = 24.11 kWh/day
 * - At 50°F: 50.75 + (-0.888 × 50) = 6.35 kWh/day
 * - At 70°F: 50.75 + (-0.888 × 70) = -11.41 kWh/day (negative = no heating needed)
 */
export const LEGAL_MIN_INTERCEPT = 50.75; // kWh/day baseline
export const LEGAL_MIN_SLOPE = -0.888; // kWh per °F

/**
 * PECO electricity rate as of 2026
 * This includes generation, transmission, and distribution charges
 */
export const COST_PER_KWH = 0.2061; // $/kWh

/**
 * Reasonable bounds for legal minimum calculation
 * Used to validate model doesn't produce unrealistic values
 */
export const MIN_LEGAL_MIN_USAGE = 5; // kWh/day (minimum plausible baseline)
export const MAX_LEGAL_MIN_USAGE = 50; // kWh/day (maximum plausible baseline)

/**
 * Temperature bounds for model validity
 * Model derived from data between 30-80°F outdoor temperature
 */
export const MIN_VALID_TEMP = 0; // °F (absolute minimum for calculation)
export const MAX_VALID_TEMP = 100; // °F (absolute maximum for calculation)

/**
 * Default temperature for predictions
 * Represents typical winter heating season temperature
 */
export const DEFAULT_TEMP = 30; // °F
