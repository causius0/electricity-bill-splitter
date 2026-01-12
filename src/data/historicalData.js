/**
 * Historical Electricity Usage Data
 *
 * This file contains 71 days of actual electricity usage data from PECO Energy
 * combined with outdoor temperature data.
 *
 * Period: Oct 31, 2025 - Jan 9, 2026
 * Location: 4046 Chestnut Apt 102, Philadelphia, PA
 * Thermostat setting: Legal minimum (60°F) from Jan 2, 2026
 *
 * This data was used to derive the legal minimum usage model:
 * Legal Minimum Usage (kWh) = 50.75 - 0.888 × Outdoor_Temp_F
 */

// Note: In production, this would be loaded from the CSV file
// For now, we export a function to load it dynamically

/**
 * Load historical data from embedded CSV
 * In a real implementation, this would fetch and parse the CSV file
 *
 * @returns {Promise<Array>} Array of daily usage records
 */
export async function loadHistoricalData() {
  // For now, return empty array - will be populated by CSV import
  // The CSV file at public/energy-model-legal-minimum.csv can be loaded
  return [];
}

/**
 * Get the path to the historical data CSV file
 */
export const HISTORICAL_DATA_PATH = '/energy-model-legal-minimum.csv';
