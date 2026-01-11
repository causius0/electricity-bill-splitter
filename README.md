# 4046 Chestnut Apt 102 Electricity Bill Splitter

An interactive React application to fairly split electricity costs between flatmates based on temperature and usage data.

## Overview

This app uses a data-driven model to calculate fair cost splits between roommates when one person controls the thermostat. It distinguishes between:
- **Legal Minimum Cost**: Baseline electricity usage at the legal minimum thermostat setting (split 50/50)
- **Comfort Heating Cost**: Extra heating above the legal minimum (charged to whoever controls thermostat)

## Features

- **Predict Mode**: Estimate daily costs based on outdoor temperature
- **Calculate Split Mode**: Calculate actual cost breakdown with real usage data
- **Date Range Calculator**: Calculate costs over time periods (e.g., when flatmate was away)
- Interactive temperature slider with real-time calculations
- Beautiful gradient UI with smooth animations

## Model

Based on actual electricity usage data from Jan 2+ 2026 when thermostat was set to legal minimum:

```
Legal Minimum Usage (kWh) = 50.75 - 0.888 × Outdoor_Temp_F
Cost = Usage × $0.2061/kWh
```

### Example
At 30°F outdoor temperature:
- Legal minimum: 24.1 kWh/day ($4.97)
- Split 50/50: $2.49 each
- If actual usage is 51 kWh: Excess 27 kWh ($5.57) goes to thermostat controller
- Final split: You pay $2.49, Flatmate pays $8.06

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view in browser.

## Build

```bash
npm run build
```

## Technology Stack

- React 19
- Vite 7
- Pure CSS (no frameworks)

## Data Source

The model uses 71 days of real electricity usage data from PECO Energy combined with outdoor temperature data (Oct 31, 2025 - Jan 9, 2026).

## License

ISC
