import { useState } from 'react'
import { useElectricityModel } from './hooks/useElectricityModel'
import { useHistoricalData } from './hooks/useHistoricalData'
import { DataManager } from './components/Import/DataManager'
import { DecemberBaseline } from './components/December'
import { DecemberBillSplit } from './components/DecemberBill'
import { JanuaryBaseline } from './components/January'
import { Calculations } from './components/Calculations'
import './index.css'

function App() {
  const [outdoorTemp, setOutdoorTemp] = useState(30)
  const [actualUsage, setActualUsage] = useState(null)
  const [mode, setMode] = useState('december') // 'december' | 'december-bill' | 'january' | 'calculations' | 'data'

  // Load historical data for time window calculations
  const { data: historicalData, loading: loadingData, importData, export: exportData, clearData, refresh: loadData } = useHistoricalData()

  // Use the refactored calculation hook
  const calculation = useElectricityModel(actualUsage, outdoorTemp, 'flatmate')

  // Extract values for easier use in JSX
  const legalMinUsage = calculation.legalMinUsage
  const legalMinCost = calculation.legalMinCost
  const actualCost = calculation.actualCost || legalMinCost
  const excessUsage = calculation.excessUsage || 0
  const excessCost = calculation.excessCost || 0
  const yourShare = calculation.yourShare
  const flatmateShare = calculation.flatmateShare

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1a202c',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          4046 Chestnut Apt 102
        </h1>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '500',
          color: '#718096',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Fair Bill Splitting Based on Occupancy
        </h2>

        {/* Model Info */}
        <div style={{
          marginBottom: '24px',
          padding: '12px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af',
          textAlign: 'center'
        }}>
          <strong>📊 Baseline Model:</strong> Derived from Jan 2+ data (thermostat at legal minimum 60°F)<br/>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            Legal Minimum = 50.75 - (0.888 × Outdoor Temp °F)
          </span>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setMode('december')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'december' ? '#3b82f6' : '#e2e8f0',
              color: mode === 'december' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            December Baseline (Dec 3+)
          </button>
          <button
            onClick={() => setMode('december-bill')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'december-bill' ? '#3b82f6' : '#e2e8f0',
              color: mode === 'december-bill' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            December Bill (Nov 22-Dec 29)
          </button>
          <button
            onClick={() => setMode('january')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'january' ? '#3b82f6' : '#e2e8f0',
              color: mode === 'january' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            January Baseline (Jan 2+)
          </button>
          <button
            onClick={() => setMode('calculations')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'calculations' ? '#3b82f6' : '#e2e8f0',
              color: mode === 'calculations' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            Calculations & Graphs
          </button>
          <button
            onClick={() => setMode('data')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'data' ? '#3b82f6' : '#e2e8f0',
              color: mode === 'data' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            Manage Data
          </button>
        </div>

        {/* Temperature Input (only for december/january baseline modes) */}
        {(mode === 'december' || mode === 'january') && (
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '8px'
            }}>
              Outdoor Temperature
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="range"
                min="0"
                max="80"
                value={outdoorTemp}
                onChange={(e) => setOutdoorTemp(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(outdoorTemp/80)*100}%, #e2e8f0 ${(outdoorTemp/80)*100}%, #e2e8f0 100%)`,
                  WebkitAppearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '12px',
                color: '#718096'
              }}>
                <span>0°F</span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a202c'
                }}>
                  {outdoorTemp}°F
                </span>
                <span>80°F</span>
              </div>
            </div>
          </div>
        )}

      {/* December Baseline Mode */}
      {mode === 'december' && (
        <DecemberBaseline historicalData={historicalData} outdoorTemp={outdoorTemp} />
      )}

      {/* December Bill Mode */}
      {mode === 'december-bill' && (
        <DecemberBillSplit historicalData={historicalData} />
      )}

      {/* January Baseline Mode */}
      {mode === 'january' && (
        <JanuaryBaseline historicalData={historicalData} outdoorTemp={outdoorTemp} />
      )}

      {/* Calculations Mode */}
      {mode === 'calculations' && (
        <Calculations historicalData={historicalData} />
      )}

      {/* Data Management Mode */}
      {mode === 'data' && (
        <DataManager historicalData={historicalData} onImport={importData} onExport={exportData} onClear={clearData} onRefresh={loadData} />
      )}
      </div>
    </div>
  )
}

export default App
