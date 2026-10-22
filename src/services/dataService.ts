import { Zone, WaterConsumptionRecord, Alert, RiskLevel } from '../types';

export const INITIAL_ZONES: Zone[] = [
  {
    id: 'zone-a',
    code: 'ZN-01',
    name: 'Zone A · Central Commercial & Civic',
    city: 'Metropolitan Water District',
    type: 'commercial',
    population: 245000,
    latitude: 19.0760,
    longitude: 72.8777,
    priority_level: 4,
    baseline_supply_ml: 41.5,
    current_supply_ml: 42.0,
    predicted_demand_ml: 45.2,
    water_loss_rate: 8.5,
    status: 'low',
    reservoir_source: 'Upper Vaitarna Reservoir',
    pipeline_connections: ['zone-b', 'zone-c', 'zone-f'],
  },
  {
    id: 'zone-b',
    code: 'ZN-02',
    name: 'Zone B · Industrial & Heavy Processing',
    city: 'Metropolitan Water District',
    type: 'industrial',
    population: 115000,
    latitude: 19.1120,
    longitude: 72.9150,
    priority_level: 3,
    baseline_supply_ml: 32.0,
    current_supply_ml: 31.5,
    predicted_demand_ml: 39.8,
    water_loss_rate: 14.2,
    status: 'high',
    reservoir_source: 'Tansa Filtration Plant',
    pipeline_connections: ['zone-a', 'zone-d', 'zone-e'],
  },
  {
    id: 'zone-c',
    code: 'ZN-03',
    name: 'Zone C · North Residential Enclave',
    city: 'Metropolitan Water District',
    type: 'residential',
    population: 320000,
    latitude: 19.1680,
    longitude: 72.8520,
    priority_level: 4,
    baseline_supply_ml: 50.0,
    current_supply_ml: 49.5,
    predicted_demand_ml: 51.0,
    water_loss_rate: 9.1,
    status: 'normal',
    reservoir_source: 'Bhatsa Feeder Line',
    pipeline_connections: ['zone-a', 'zone-g'],
  },
  {
    id: 'zone-d',
    code: 'ZN-04',
    name: 'Zone D · West Ridge & Hill Slopes',
    city: 'Metropolitan Water District',
    type: 'mixed',
    population: 98000,
    latitude: 19.0410,
    longitude: 72.8250,
    priority_level: 3,
    baseline_supply_ml: 19.0,
    current_supply_ml: 18.5,
    predicted_demand_ml: 17.8,
    water_loss_rate: 29.4, // Abnormal loss!
    status: 'high',
    reservoir_source: 'Tulsi Balancing Reservoir',
    pipeline_connections: ['zone-b', 'zone-e'],
  },
  {
    id: 'zone-e',
    code: 'ZN-05',
    name: 'Zone E · South Basin & Port Terminals',
    city: 'Metropolitan Water District',
    type: 'mixed',
    population: 185000,
    latitude: 18.9600,
    longitude: 72.8400,
    priority_level: 3,
    baseline_supply_ml: 28.5,
    current_supply_ml: 28.0,
    predicted_demand_ml: 29.2,
    water_loss_rate: 11.8,
    status: 'low',
    reservoir_source: 'Modak Sagar Pipeline',
    pipeline_connections: ['zone-b', 'zone-d'],
  },
  {
    id: 'zone-f',
    code: 'ZN-06',
    name: 'Zone F · Tech Corridor & Medical Hub',
    city: 'Metropolitan Water District',
    type: 'critical_infrastructure',
    population: 142000,
    latitude: 19.1300,
    longitude: 72.8300,
    priority_level: 5, // Top priority - hospitals & data centers
    baseline_supply_ml: 27.0,
    current_supply_ml: 27.5,
    predicted_demand_ml: 28.1,
    water_loss_rate: 6.8,
    status: 'normal',
    reservoir_source: 'Bhatsa Feeder Line',
    pipeline_connections: ['zone-a', 'zone-c'],
  },
  {
    id: 'zone-g',
    code: 'ZN-07',
    name: 'Zone G · Highland Heights Suburb',
    city: 'Metropolitan Water District',
    type: 'residential',
    population: 88000,
    latitude: 19.2100,
    longitude: 72.8600,
    priority_level: 2,
    baseline_supply_ml: 14.5,
    current_supply_ml: 14.0,
    predicted_demand_ml: 15.6,
    water_loss_rate: 12.5,
    status: 'medium',
    reservoir_source: 'Upper Vaitarna Reservoir',
    pipeline_connections: ['zone-c'],
  },
  {
    id: 'zone-h',
    code: 'ZN-08',
    name: 'Zone H · River Valley East & Agri Fringe',
    city: 'Metropolitan Water District',
    type: 'mixed',
    population: 168000,
    latitude: 19.0800,
    longitude: 72.9900,
    priority_level: 3,
    baseline_supply_ml: 26.0,
    current_supply_ml: 25.5,
    predicted_demand_ml: 26.8,
    water_loss_rate: 15.1,
    status: 'low',
    reservoir_source: 'Middle Vaitarna Line',
    pipeline_connections: ['zone-b'],
  },
];

