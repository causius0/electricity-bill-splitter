/**
 * DataManager Component
 *
 * Handles data import/export and PECO integration
 */

import { useState } from 'react';
import { exportToCSV, downloadFile } from '../../utils/csvParser';
import { HISTORICAL_DATA_PATH } from '../../data/historicalData';

export function DataManager({ historicalData, onImport, onExport, onClear, onRefresh }) {
  const [importStatus, setImportStatus] = useState(null);

  const handleExportCSV = () => {
    const csv = exportToCSV(historicalData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `electricity-data-${timestamp}.csv`, 'text/csv');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const result = onImport(text);

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${result.recordCount} records`,
        warnings: result.warnings,
      });
    } else {
      setImportStatus({
        type: 'error',
        message: 'Import failed',
        errors: result.errors,
      });
    }
  };

  const handlePECOImport = () => {
    // Instructions for PECO import
    const instructions = `
PECO DATA IMPORT INSTRUCTIONS:

Method 1: Manual CSV Export (Recommended)
1. Log in to https://secure.peco.com
2. Navigate to "My Account" → "View My Usage"
3. Select date range
4. Click "Export to CSV" or "Download"
5. Upload the file using the "Import CSV" button below

Method 2: Chrome DevTools Extraction
1. Log in to PECO and navigate to your usage data
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Paste and run this script:

copy(JSON.stringify(Array.from(document.querySelectorAll('.usage-data-row')).map(row => ({
  date: row.querySelector('.date-cell')?.textContent,
  usage_kwh: parseFloat(row.querySelector('.usage-cell')?.textContent),
  temp_mean_f: parseFloat(row.querySelector('.temp-cell')?.textContent)
})).filter(d => d.date && !isNaN(d.usage_kwh))))

5. Save the copied JSON to a file
6. Use the JSON importer below (coming soon)

Method 3: API Integration (Advanced)
- PECO does not provide a public API
- Web scraping violates Terms of Service
- Manual export is the safest approach
    `;

    alert(instructions);
  };

  return (
    <div>
      {/* Data Overview */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '12px',
          }}
        >
          📊 Current Dataset
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          <StatCard
            label="Total Records"
            value={historicalData.length}
            unit="days"
          />
          <StatCard
            label="Date Range"
            value={
              historicalData.length > 0
                ? `${historicalData[0].date} to ${historicalData[historicalData.length - 1].date}`
                : 'No data'
            }
          />
          <StatCard
            label="Total Usage"
            value={historicalData.reduce((sum, d) => sum + d.usage_kwh, 0).toFixed(1)}
            unit="kWh"
          />
          <StatCard
            label="Total Cost"
            value={`$${historicalData.reduce((sum, d) => sum + d.cost_dollars, 0).toFixed(2)}`}
          />
        </div>
      </div>

      {/* Export Section */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '12px',
          }}
        >
          💾 Export Data
        </h3>
        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
          Download the current dataset as a CSV file for backup or sharing.
        </p>
        <button
          onClick={handleExportCSV}
          disabled={historicalData.length === 0}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '6px',
            border: 'none',
            background: historicalData.length > 0 ? '#10b981' : '#9ca3af',
            color: 'white',
            cursor: historicalData.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Download CSV ({historicalData.length} records)
        </button>
      </div>

      {/* Cache Management */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '12px',
          }}
        >
          🔄 Cache Management
        </h3>
        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
          If data appears incorrect or outdated, clear the cache and reload from the embedded CSV file.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              onClear();
              setImportStatus({
                type: 'success',
                message: 'Cache cleared! Reloading data from CSV...',
              });
              setTimeout(() => {
                onRefresh();
                setImportStatus(null);
              }, 500);
            }}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              border: 'none',
              background: '#f59e0b',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Clear Cache & Reload
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '12px',
          }}
        >
          📥 Import Data
        </h3>

        {/* PECO Integration */}
        <div
          style={{
            padding: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
            PECO Integration
          </h4>
          <p style={{ fontSize: '13px', color: '#1e40af', marginBottom: '8px' }}>
            Get your usage data directly from PECO:
          </p>
          <button
            onClick={handlePECOImport}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '4px',
              border: '1px solid #3b82f6',
              background: 'white',
              color: '#3b82f6',
              cursor: 'pointer',
            }}
          >
            📖 View Import Instructions
          </button>
        </div>

        {/* CSV Upload */}
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px',
            }}
          >
            Import from CSV File:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
            }}
          />
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            CSV should have columns: date, usage_kwh, temp_mean_f
          </p>
        </div>

        {/* Import Status */}
        {importStatus && (
          <div
            style={{
              padding: '12px',
              background: importStatus.type === 'success' ? '#d1fae5' : '#fef2f2',
              border: `1px solid ${importStatus.type === 'success' ? '#10b981' : '#ef4444'}`,
              borderRadius: '6px',
              fontSize: '13px',
              color: importStatus.type === 'success' ? '#065f46' : '#991b1b',
            }}
          >
            <strong>{importStatus.message}</strong>
            {importStatus.warnings && importStatus.warnings.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                ⚠️ Warnings:
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                  {importStatus.warnings.slice(0, 3).map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                  {importStatus.warnings.length > 3 && (
                    <li>...and {importStatus.warnings.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
            {importStatus.errors && (
              <div style={{ marginTop: '8px' }}>
                Errors:
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                  {importStatus.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Dataset Info */}
      <div
        style={{
          background: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
          color: '#4a5568',
        }}
      >
        <strong>ℹ️ About the Embedded Dataset:</strong>
        <p style={{ margin: '8px 0' }}>
          This app ships with {historicalData.length} days of actual electricity usage data
          (Oct 31, 2025 - Jan 9, 2026) from your PECO account.
        </p>
        <p style={{ margin: '8px 0' }}>
          The <strong>baseline model</strong> (Legal Minimum = 50.75 - 0.888 × temp) was derived
          from the period <strong>Jan 2+ onwards</strong> when the thermostat was set to the legal minimum (60°F).
        </p>
        <p style={{ margin: '8px 0' }}>
          Historical bills <strong>before Jan 2</strong> can be split fairly based on occupancy
          using this model.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div
      style={{
        padding: '12px',
        background: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
      }}
    >
      <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>
        {value}
        {unit && <span style={{ fontSize: '13px', fontWeight: '500', color: '#718096' }}> {unit}</span>}
      </div>
    </div>
  );
}
