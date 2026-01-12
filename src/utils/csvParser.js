/**
 * CSV Parser Utilities
 *
 * Functions for parsing PECO electricity usage CSV exports.
 * Handles various CSV formats and validates data structure.
 */

import Papa from 'papaparse';
import { parseDate, formatDate } from './dateHelpers';

/**
 * Parse PECO CSV export data
 *
 * @param {string} csvText - Raw CSV text content
 * @returns {Object} { success: boolean, data: Array, errors: Array, warnings: Array }
 *
 * @example
 * const result = parsePECOCSV(csvContent);
 * if (result.success) {
 *   console.log(`Loaded ${result.data.length} records`);
 * }
 */
export function parsePECOCSV(csvText) {
  const errors = [];
  const warnings = [];

  try {
    // Parse CSV using papaparse
    const parseResult = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach((err) => {
        errors.push(`Row ${err.row}: ${err.message}`);
      });
    }

    const data = parseResult.data;

    // Validate required columns
    const requiredColumns = ['date', 'usage_kwh', 'temp_mean_f'];
    const missingColumns = requiredColumns.filter(
      (col) => !Object.keys(data[0] || {}).includes(col)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        data: [],
        errors: [`Missing required columns: ${missingColumns.join(', ')}`],
        warnings: [],
      };
    }

    // Transform and validate each record
    const validRecords = [];
    const invalidRecords = [];

    data.forEach((record, index) => {
      try {
        // Validate date
        const dateObj = parseDate(record.date);
        if (!dateObj) {
          invalidRecords.push({ row: index + 2, reason: 'Invalid date format', record });
          return;
        }

        // Validate numeric fields
        const usage = parseFloat(record.usage_kwh);
        const temp = parseFloat(record.temp_mean_f);

        if (isNaN(usage) || usage < 0) {
          invalidRecords.push({ row: index + 2, reason: 'Invalid usage value', record });
          return;
        }

        if (isNaN(temp) || temp < -50 || temp > 150) {
          warnings.push(
            `Row ${index + 2}: Unusual temperature (${temp}°F) - please verify`
          );
        }

        // Normalize record
        validRecords.push({
          date: formatDate(dateObj),
          usage_kwh: usage,
          temp_mean_f: temp,
          temp_min_f: parseFloat(record.temp_min_f) || temp,
          temp_max_f: parseFloat(record.temp_max_f) || temp,
          cost_dollars: parseFloat(record.cost_dollars) || usage * 0.2061,
        });
      } catch (err) {
        invalidRecords.push({ row: index + 2, reason: err.message, record });
      }
    });

    if (invalidRecords.length > 0) {
      warnings.push(
        `${invalidRecords.length} invalid records skipped. First error: Row ${invalidRecords[0].row} - ${invalidRecords[0].reason}`
      );
    }

    // Sort by date
    validRecords.sort((a, b) => a.date.localeCompare(b.date));

    // Check for duplicates
    const duplicates = [];
    const seenDates = new Set();
    validRecords.forEach((record) => {
      if (seenDates.has(record.date)) {
        duplicates.push(record.date);
      }
      seenDates.add(record.date);
    });

    if (duplicates.length > 0) {
      warnings.push(
        `Found duplicate dates: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}. Keeping latest entries.`
      );
      // Remove duplicates (keep last occurrence)
      const uniqueRecords = [];
      const seen = new Set();
      for (let i = validRecords.length - 1; i >= 0; i--) {
        if (!seen.has(validRecords[i].date)) {
          uniqueRecords.unshift(validRecords[i]);
          seen.add(validRecords[i].date);
        }
      }
      uniqueRecords.sort((a, b) => a.date.localeCompare(b.date));
    }

    return {
      success: validRecords.length > 0,
      data: validRecords,
      errors,
      warnings,
      stats: {
        total: data.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
        dateRange: validRecords.length > 0 ? {
          start: validRecords[0].date,
          end: validRecords[validRecords.length - 1].date,
        } : null,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      errors: [`Failed to parse CSV: ${err.message}`],
      warnings: [],
    };
  }
}

/**
 * Convert parsed data to CSV format for export
 *
 * @param {Array} data - Array of usage records
 * @returns {string} CSV text content
 *
 * @example
 * const csv = exportToCSV(historicalData);
 * downloadFile(csv, 'electricity-data.csv', 'text/csv');
 */
export function exportToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const fields = [
    'date',
    'usage_kwh',
    'cost_dollars',
    'temp_mean_f',
    'temp_min_f',
    'temp_max_f',
  ];

  const csv = Papa.unparse({
    fields,
    data: data.map((record) => [
      record.date,
      record.usage_kwh.toFixed(2),
      record.cost_dollars ? record.cost_dollars.toFixed(4) : '',
      record.temp_mean_f.toFixed(2),
      record.temp_min_f.toFixed(2),
      record.temp_max_f.toFixed(2),
    ]),
  });

  return csv;
}

/**
 * Download a file in the browser
 *
 * @param {string} content - File content
 * @param {string} filename - Name of file to download
 * @param {string} mimeType - MIME type (default: 'text/plain')
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
