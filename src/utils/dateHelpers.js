/**
 * Date Helper Utilities
 *
 * Pure functions for date manipulation and validation.
 * Uses date-fns for robust date operations.
 */

import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';

/**
 * Format date to YYYY-MM-DD string (ISO format)
 *
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 *
 * @example
 * formatDate(new Date('2026-01-15')) // '2026-01-15'
 */
export function formatDate(date) {
  if (typeof date === 'string') {
    return date;
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse date string to Date object
 *
 * @param {string} dateString - Date string in various formats
 * @returns {Date|null} Date object or null if invalid
 *
 * @example
 * parseDate('2026-01-15') // Date object
 * parseDate('01/15/2026') // Date object
 * parseDate('invalid') // null
 */
export function parseDate(dateString) {
  try {
    // Try ISO format first
    let date = parseISO(dateString);

    // If that fails, try other common formats
    if (!isValid(date)) {
      // Try MM/DD/YYYY or DD/MM/YYYY
      const parts = dateString.split(/[/\-]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        // Try MM/DD/YYYY
        date = new Date(c, a - 1, b);
        if (!isValid(date)) {
          // Try DD/MM/YYYY
          date = new Date(c, b - 1, a);
        }
      }
    }

    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Validate date range
 *
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Object} { valid: boolean, error?: string }
 *
 * @example
 * validateDateRange('2026-01-01', '2026-01-31') // { valid: true }
 * validateDateRange('2026-01-31', '2026-01-01') // { valid: false, error: 'End date must be after start date' }
 */
export function validateDateRange(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (!end) {
    return { valid: false, error: 'Invalid end date' };
  }

  if (start > end) {
    return { valid: false, error: 'End date must be after start date' };
  }

  // Check if range is reasonable (not more than 1 year)
  const days = differenceInDays(end, start);
  if (days > 365) {
    return { valid: false, error: 'Date range cannot exceed 1 year' };
  }

  return { valid: true };
}

/**
 * Get array of dates between start and end (inclusive)
 *
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Array<string>} Array of date strings
 *
 * @example
 * getDateRange('2026-01-01', '2026-01-03')
 * // ['2026-01-01', '2026-01-02', '2026-01-03']
 */
export function getDateRange(startDate, endDate) {
  const dates = [];
  let current = parseDate(startDate);
  const end = parseDate(endDate);

  if (!current || !end || current > end) {
    return dates;
  }

  while (current <= end) {
    dates.push(formatDate(current));
    current = addDays(current, 1);
  }

  return dates;
}

/**
 * Check if a date falls within any of the given periods
 *
 * @param {string} date - Date string to check
 * @param {Array} periods - Array of {start, end} objects
 * @returns {boolean} True if date is within any period
 *
 * @example
 * isInAnyPeriod('2026-01-15', [
 *   { start: '2026-01-01', end: '2026-01-31' }
 * ]) // true
 */
export function isInAnyPeriod(date, periods) {
  const dateObj = parseDate(date);
  if (!dateObj) return false;

  return periods.some((period) => {
    const start = parseDate(period.start);
    const end = parseDate(period.end);
    return start && end && dateObj >= start && dateObj <= end;
  });
}

/**
 * Format date for display (human-readable)
 *
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - date-fns format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date
 *
 * @example
 * formatDisplayDate('2026-01-15') // 'Jan 15, 2026'
 * formatDisplayDate('2026-01-15', 'MM/dd/yyyy') // '01/15/2026'
 */
export function formatDisplayDate(dateString, formatStr = 'MMM d, yyyy') {
  const date = parseDate(dateString);
  if (!date) return dateString;
  return format(date, formatStr);
}

/**
 * Get period description for display
 *
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Human-readable period description
 *
 * @example
 * formatPeriod('2026-01-01', '2026-01-31') // 'Jan 1 - Jan 31, 2026'
 */
export function formatPeriod(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return `${startDate} - ${endDate}`;

  const startFormat = format(start, 'MMM d');
  const year = format(end, 'yyyy');
  const endFormat = format(end, 'MMM d');

  return `${startFormat} - ${endFormat}, ${year}`;
}

/**
 * Calculate number of days in a date range
 *
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {number} Number of days (inclusive)
 *
 * @example
 * getDaysInRange('2026-01-01', '2026-01-03') // 3
 */
export function getDaysInRange(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end || start > end) return 0;

  return differenceInDays(end, start) + 1;
}
