import { SimulationParams, SimulationResult, RiskLevel } from '../types';
import { DataStore } from './dataService';
import { OptimizationEngine } from './optimizationEngine';

export class SimulatorEngine {
  public static runSimulation(params: SimulationParams): SimulationResult {
    const zones = DataStore.getZones();
    const baselineDemandTotal = Math.round(zones.reduce((sum, z) => sum + z.predicted_demand_ml, 0) * 10) / 10;
    
    // Elasticity coefficients based on hydrological engineering:
    // Temperature: +1.8% demand per +1°C
    // Rainfall: -0.25% demand per +1% rainfall (outdoor irrigation substitution)
    // Population: +0.95% demand per +1% population growth
    const tempImpactPct = params.temperature_change_c * 1.8;
    const rainImpactPct = (-params.rainfall_change_pct) * 0.25; // Less rain -> more demand
    const popImpactPct = params.population_change_pct * 0.95;

    const netDemandFactor = 1 + (tempImpactPct + rainImpactPct + popImpactPct) / 100;

    let simulatedDemandTotal = 0;
    let highRiskCount = 0;

    const zoneImpacts = zones.map((z) => {
      // Differential zone sensitivity (industrial has lower rain sensitivity, residential has higher)
      let zoneFactor = netDemandFactor;
      if (z.type === 'residential') {
        zoneFactor = 1 + (params.temperature_change_c * 2.1 - params.rainfall_change_pct * 0.35 + params.population_change_pct * 1.0) / 100;
      } else if (z.type === 'industrial') {
        zoneFactor = 1 + (params.temperature_change_c * 1.2 + params.population_change_pct * 0.4) / 100;
      }

      const simDemand = Math.round(z.predicted_demand_ml * Math.max(0.6, zoneFactor) * 10) / 10;
      simulatedDemandTotal += simDemand;

      const simLoss = Math.round(z.current_supply_ml * (z.water_loss_rate / 100) * 10) / 10;
      const shortage = Math.round(Math.max(0, simDemand - z.current_supply_ml) * 10) / 10;

      let risk: RiskLevel = 'normal';
      const shortagePct = (shortage / (z.current_supply_ml || 1)) * 100;
      if (shortage <= 0) risk = 'normal';
      else if (shortagePct <= 10) risk = 'low';
      else if (shortagePct <= 20) risk = 'medium';
      else if (shortagePct <= 30) risk = 'high';
      else risk = 'critical';

      if (risk === 'high' || risk === 'critical') {
        highRiskCount++;
      }

      // Quick allocation heuristic proportional to population & priority
      const recommended = Math.round((simDemand * 0.96) * 10) / 10;

      return {
        zone_id: z.id,
        zone_name: z.name,
        baseline_demand: z.predicted_demand_ml,
        simulated_demand: simDemand,
        current_supply: z.current_supply_ml,
        simulated_shortage: shortage,
        simulated_loss: simLoss,
        risk,
        recommended_allocation: recommended,
      };
    });

    simulatedDemandTotal = Math.round(simulatedDemandTotal * 10) / 10;
    const demandChangePct = Math.round(((simulatedDemandTotal - baselineDemandTotal) / baselineDemandTotal) * 1000) / 10;
    const simulatedShortageTotal = Math.round(Math.max(0, simulatedDemandTotal - params.available_water_ml) * 10) / 10;
    const shortageRatePct = Math.round((simulatedShortageTotal / (params.available_water_ml || 1)) * 1000) / 10;

    // Run optimization on simulated water
    const opt = OptimizationEngine.optimizeDistribution(params.available_water_ml);

    // Build executive directives
    const directives: string[] = [];
    directives.push(
      `Under a ${params.temperature_change_c >= 0 ? '+' : ''}${params.temperature_change_c}°C thermal shift and ${params.rainfall_change_pct >= 0 ? '+' : ''}${params.rainfall_change_pct}% rainfall delta, metropolitan water demand shifts by ${demandChangePct >= 0 ? '+' : ''}${demandChangePct}%.`
    );

    if (simulatedShortageTotal > 0) {
      directives.push(
        `Critical deficit of ${simulatedShortageTotal} ML (${shortageRatePct}% of total availability) anticipated. ${highRiskCount} zone(s) reach High or Critical risk thresholds.`
      );
      directives.push(
        `Immediate mitigation: Prioritize baseline residential rations and Hospital Hub (Zone F) while restricting non-essential industrial draw.`
      );
    } else {
      directives.push(
        `Available reservoir storage (${params.available_water_ml} ML) is sufficient to fulfill simulated demand with a surplus buffer of ${Math.round((params.available_water_ml - simulatedDemandTotal) * 10) / 10} ML.`
      );
    }

    return {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      params,
      baseline_demand_ml: baselineDemandTotal,
      simulated_demand_ml: simulatedDemandTotal,
      demand_change_pct: demandChangePct,
      available_water_ml: params.available_water_ml,
      simulated_shortage_ml: simulatedShortageTotal,
      shortage_rate_pct: shortageRatePct,
      high_risk_zones_count: highRiskCount,
      distribution_efficiency_pct: opt.distribution_efficiency_pct,
      zone_impacts: zoneImpacts,
      executive_directives: directives,
    };
  }
}
