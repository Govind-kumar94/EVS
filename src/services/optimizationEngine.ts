import { Zone, OptimizationResult, ZoneOptimizationAllocation, RiskLevel } from '../types';
import { DataStore } from './dataService';

export class OptimizationEngine {
  /**
   * Run multi-criteria water distribution optimization solver.
   * Total available water (ML) is partitioned across municipal zones.
   */
  public static optimizeDistribution(totalAvailableWaterML?: number): OptimizationResult {
    const zones = DataStore.getZones();
    
    // Sum current supply to calibrate default available water if not specified
    const currentTotalSupply = Math.round(zones.reduce((sum, z) => sum + z.current_supply_ml, 0) * 10) / 10;
    const availableWater = totalAvailableWaterML !== undefined ? totalAvailableWaterML : currentTotalSupply;
    
    const totalPredictedDemand = Math.round(zones.reduce((sum, z) => sum + z.predicted_demand_ml, 0) * 10) / 10;

    // Minimum baseline survival requirement: 80 L/capita/day = (population * 80) / 1e6 ML
    const minRequirements: Record<string, number> = {};
    zones.forEach((z) => {
      minRequirements[z.id] = Math.round(((z.population * 80) / 1_000_000) * 10) / 10;
    });

    const sumMinReq = Object.values(minRequirements).reduce((a, b) => a + b, 0);

    // If available water is severely depleted below minimum, scale proportionally
    let allocations: Record<string, number> = {};

    if (availableWater <= sumMinReq) {
      const scale = availableWater / (sumMinReq || 1);
      zones.forEach((z) => {
        allocations[z.id] = Math.round(minRequirements[z.id] * scale * 10) / 10;
      });
    } else {
      // Phase 1: Guarantee base minimum requirements
      let remainingWater = availableWater - sumMinReq;
      zones.forEach((z) => {
        allocations[z.id] = minRequirements[z.id];
      });

      // Phase 2: Compute priority and demand weights for unfulfilled demand
      // Weight = (Demand - Min) * (Priority^1.5) * (1 - LossRate/100 * 0.4)
      const weights: Record<string, number> = {};
      let totalWeight = 0;

      zones.forEach((z) => {
        const unfulfilledDemand = Math.max(0, z.predicted_demand_ml - minRequirements[z.id]);
        // Critical zones (like hospitals/data centers, priority 5) receive higher scaling
        const priorityMultiplier = Math.pow(z.priority_level / 3, 1.6);
        // Penalty for high-loss infrastructure (discourage pumping excess water into leaking zones until repaired)
        const lossEfficiencyFactor = 1 - Math.min(0.4, (z.water_loss_rate / 100) * 0.5);

        const w = unfulfilledDemand * priorityMultiplier * lossEfficiencyFactor;
        weights[z.id] = Math.max(0.1, w);
        totalWeight += weights[z.id];
      });

      // Distribute remaining water by normalized weight, clamped by predicted demand
      zones.forEach((z) => {
        const share = (weights[z.id] / totalWeight) * remainingWater;
        // Don't allocate more than 105% of predicted demand
        const ceiling = z.predicted_demand_ml * 1.05;
        const proposed = allocations[z.id] + share;
        allocations[z.id] = Math.round(Math.min(ceiling, proposed) * 10) / 10;
      });

      // Reconcile rounding slack to strictly match total available water
      let currentAllocatedSum = Object.values(allocations).reduce((a, b) => a + b, 0);
      let diff = Math.round((availableWater - currentAllocatedSum) * 10) / 10;

      if (Math.abs(diff) > 0.05) {
        // Distribute or subtract diff from lowest or highest priority zones
        const sortedByPriority = [...zones].sort((a, b) => b.priority_level - a.priority_level);
        for (const z of sortedByPriority) {
          if (diff === 0) break;
          const adj = diff > 0 ? 0.1 : -0.1;
          if (allocations[z.id] + adj >= minRequirements[z.id]) {
            allocations[z.id] = Math.round((allocations[z.id] + adj) * 10) / 10;
            diff = Math.round((diff - adj) * 10) / 10;
          }
        }
      }
    }

    // Build zone detailed breakdown
    const zoneResults: ZoneOptimizationAllocation[] = zones.map((z) => {
      const recommended = allocations[z.id] || z.current_supply_ml;
      const current = z.current_supply_ml;
      const demand = z.predicted_demand_ml;

      const shortageBefore = Math.round(Math.max(0, demand - current) * 10) / 10;
      const shortageAfter = Math.round(Math.max(0, demand - recommended) * 10) / 10;
      const delta = Math.round((recommended - current) * 10) / 10;

      // Priority score: 0 - 100
      const priorityScore = Math.round(
        (z.priority_level * 14) +
        (Math.min(1, demand / 50) * 20) +
        (shortageBefore > 0 ? 10 : 0)
      );

      let riskAfter: RiskLevel = 'normal';
      const shortagePct = (shortageAfter / (recommended || 1)) * 100;
      if (shortageAfter <= 0) riskAfter = 'normal';
      else if (shortagePct <= 10) riskAfter = 'low';
      else if (shortagePct <= 20) riskAfter = 'medium';
      else if (shortagePct <= 30) riskAfter = 'high';
      else riskAfter = 'critical';

      return {
        zone_id: z.id,
        zone_name: z.name,
        priority_level: z.priority_level,
        population: z.population,
        predicted_demand: demand,
        current_allocation: current,
        recommended_allocation: recommended,
        delta,
        shortage_before: shortageBefore,
        shortage_after: shortageAfter,
        loss_rate: z.water_loss_rate,
        risk_level: riskAfter,
        priority_score: priorityScore,
      };
    });

    const totalAllocated = Math.round(zoneResults.reduce((sum, r) => sum + r.recommended_allocation, 0) * 10) / 10;
    const totalDeficitBefore = Math.round(zoneResults.reduce((sum, r) => sum + r.shortage_before, 0) * 10) / 10;
    const totalDeficitAfter = Math.round(zoneResults.reduce((sum, r) => sum + r.shortage_after, 0) * 10) / 10;
    const deficitReduction = totalDeficitBefore > 0 
      ? Math.round(((totalDeficitBefore - totalDeficitAfter) / totalDeficitBefore) * 1000) / 10
      : 0;

    // Distribution efficiency: weighted fulfillment against transmission loss
    const totalConsumedExpected = zoneResults.reduce((sum, r) => sum + r.recommended_allocation * (1 - r.loss_rate / 100), 0);
    const distributionEfficiency = Math.round((totalConsumedExpected / (totalAllocated || 1)) * 1000) / 10;

    // Equity index (Gini coefficient inverse for water equity across population)
    const perCapitaAllocations = zoneResults.map((r) => (r.recommended_allocation * 1_000_000) / r.population);
    const meanPerCapita = perCapitaAllocations.reduce((a, b) => a + b, 0) / perCapitaAllocations.length;
    let giniDiffSum = 0;
    for (let i = 0; i < perCapitaAllocations.length; i++) {
      for (let j = 0; j < perCapitaAllocations.length; j++) {
        giniDiffSum += Math.abs(perCapitaAllocations[i] - perCapitaAllocations[j]);
      }
    }
    const gini = giniDiffSum / (2 * perCapitaAllocations.length * perCapitaAllocations.length * (meanPerCapita || 1));
    const equityIndex = Math.round(Math.max(0, Math.min(1, 1 - gini)) * 100) / 100;

    // Generate grounded decision-support recommendations
    const recommendations: string[] = [];
    
    // Check if total water is below demand
    if (availableWater < totalPredictedDemand) {
      const deficitPct = Math.round(((totalPredictedDemand - availableWater) / totalPredictedDemand) * 1000) / 10;
      recommendations.push(
        `Total available water (${availableWater} ML) is ${deficitPct}% below forecasted metropolitan demand (${totalPredictedDemand} ML). Municipal conservation protocol should be activated.`
      );
    }

    // High positive deltas (boosts)
    const topBoosted = [...zoneResults].sort((a, b) => b.delta - a.delta)[0];
    if (topBoosted && topBoosted.delta > 0.5) {
      recommendations.push(
        `Increase allocation to ${topBoosted.zone_name} by +${topBoosted.delta} ML to relieve severe industrial/population deficit.`
      );
    }

    // High negative deltas (savings from low risk zones)
    const topSaved = [...zoneResults].sort((a, b) => a.delta - b.delta)[0];
    if (topSaved && topSaved.delta < -0.5) {
      recommendations.push(
        `Throttle non-critical allocation to ${topSaved.zone_name} by ${Math.abs(topSaved.delta)} ML to prioritize critical health and civic districts.`
      );
    }

    // Leaking infrastructure warning
    const worstLossZone = [...zoneResults].sort((a, b) => b.loss_rate - a.loss_rate)[0];
    if (worstLossZone && worstLossZone.loss_rate > 20) {
      recommendations.push(
        `Containment priority: ${worstLossZone.zone_name} exhibits an abnormal loss rate of ${worstLossZone.loss_rate}%. Capping surplus allocation prevents wasting estimated ${Math.round(worstLossZone.recommended_allocation * (worstLossZone.loss_rate / 100) * 10) / 10} ML/day in transmission leakage.`
      );
    }

    return {
      id: `opt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      total_available_water: availableWater,
      total_predicted_demand: totalPredictedDemand,
      total_current_allocation: currentTotalSupply,
      total_recommended_allocation: totalAllocated,
      total_deficit_before: totalDeficitBefore,
      total_deficit_after: totalDeficitAfter,
      deficit_reduction_pct: deficitReduction,
      distribution_efficiency_pct: distributionEfficiency,
      equity_index: equityIndex,
      allocations: zoneResults,
      recommendations,
    };
  }
}
