export type UserRole = 'admin' | 'operator' | 'public';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export type RiskLevel = 'normal' | 'low' | 'medium' | 'high' | 'critical';

export interface Zone {
  id: string;
  code: string;
  name: string;
  city: string;
  type: 'residential' | 'industrial' | 'commercial' | 'mixed' | 'critical_infrastructure';
  population: number;
  latitude: number;
  longitude: number;
  priority_level: number; // 1 (lowest) to 5 (highest, e.g. hospitals / vital hubs)
  baseline_supply_ml: number; // Megaliters per day
  current_supply_ml: number;
  predicted_demand_ml: number;
  water_loss_rate: number; // percentage (0 - 100)
  status: RiskLevel;
  reservoir_source: string;
  pipeline_connections: string[];
}

export interface WaterConsumptionRecord {
  id: string;
  zone_id: string;
  date: string; // YYYY-MM-DD
  supplied_water: number; // Megaliters (ML)
  consumed_water: number; // Megaliters (ML)
  temperature: number; // Celsius
  rainfall: number; // mm
  humidity: number; // %
  population: number;
  day_of_week: number; // 0-6
  season: 'summer' | 'monsoon' | 'winter' | 'spring';
}

export type AIModelType = 'Linear Regression' | 'Random Forest' | 'XGBoost' | 'LSTM';

export interface ForecastDayResult {
  date: string;
  dayName: string;
  predicted_demand: number;
  confidence_score: number;
  risk_level: RiskLevel;
  lower_bound: number;
  upper_bound: number;
  available_supply: number;
  expected_shortage: number;
}

export interface ZoneForecastResult {
  zone_id: string;
  zone_name: string;
  model_used: AIModelType;
  period: '1d' | '7d' | '30d';
  generated_at: string;
  forecasts: ForecastDayResult[];
  summary: {
    total_projected_demand: number;
    avg_daily_demand: number;
    max_demand_day: string;
    max_demand_value: number;
    avg_confidence: number;
    highest_risk: RiskLevel;
    projected_shortage: number;
  };
}

export interface ModelMetrics {
  model_name: AIModelType;
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
  training_time_ms: number;
  training_samples: number;
  features_importance?: { feature: string; weight: number }[];
}

export type AlertType = 'shortage' | 'high_demand' | 'abnormal_loss' | 'supply_reduction' | 'critical';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'normal';

export interface Alert {
  id: string;
  zone_id: string;
  zone_name: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  metric_value?: number;
  unit?: string;
  threshold?: string;
  recommended_action?: string;
}

export interface ZoneOptimizationAllocation {
  zone_id: string;
  zone_name: string;
  priority_level: number;
  population: number;
  predicted_demand: number;
  current_allocation: number;
  recommended_allocation: number;
  delta: number;
  shortage_before: number;
  shortage_after: number;
  loss_rate: number;
  risk_level: RiskLevel;
  priority_score: number;
}

export interface OptimizationResult {
  id: string;
  timestamp: string;
  total_available_water: number;
  total_predicted_demand: number;
  total_current_allocation: number;
  total_recommended_allocation: number;
  total_deficit_before: number;
  total_deficit_after: number;
  deficit_reduction_pct: number;
  distribution_efficiency_pct: number;
  equity_index: number; // 0 to 1
  allocations: ZoneOptimizationAllocation[];
  recommendations: string[];
}

export interface SimulationParams {
  available_water_ml: number;
  temperature_change_c: number;
  rainfall_change_pct: number;
  population_change_pct: number;
}

export interface SimulationResult {
  id: string;
  timestamp: string;
  params: SimulationParams;
  baseline_demand_ml: number;
  simulated_demand_ml: number;
  demand_change_pct: number;
  available_water_ml: number;
  simulated_shortage_ml: number;
  shortage_rate_pct: number;
  high_risk_zones_count: number;
  distribution_efficiency_pct: number;
  zone_impacts: {
    zone_id: string;
    zone_name: string;
    baseline_demand: number;
    simulated_demand: number;
    current_supply: number;
    simulated_shortage: number;
    simulated_loss: number;
    risk: RiskLevel;
    recommended_allocation: number;
  }[];
  executive_directives: string[];
}

export interface CsvValidationSummary {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  missing_values_count: number;
  cleaned_rows_count: number;
  columns_found: string[];
  missing_columns: string[];
  preview_rows: Partial<WaterConsumptionRecord>[];
  errors: string[];
}
