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
 * Example (updated Jan 2026 baseline from 9 days of data):
 * - At 30°F: 50.97 + (-0.896 × 30) = 24.09 kWh/day
 * - At 50°F: 50.97 + (-0.896 × 50) = 6.17 kWh/day
 * - At 70°F: 50.97 + (-0.896 × 70) = -11.75 kWh/day (negative = no heating needed)
 *
 * Baseline calculated from Jan 2-10, 2026 data (R² = 0.9204)
 */
export const LEGAL_MIN_INTERCEPT = 50.97; // kWh/day baseline
export const LEGAL_MIN_SLOPE = -0.896; // kWh per °F

/**
 * PECO electricity rate as of 2026
 * This includes generation, transmission, and distribution charges
 *
 * Updated to match actual bill (Nov 22 - Dec 29, 2025):
 * - Total charges: $353.25 for 1,652 kWh
 * - Effective rate: $0.2139/kWh
 *
 * Complete breakdown:
 * - PECO Electric Delivery: $170.73
 * - PECO Electric Supply: $182.52
 * - Total: $353.25
 */
export const COST_PER_KWH = 0.2139; // $/kWh (actual effective rate)

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
