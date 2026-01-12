/**
 * DateRangePicker Component
 *
 * Allows user to select a date range for time-window calculations.
 * Supports quick presets (last 7 days, last month) and custom ranges.
 */

import { useState } from 'react';
import { formatDisplayDate, formatPeriod, validateDateRange } from '../../utils/dateHelpers';

export function DateRangePicker({ dateRange, onChange }) {
  const [errors, setErrors] = useState({});

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };

    // Clear error for this field
    setErrors({ ...errors, [field]: null });

    onChange(newRange);
  };

  const handleValidate = () => {
    const validation = validateDateRange(dateRange.start, dateRange.end);

    if (!validation.valid) {
      setErrors({ general: validation.error });
      return false;
    }

    setErrors({});
    return true;
  };

  const quickPresets = [
    {
      label: 'Last 7 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      },
    },
    {
      label: 'Last 30 Days',
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      },
    },
    {
      label: 'This Month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      },
    },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#4a5568',
          marginBottom: '8px',
        }}
      >
        Date Range
      </label>

      {/* Quick Presets */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        {quickPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const range = preset.getRange();
              onChange(range);
              setErrors({});
            }}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#4a5568',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.color = '#4a5568';
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#718096',
              marginBottom: '4px',
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
            onBlur={handleValidate}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: `1px solid ${errors.start ? '#ef4444' : '#e2e8f0'}`,
              borderRadius: '6px',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#718096',
              marginBottom: '4px',
            }}
          >
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
            onBlur={handleValidate}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: `1px solid ${errors.end ? '#ef4444' : '#e2e8f0'}`,
              borderRadius: '6px',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
          />
        </div>
      </div>

      {/* Validation Error */}
      {errors.general && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#991b1b',
          }}
        >
          ⚠️ {errors.general}
        </div>
      )}

      {/* Selected Range Display */}
      {dateRange.start && dateRange.end && !errors.general && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#0369a1',
          }}
        >
          📅 {formatPeriod(dateRange.start, dateRange.end)}
        </div>
      )}
    </div>
  );
}