// Generate 180 days of realistic municipal time series data
export function generateSyntheticHistory(): WaterConsumptionRecord[] {
  const records: WaterConsumptionRecord[] = [];
  const today = new Date('2026-10-05');
  const daysBack = 180;

  INITIAL_ZONES.forEach((zone) => {
    // Zone specific loss baseline
    const baseLossPct = zone.id === 'zone-d' ? 0.29 : zone.water_loss_rate / 100;

    for (let i = daysBack; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const month = d.getMonth(); // 0 - 11

      // Seasonality
      let season: 'summer' | 'monsoon' | 'winter' | 'spring' = 'winter';
      let tempMean = 26;
      let rainProb = 0.05;
      let rainMax = 4;

      if (month >= 2 && month <= 5) {
        season = 'summer';
        tempMean = 34;
        rainProb = 0.08;
        rainMax = 8;
      } else if (month >= 6 && month <= 8) {
        season = 'monsoon';
        tempMean = 28;
        rainProb = 0.70;
        rainMax = 75;
      } else if (month >= 9 && month <= 10) {
        season = 'spring';
        tempMean = 30;
        rainProb = 0.20;
        rainMax = 20;
      }

      // Pseudo-random deterministic noise based on zone and date hash
      const hash = Math.sin(zone.population * 0.001 + i * 13.37 + dayOfWeek * 7.1);
      const rand1 = (hash - Math.floor(hash));
      const rand2 = (Math.cos(i * 19.2) - Math.floor(Math.cos(i * 19.2)));

      const temperature = Math.round((tempMean + (rand1 - 0.5) * 6) * 10) / 10;
      const rainfall = rand2 < rainProb ? Math.round(rand1 * rainMax * 10) / 10 : 0;
      const humidity = Math.min(95, Math.max(35, Math.round(50 + (rainfall > 0 ? 30 : 0) + (rand2 - 0.5) * 20)));

      // Base consumption: per-capita ~ 150 liters/person/day = (pop * 150) / 1,000,000 ML
      const baseLitersPerCapita = zone.type === 'industrial' ? 260 : zone.type === 'critical_infrastructure' ? 190 : 145;
      const baseConsumptionML = (zone.population * baseLitersPerCapita) / 1_000_000;

      // Weather impact:
      // High temperature increases demand (+1.8% per °C above 28°C)
      const tempFactor = 1 + Math.max(0, temperature - 28) * 0.018;
      // Rain decreases garden/outdoor demand (-8% if rainfall > 5mm)
      const rainFactor = rainfall > 5 ? 0.92 : 1.0;
      // Weekend effect: Commercial drops, Residential rises
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = zone.type === 'commercial' ? (isWeekend ? 0.82 : 1.05) : zone.type === 'residential' ? (isWeekend ? 1.08 : 0.98) : 1.0;

      // Trend growth over 180 days (population creeping slightly)
      const trendFactor = 1 + ((daysBack - i) / daysBack) * 0.02;

      // In Zone B: Industrial surge scenario in the last 14 days
      let surge = 1.0;
      if (zone.id === 'zone-b' && i <= 14) {
        surge = 1.18; // 18% surge triggering shortage
      }

      const consumed = Math.round((baseConsumptionML * tempFactor * rainFactor * weekendFactor * trendFactor * surge + (rand1 - 0.5) * 1.2) * 10) / 10;
      
      // Supplied water has transmission loss
      const lossRate = baseLossPct + (rand2 - 0.5) * 0.03;
      const supplied = Math.round((consumed / (1 - lossRate)) * 10) / 10;

      records.push({
        id: `rec-${zone.id}-${dateStr}`,
        zone_id: zone.id,
        date: dateStr,
        supplied_water: supplied,
        consumed_water: consumed,
        temperature,
        rainfall,
        humidity,
        population: zone.population,
        day_of_week: dayOfWeek,
        season,
      });
    }
  });

  return records;
}

