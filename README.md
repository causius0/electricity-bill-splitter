# 4046 Chestnut Apt 102 - Fair Electricity Bill Splitter

An intelligent bill splitting application that calculates fair cost allocations between flatmates based on actual usage data and occupancy periods.

## 🎯 Purpose

Split electricity bills fairly when:
- One flatmate controls the thermostat
- People are away for extended periods
- You want to account for baseline vs. excess usage

## 📊 How It Works

### The Model

Based on **actual data from Jan 2+ 2026** when the thermostat was set to the legal minimum (68°F):

```
Legal Minimum Usage (kWh/day) = 50.75 - (0.888 × Outdoor Temperature °F)
```

This formula represents the baseline electricity needed to maintain legal minimum temperature.

### Cost Splitting Logic

1. **Legal Minimum Cost**: Split 50/50 (both benefit from baseline electricity)
2. **Excess Cost**: Charged to whoever controls the thermostat (for heating above legal minimum)
3. **Occupancy Adjustments**: Proportional splits when someone is away

### Example

At 30°F outdoor temperature:
- Legal minimum: 24.11 kWh/day ($4.97/day)
- If actual usage: 51 kWh/day ($10.51/day)
- Excess: 27 kWh ($5.57) → Goes to thermostat controller
- **Final split**:
  - Causio (baseline only): $2.49/day
  - Guala (baseline + excess): $8.06/day

## 🚀 Features

### 1. Baseline Model (Jan 2+)
- View the legal minimum model derived from actual usage data
- Predict daily costs based on temperature
- Enter actual usage to calculate splits
- **Uses only data from Jan 2+** (thermostat at legal minimum)

### 2. Split Historical Bills
- Select any time period (e.g., "Dec 18 - Jan 12")
- Define occupancy (who was home when)
- Automatic cost allocation based on:
  - Actual usage from your bills
  - Temperature data
  - Occupancy periods
- Perfect for: "Guala was away for 3 weeks, what does she owe?"

### 3. Data Management
- **Export**: Download your data as CSV
- **Import**: Add new data from PECO
- **Storage**: Data persists in browser (localStorage)
- **Privacy**: No data leaves your device

## 📦 Installation

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

## 🖥️ Usage

### Mode 1: View Baseline Model

Use this to understand the baseline model or predict daily costs.

1. Select "Baseline Model (Jan 2+)"
2. Adjust temperature slider
3. See predicted costs at legal minimum
4. Optional: Enter actual usage to see excess

### Mode 2: Split Historical Bills

Use this to split actual bills based on occupancy.

**Example: Guala away Dec 18 - Jan 12**

1. Select "Split Historical Bills"
2. Set date range: Dec 18, 2025 - Jan 12, 2026
3. Add occupancy period:
   - Start: Dec 18, 2025
   - End: Jan 12, 2026
   - Residents: Causio (1), Guala (0)
   - Controller: Causio
4. View results:
   - Total cost for period
   - Causio's share (100% during absence)
   - Daily breakdown table

### Mode 3: Manage Data

1. **Download Data**: Export current dataset as CSV
2. **Import from PECO**:
   - Option A: Manual CSV export (recommended)
   - Option B: Chrome DevTools script (see PECO_INTEGRATION.md)
3. **View Statistics**: See data coverage and totals

## 📥 Importing PECO Data

### Quick Start

