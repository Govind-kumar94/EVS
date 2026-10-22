import { CsvValidationSummary, WaterConsumptionRecord } from '../types';
import { DataStore } from './dataService';

export class CsvService {
  public static parseAndValidateCsv(csvText: string): CsvValidationSummary {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return {
        total_rows: 0,
        valid_rows: 0,
        invalid_rows: 0,
        missing_values_count: 0,
        cleaned_rows_count: 0,
        columns_found: [],
        missing_columns: ['date', 'zone', 'supplied_water', 'consumed_water', 'temperature', 'rainfall', 'humidity', 'population'],
        preview_rows: [],
        errors: ['CSV file appears empty or missing header line.'],
      };
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const requiredColumns = ['date', 'zone', 'supplied_water', 'consumed_water', 'temperature', 'rainfall', 'humidity', 'population'];
    const missingColumns = requiredColumns.filter((rc) => !header.some((h) => h.includes(rc) || h === rc));

    if (missingColumns.length > 3) {
      return {
        total_rows: lines.length - 1,
        valid_rows: 0,
        invalid_rows: lines.length - 1,
        missing_values_count: 0,
        cleaned_rows_count: 0,
        columns_found: header,
        missing_columns: missingColumns,
        preview_rows: [],
        errors: [`Unrecognized column structure. Required headers include: ${requiredColumns.join(', ')}`],
      };
    }

    const getColIdx = (key: string) => header.findIndex((h) => h.includes(key));

    const dateIdx = getColIdx('date');
    const zoneIdx = getColIdx('zone');
    const suppIdx = getColIdx('supplied');
    const consIdx = getColIdx('consumed');
    const tempIdx = getColIdx('temp');
    const rainIdx = getColIdx('rain');
    const humIdx = getColIdx('humid');
    const popIdx = getColIdx('pop');

    let validRows = 0;
    let invalidRows = 0;
    let missingValuesCount = 0;
    const errors: string[] = [];
    const preview: Partial<WaterConsumptionRecord>[] = [];

    const availableZones = DataStore.getZones();
    const zoneMap: Record<string, string> = {};
    availableZones.forEach((z) => {
      zoneMap[z.id.toLowerCase()] = z.id;
      zoneMap[z.name.toLowerCase()] = z.id;
      zoneMap[z.code.toLowerCase()] = z.id;
    });

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/['"]/g, ''));
      if (cols.length < 4) {
        invalidRows++;
        continue;
      }

      const rawDate = dateIdx !== -1 ? cols[dateIdx] : '';
      const rawZone = zoneIdx !== -1 ? cols[zoneIdx] : '';
      const rawSupp = suppIdx !== -1 ? parseFloat(cols[suppIdx]) : NaN;
      const rawCons = consIdx !== -1 ? parseFloat(cols[consIdx]) : NaN;
      const rawTemp = tempIdx !== -1 ? parseFloat(cols[tempIdx]) : 28.0;
      const rawRain = rainIdx !== -1 ? parseFloat(cols[rainIdx]) : 0.0;
      const rawHum = humIdx !== -1 ? parseFloat(cols[humIdx]) : 65.0;
      const rawPop = popIdx !== -1 ? parseInt(cols[popIdx], 10) : 100000;

      // Validate date
      const isValidDate = !isNaN(Date.parse(rawDate));
      const targetZoneId = zoneMap[rawZone.toLowerCase()] || availableZones[0].id;

      if (!isValidDate || isNaN(rawSupp) || isNaN(rawCons)) {
        invalidRows++;
        missingValuesCount++;
        if (errors.length < 5) {
          errors.push(`Row ${i}: Missing or invalid values for date/supply/consumption.`);
        }
      } else {
        validRows++;
        if (preview.length < 6) {
          preview.push({
            date: rawDate,
            zone_id: targetZoneId,
            supplied_water: rawSupp,
            consumed_water: rawCons,
            temperature: isNaN(rawTemp) ? 28 : rawTemp,
            rainfall: isNaN(rawRain) ? 0 : rawRain,
            humidity: isNaN(rawHum) ? 65 : rawHum,
            population: isNaN(rawPop) ? 100000 : rawPop,
          });
        }
      }
    }

    return {
      total_rows: lines.length - 1,
      valid_rows: validRows,
      invalid_rows: invalidRows,
      missing_values_count: missingValuesCount,
      cleaned_rows_count: validRows,
      columns_found: header,
      missing_columns: missingColumns,
      preview_rows: preview,
      errors: errors.slice(0, 5),
    };
  }

  public static getSampleCsv(): string {
    return `date,zone,supplied_water,consumed_water,temperature,rainfall,humidity,population
2026-10-01,Zone A,42.5,39.1,32.4,0.0,58,245000
2026-10-01,Zone B,31.5,27.2,33.0,0.0,55,115000
2026-10-01,Zone C,49.5,45.2,31.8,0.0,62,320000
2026-10-01,Zone D,18.5,13.1,32.1,0.0,60,98000
2026-10-01,Zone E,28.0,24.8,30.5,2.1,70,185000
2026-10-01,Zone F,27.5,25.8,31.2,0.0,64,142000
2026-10-01,Zone G,14.0,12.3,31.0,0.0,61,88000
2026-10-01,Zone H,25.5,21.7,32.6,0.0,59,168000
2026-10-02,Zone A,43.1,39.8,33.2,0.0,54,245000
2026-10-02,Zone B,32.0,28.0,33.5,0.0,53,115000`;
  }

  public static exportToCsv(filename: string, rows: Record<string, any>[]): void {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val}"`;
            }
            return val ?? '';
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
