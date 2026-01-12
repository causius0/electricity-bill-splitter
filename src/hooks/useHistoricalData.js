/**
 * useHistoricalData Hook
 *
 * Loads and manages historical electricity usage data from CSV.
 * Uses localStorage to cache data between sessions.
 */

import { useState, useEffect } from 'react';
import { parsePECOCSV } from '../utils/csvParser';
import { HISTORICAL_DATA_PATH } from '../data/historicalData';

const STORAGE_KEY = 'electricity-historical-data';

export function useHistoricalData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try localStorage first
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoading(false);
        return;
      }

      // Load from embedded CSV file
      const response = await fetch(HISTORICAL_DATA_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }

      const csvText = await response.text();
      const result = parsePECOCSV(csvText);

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }

      setData(result.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    } catch (err) {
      console.error('Failed to load historical data:', err);
      setError(err.message);
      // Set empty array as fallback
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const importData = (csvText) => {
    const result = parsePECOCSV(csvText);

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
        warnings: result.warnings,
      };
    }

    // Merge with existing data (update existing dates, add new dates)
    const existingMap = new Map(data.map((record) => [record.date, record]));
    const newData = [...data];

    result.data.forEach((record) => {
      if (existingMap.has(record.date)) {
        // Update existing record
        const index = newData.findIndex((r) => r.date === record.date);
        newData[index] = record;
      } else {
        // Add new record
        newData.push(record);
      }
    });

    // Sort by date
    newData.sort((a, b) => a.date.localeCompare(b.date));

    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    return {
      success: true,
      recordCount: result.data.length,
      warnings: result.warnings,
    };
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData([]);
  };

  return {
    data,
    loading,
    error,
    importData,
    clearData,
    refresh: loadData,
  };
}
