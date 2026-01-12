/**
 * OccupancyEditor Component (Simplified for testing)
 */

import { useState } from 'react';
import { formatDisplayDate } from '../../utils/dateHelpers';

export function OccupancyEditor({ periods, onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPeriod = () => {
    const newPeriod = {
      id: Date.now(),
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      residents: {
        you: 1,
        flatmate: 1,
      },
      thermostatController: 'flatmate',
    };
    onChange([...periods, newPeriod]);
    setIsAdding(true);
  };

  const handleUpdatePeriod = (id, updates) => {
    onChange(periods.map((period) => (period.id === id ? { ...period, ...updates } : period)));
  };

  const handleRemovePeriod = (id) => {
    onChange(periods.filter((period) => period.id !== id));
  };

  if (periods.length === 0) {
    return (
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <label
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568',
            }}
          >
            Occupancy Periods
          </label>
          <button
            onClick={handleAddPeriod}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            + Add Period
          </button>
        </div>
        <div
          style={{
            padding: '24px',
            background: '#f7fafc',
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#718096',
            fontSize: '14px',
          }}
        >
          No occupancy periods defined. <br />
          Click "+ Add Period" to define who was home when.
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <label
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#4a5568',
          }}
        >
          Occupancy Periods ({periods.length})
        </label>
        <button
          onClick={handleAddPeriod}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '6px',
            border: 'none',
            background: '#667eea',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          + Add Period
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {periods.map((period) => (
          <div
            key={period.id}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              {formatDisplayDate(period.start)} - {formatDisplayDate(period.end)}
            </div>
            <div style={{ fontSize: '12px', color: '#718096' }}>
              Residents: Causio ({period.residents.you}), Guala ({period.residents.flatmate})
            </div>
            <div style={{ fontSize: '12px', color: '#718096' }}>
              Controller: {period.thermostatController}
            </div>
            <button
              onClick={() => handleRemovePeriod(period.id)}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#991b1b',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
