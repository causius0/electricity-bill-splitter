# PECO Integration Guide

This guide shows you how to extract electricity usage data from PECO and import it into the Bill Splitter app.

## Overview

The Bill Splitter app needs daily electricity usage and temperature data to:
1. Calculate the baseline model (from Jan 2+ when thermostat was at legal minimum)
2. Split historical bills based on occupancy

## Method 1: Manual CSV Export (Recommended)

**Steps:**
1. Log in to [PECO](https://secure.peco.com)
2. Navigate to: **My Account** → **My Bill & Usage** → **View My Usage**
3. Select your date range
4. Look for "Export" or "Download" button (usually CSV format)
5. Save the file
6. In the app, go to **Manage Data** → **Import CSV** and upload

**Advantages:**
- ✅ Official, supported method
- ✅ Reliable data format
- ✅ No technical skills needed
- ✅ Works with any browser

## Method 2: Chrome DevTools Quick Extraction

If PECO doesn't offer CSV export, use this Chrome DevTools script:

### Step-by-Step:

1. **Navigate to PECO Usage Data**
   - Log in to PECO
   - Go to your usage/billing history page

2. **Open Chrome DevTools**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Click the **Console** tab

3. **Run the Data Extraction Script**

   Copy and paste this script into the console:

   ```javascript
   // PECO Data Extraction Script
   // Run this in Chrome DevTools Console on PECO usage page

   (function() {
     const data = [];

     // Try multiple selectors for PECO data tables
     const selectors = [
       'table.usage-table tbody tr',
       '.daily-usage-row',
       '[data-date]',
       'tr[class*="usage"]'
     ];

     let rows = [];
     for (const selector of selectors) {
       rows = Array.from(document.querySelectorAll(selector));
       if (rows.length > 0) {
         console.log(`Found ${rows.length} rows with selector: ${selector}`);
         break;
       }
     }

     if (rows.length === 0) {
       console.error('No data rows found. Please inspect the page manually.');
       console.log('Try looking for table elements with: document.querySelectorAll("table")');
       return;
     }

     rows.forEach((row, index) => {
       try {
         // Extract data from table cells
         const cells = row.querySelectorAll('td');
         if (cells.length < 2) return;

         // Try different column orders
         const dateText = cells[0]?.textContent?.trim() ||
                         row.querySelector('[class*="date"]')?.textContent?.trim();
         const usageText = cells[1]?.textContent?.trim() ||
                         row.querySelector('[class*="usage"]')?.textContent?.trim();

         if (!dateText || !usageText) return;

         // Parse date (handle various formats)
         const dateMatch = dateText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
         if (!dateMatch) return;

         let [_, month, day, year] = dateMatch;
         if (year.length === 2) year = '20' + year;

         const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

         // Parse usage (remove non-numeric except decimal point)
         const usage = parseFloat(usageText.replace(/[^\d.]/g, ''));
         if (isNaN(usage) || usage < 0) return;

         // Estimate temperature (or leave as 0 if not available)
         const tempCell = row.querySelector('[class*="temp"]') ||
                        (cells[2] ? cells[2] : null);
         const temp = tempCell ?
           parseFloat(tempCell.textContent.replace(/[^\d.\-]/g, '')) : 0;

         data.push({
           date,
           usage_kwh: usage,
           temp_mean_f: temp || 50, // Default to 50°F if not found
           temp_min_f: temp || 50,
           temp_max_f: temp || 50,
         });
       } catch (err) {
         console.warn(`Error parsing row ${index}:`, err);
       }
     });

     // Sort by date
     data.sort((a, b) => a.date.localeCompare(b.date));

     // Generate CSV
     const headers = ['date', 'usage_kwh', 'temp_mean_f', 'temp_min_f', 'temp_max_f'];
     const csv = [
       headers.join(','),
       ...data.map(row => [
         row.date,
         row.usage_kwh.toFixed(2),
         row.temp_mean_f.toFixed(2),
         row.temp_min_f.toFixed(2),
         row.temp_max_f.toFixed(2)
       ].join(','))
     ].join('\n');

     // Download CSV
     const blob = new Blob([csv], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `peco-usage-${new Date().toISOString().split('T')[0]}.csv`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);

     console.log(`✅ Extracted ${data.length} records`);
     console.log(`Date range: ${data[0]?.date} to ${data[data.length-1]?.date}`);
     console.log('CSV file downloaded!');

     // Also copy to clipboard for backup
     copy(JSON.stringify(data, null, 2));
     console.log('📋 Data also copied to clipboard as JSON (paste into text file to save)');

   })();
   ```

4. **Check the Results**
   - The script will download a CSV file
   - It also copies data as JSON to your clipboard (paste into text editor as backup)
   - Check the Console for any errors

5. **Import into App**
   - Go to **Manage Data** → **Import CSV**
   - Upload the downloaded file

### Troubleshooting

**Script doesn't find data:**
```javascript
// Inspect page structure manually
console.log(document.querySelectorAll('table'));
console.log(document.querySelectorAll('[class*="usage"]'));
```

**Different date format:**
The script handles: `MM/DD/YYYY`, `MM-DD-YYYY`, `DD/MM/YYYY`

**Temperature data missing:**
The script defaults to 50°F if temperature isn't found. You can manually edit the CSV later.

## Method 3: Manual Entry (Fallback)

For a few days of data, enter manually:

1. Create a text file named `usage.csv`
2. Use this format:

```csv
date,usage_kwh,temp_mean_f,temp_min_f,temp_max_f
2026-01-15,25.3,45.2,42.0,48.5
2026-01-16,28.1,43.8,40.0,47.2
```

3. Import via **Manage Data** → **Import CSV**

## Method 4: PECO API (Not Available)

**Status:** PECO does not provide a public API for residential customers.

**Alternatives:**
- Manual CSV export (Method 1)
- Chrome DevTools extraction (Method 2)
- PECO customer support: Request data export via phone/chat

## Data Validation

After importing, verify:
- ✅ Total records match your billing period
- ✅ Date range is correct
- ✅ Usage values look reasonable (typically 10-100 kWh/day)
- ✅ Temperature values are plausible (0-100°F)

## Temperature Data Sources

If PECO doesn't provide temperature data:

1. **NOAA Weather Data**
   - Go to [NOAA Climate Data Online](https://www.ncdc.noaa.gov/cdo-web/)
   - Search for Philadelphia, PA
   - Download daily temperature data
   - Merge with usage data

2. **Weather API (for developers)**
   - OpenWeatherMap: https://openweathermap.org/api
   - Visual Crossing: https://www.visualcrossing.com/weather-api

3. **Default Estimates**
   - The app can estimate temperatures based on seasonal averages
   - Less accurate but sufficient for approximate splits

## Privacy & Security

- ⚠️ Never share your PECO login credentials
- ⚠️ Exported data contains your usage patterns (consider privacy)
- ✅ Data is stored locally in your browser (localStorage)
- ✅ No data is sent to external servers

## Need Help?

If you encounter issues:

1. **Check the Console** for error messages
2. **Verify the CSV format** matches the expected columns
3. **Try a smaller date range** first (test with 1 week)
4. **Contact PECO support** if the website layout changed

## Future Improvements

Potential enhancements (not yet implemented):
- [ ] Automated PECO scraper (fragile, breaks when UI changes)
- [ ] PDF bill parser (complex, variable formats)
- [ ] Direct PECO API integration (requires PECO to provide API)
- [ ] Browser extension for one-click export