export function generateInitialAlerts(): Alert[] {
  return [
    {
      id: 'alt-001',
      zone_id: 'zone-b',
      zone_name: 'Zone B · Industrial & Heavy Processing',
      alert_type: 'shortage',
      severity: 'high',
      message: 'Projected demand (39.8 ML) exceeds allocated supply (31.5 ML) by 8.3 ML (+26.3% deficit).',
      status: 'active',
      created_at: '2026-10-05 06:30',
      metric_value: 8.3,
      unit: 'ML',
      threshold: 'Deficit > 5.0 ML',
      recommended_action: 'Invoke priority rebalancing: Reroute 4.2 ML from Upper Vaitarna and throttle non-critical industrial pipelines.',
    },
    {
      id: 'alt-002',
      zone_id: 'zone-d',
      zone_name: 'Zone D · West Ridge & Hill Slopes',
      alert_type: 'abnormal_loss',
      severity: 'high',
      message: 'Abnormal water loss detected at 29.4% (5.4 ML non-revenue water/day) along West Ridge feeder lines.',
      status: 'active',
      created_at: '2026-10-05 04:15',
      metric_value: 29.4,
      unit: '%',
      threshold: 'Loss > 20.0%',
      recommended_action: 'Dispatch field telemetry acoustic audit to Trunk Line T-4 West Sector; schedule valve inspection.',
    },
    {
      id: 'alt-003',
      zone_id: 'zone-g',
      zone_name: 'Zone G · Highland Heights Suburb',
      alert_type: 'high_demand',
      severity: 'medium',
      message: 'Elevated temperature forecast (+3.4°C) driving 11.2% demand surge over baseline allocation.',
      status: 'active',
      created_at: '2026-10-04 18:00',
      metric_value: 1.6,
      unit: 'ML',
      threshold: 'Demand surge > 10%',
      recommended_action: 'Pre-charge Highland hilltop gravity tanks during off-peak night pumping window (01:00 - 05:00).',
    },
    {
      id: 'alt-004',
      zone_id: 'zone-a',
      zone_name: 'Zone A · Central Commercial & Civic',
      alert_type: 'shortage',
      severity: 'medium',
      message: 'Civic core water deficit approaching 3.2 ML during peak business hours (11:00 - 16:00).',
      status: 'active',
      created_at: '2026-10-04 12:45',
      metric_value: 3.2,
      unit: 'ML',
      threshold: 'Deficit > 3.0 ML',
      recommended_action: 'Enable secondary pressure modulation valves at Central Station #4.',
    },
    {
      id: 'alt-005',
      zone_id: 'zone-f',
      zone_name: 'Zone F · Tech Corridor & Medical Hub',
      alert_type: 'supply_reduction',
      severity: 'normal',
      message: 'Bhatsa Feeder Line scheduled maintenance completed. 100% operational supply restored to clinical district.',
      status: 'acknowledged',
      created_at: '2026-10-03 09:00',
      metric_value: 27.5,
      unit: 'ML',
      threshold: 'Nominal operation',
      recommended_action: 'No action required. Telemetry within nominal parameters.',
    },
  ];
}

const STORAGE_KEYS = {
  ZONES: 'aquaplan_zones_v1',
  HISTORY: 'aquaplan_history_v1',
  ALERTS: 'aquaplan_alerts_v1',
  USER: 'aquaplan_current_user_v1',
  CONFIG: 'aquaplan_sys_config_v1',
};

export class DataStore {
  private static zones: Zone[] | null = null;
  private static history: WaterConsumptionRecord[] | null = null;
  private static alerts: Alert[] | null = null;

  public static getZones(): Zone[] {
    if (!this.zones) {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ZONES);
        if (stored) {
          this.zones = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('LocalStorage access error:', e);
      }
      if (!this.zones || this.zones.length === 0) {
        this.zones = [...INITIAL_ZONES];
        this.saveZones();
      }
    }
    return this.zones;
  }

  public static saveZones(): void {
    if (this.zones) {
      try {
        localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(this.zones));
      } catch (e) {
        console.warn('Failed to save zones:', e);
      }
    }
  }

  public static updateZone(zoneId: string, updates: Partial<Zone>): Zone | null {
    const zones = this.getZones();
    const idx = zones.findIndex((z) => z.id === zoneId);
    if (idx !== -1) {
      zones[idx] = { ...zones[idx], ...updates };
      this.saveZones();
      return zones[idx];
    }
    return null;
  }

  public static getHistory(): WaterConsumptionRecord[] {
    if (!this.history) {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (stored) {
          this.history = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('LocalStorage history access error:', e);
      }
      if (!this.history || this.history.length === 0) {
        this.history = generateSyntheticHistory();
        this.saveHistory();
      }
    }
    return this.history;
  }

  public static saveHistory(): void {
    if (this.history) {
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.history));
      } catch (e) {
        console.warn('Failed to save history:', e);
      }
    }
  }

  public static appendHistoryRecords(newRecords: WaterConsumptionRecord[]): void {
    const current = this.getHistory();
    this.history = [...current, ...newRecords];
    this.saveHistory();
  }

  public static getAlerts(): Alert[] {
    if (!this.alerts) {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
        if (stored) {
          this.alerts = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('LocalStorage alerts access error:', e);
      }
      if (!this.alerts || this.alerts.length === 0) {
        this.alerts = generateInitialAlerts();
        this.saveAlerts();
      }
    }
    return this.alerts;
  }

  public static saveAlerts(): void {
    if (this.alerts) {
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.alerts));
      } catch (e) {
        console.warn('Failed to save alerts:', e);
      }
    }
  }

  public static addAlert(alert: Alert): void {
    const alerts = this.getAlerts();
    this.alerts = [alert, ...alerts];
    this.saveAlerts();
  }

  public static updateAlertStatus(alertId: string, status: 'active' | 'acknowledged' | 'resolved'): void {
    const alerts = this.getAlerts();
    const target = alerts.find((a) => a.id === alertId);
    if (target) {
      target.status = status;
      this.saveAlerts();
    }
  }

  public static resetToDemoDefaults(): void {
    this.zones = [...INITIAL_ZONES];
    this.history = generateSyntheticHistory();
    this.alerts = generateInitialAlerts();
    this.saveZones();
    this.saveHistory();
    this.saveAlerts();
  }
}
