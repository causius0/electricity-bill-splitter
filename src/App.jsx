import { useState } from 'react'

function App() {
  // Model parameters from analysis
  const LEGAL_MIN_INTERCEPT = 50.75
  const LEGAL_MIN_SLOPE = -0.888
  const COST_PER_KWH = 0.2061

  const [outdoorTemp, setOutdoorTemp] = useState(30)
  const [actualUsage, setActualUsage] = useState(null)
  const [mode, setMode] = useState('predict') // 'predict' or 'calculate'

  // Calculate legal minimum usage
  const legalMinUsage = LEGAL_MIN_INTERCEPT + (LEGAL_MIN_SLOPE * outdoorTemp)
  const legalMinCost = legalMinUsage * COST_PER_KWH

  // Calculate excess if actual usage is provided
  const excessUsage = actualUsage ? actualUsage - legalMinUsage : 0
  const excessCost = excessUsage > 0 ? excessUsage * COST_PER_KWH : 0
  const totalCost = actualUsage ? actualUsage * COST_PER_KWH : legalMinCost

  // Cost split
  const yourShare = legalMinCost / 2
  const flatmateShare = legalMinCost / 2 + excessCost

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Electricity Cost Estimator
        </h2>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setMode('predict')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'predict' ? '#667eea' : '#e2e8f0',
              color: mode === 'predict' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            Predict Mode
          </button>
          <button
            onClick={() => setMode('calculate')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'calculate' ? '#667eea' : '#e2e8f0',
              color: mode === 'calculate' ? 'white' : '#4a5568',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            Calculate Split
          </button>
        </div>

        {/* Temperature Input */}
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

        {/* Actual Usage Input (Calculate mode only) */}
        {mode === 'calculate' && (
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '8px'
            }}>
              Actual Daily Usage (kWh)
            </label>
            <input
              type="number"
              placeholder="Enter actual usage from bill"
              value={actualUsage || ''}
              onChange={(e) => setActualUsage(e.target.value ? Number(e.target.value) : null)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        )}

        {/* Results */}
        <div style={{
          background: '#f7fafc',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '16px'
          }}>
            Cost Breakdown
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#718096' }}>Legal Minimum Usage:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>
                {legalMinUsage.toFixed(2)} kWh
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#718096' }}>Legal Minimum Cost:</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>
                ${legalMinCost.toFixed(2)}
              </span>
            </div>
          </div>

          {mode === 'calculate' && actualUsage && (
            <>
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#718096' }}>Actual Usage:</span>
                  <span style={{ fontWeight: '600' }}>
                    {actualUsage.toFixed(2)} kWh
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#718096' }}>Excess Usage:</span>
                  <span style={{
                    fontWeight: '600',
                    color: excessUsage > 0 ? '#ef4444' : '#22c55e'
                  }}>
                    {excessUsage > 0 ? '+' : ''}{excessUsage.toFixed(2)} kWh
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#718096' }}>Excess Cost:</span>
                  <span style={{
                    fontWeight: '600',
                    color: excessCost > 0 ? '#ef4444' : '#22c55e'
                  }}>
                    ${excessCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{
                borderTop: '2px solid #e2e8f0',
                paddingTop: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  <span style={{ color: '#1a202c' }}>Total Cost:</span>
                  <span style={{ color: '#667eea' }}>
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cost Split */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            opacity: 0.9
          }}>
            Fair Cost Split
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                Your Share (50% of legal min)
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700'
              }}>
                ${yourShare.toFixed(2)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                Flatmate Share (50% + excess)
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700'
              }}>
                ${flatmateShare.toFixed(2)}
              </div>
            </div>
          </div>

          {mode === 'calculate' && actualUsage && excessCost > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}>
              Flatmate pays ${excessCost.toFixed(2)} extra for comfort heating above legal minimum
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>How it works:</strong> Legal minimum cost is split 50/50.
          Any excess heating above the legal minimum temperature setting is charged
          to whoever controls the thermostat. Based on actual data from Jan 2+ period.
        </div>
      </div>
    </div>
  )
}

export default App