1. Log in to [PECO](https://secure.peco.com)
2. Navigate to "My Bill & Usage" → "View My Usage"
3. Export or download your usage data
4. In the app, go to "Manage Data" → "Import CSV"

### Detailed Instructions

See [PECO_INTEGRATION.md](PECO_INTEGRATION.md) for:
- Manual CSV export steps
- Chrome DevTools extraction script
- Troubleshooting tips
- Alternative data sources

## 📊 Data Format

The app expects CSV files with these columns:

```csv
date,usage_kwh,temp_mean_f,temp_min_f,temp_max_f
2025-12-18,22.5,42.3,38.0,46.5
2025-12-19,25.1,40.2,35.0,45.3
```

**Required columns:**
- `date`: ISO format (YYYY-MM-DD)
- `usage_kwh`: Daily electricity usage
- `temp_mean_f`: Average outdoor temperature (°F)

**Optional columns:**
- `temp_min_f`: Daily low temperature
- `temp_max_f`: Daily high temperature

## 🏗️ Architecture

```
src/
├── utils/
│   ├── constants.js          # Model parameters (50.75, -0.888, $0.2061/kWh)
│   ├── calculations.js       # Pure calculation functions
│   ├── dateHelpers.js        # Date utilities
│   └── csvParser.js          # CSV import/export
├── hooks/
│   ├── useElectricityModel.js    # Calculation hook
│   └── useHistoricalData.js      # Data management
├── components/
│   ├── DateRange/           # Time window calculator
│   ├── Occupancy/           # Occupancy editor
│   └── Import/              # Data management UI
└── data/
    └── historicalData.js    # Embedded 71-day dataset
```

## 🔧 Technology Stack

- **React 19**: UI framework
- **Vite 7**: Build tool
- **date-fns**: Date manipulation
- **papaparse**: CSV parsing
- **Pure CSS**: No framework, lightweight

## 💾 Data Storage

- **Browser localStorage**: Primary storage
- **Capacity**: ~5MB (enough for years of daily data)
- **Privacy**: Data never leaves your device
- **Backup**: Export to CSV anytime

## 🎓 Methodology

### Why Jan 2+ Data?

The baseline model is derived from **Jan 2, 2026 onwards** because:
- Thermostat was set to legal minimum (68°F)
- This represents true baseline usage
- Period before Jan 2 may include excess heating

### The Formula

```
Legal Minimum = 50.75 - (0.888 × Temperature)
```

**Derived from:**
- 71 days of actual usage data
- Linear regression of usage vs. temperature
- R² value reflects model accuracy

### Fairness Principles

1. **Baseline electricity** is a shared necessity (50/50 split)
2. **Excess heating** is a choice (paid by thermostat controller)
3. **Occupancy matters**: Pay only for days you're present
4. **Transparency**: All calculations are visible

## 📈 Example Scenarios

### Scenario 1: Normal Period (Both Home)

```
Date: Jan 5, 2026
Temperature: 30°F
Usage: 51 kWh
Legal Min: 24.11 kWh
Excess: 27 kWh

Split:
- Causio: $2.49 (50% of legal min)
- Guala: $8.06 (50% + excess)
```

### Scenario 2: Flatmate Away

```
Period: Dec 18 - Jan 12 (26 days)
Guala away
Occupancy: Causio only

Calculation:
- Legal minimum split: Causio pays 100%
- Excess: Causio pays 100%
- Total: Causio pays full bill for period
```

### Scenario 3: Unusually Efficient Day

```
Temperature: 70°F
Legal minimum: -11.41 kWh (negative = no heating needed)
Actual usage: 15 kWh (lights, appliances)
Result: Both share $3.09 equally (savings!)
```

## 🚧 Known Limitations

1. **Temperature Data**: If PECO doesn't provide it, defaults to seasonal averages
2. **Historical Accuracy**: Model based on one apartment's data
3. **Future Predictions**: Temperature affects accuracy
4. **PECO Integration**: Manual export required (no API)

## 🔐 Privacy

- ✅ No data sent to servers
- ✅ No analytics or tracking
- ✅ No account required
- ✅ Works offline after initial load

## 📝 License

ISC

## 🤝 Contributing

This is a personal project, but suggestions welcome:

1. Improve the baseline model with more data
2. Add support for more flatmates
3. Create mobile app version
4. Integrate with smart home devices

## 📧 Support

For issues or questions:
1. Check [PECO_INTEGRATION.md](PECO_INTEGRATION.md)
2. Review data format requirements
3. Verify CSV imports match expected format
4. Test with smaller date ranges first

---

**Built with ❤️ for fair roommate economics**
