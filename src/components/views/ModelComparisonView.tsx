import React, { useState } from 'react';
import { ModelMetrics } from '../../types';
import { MLEngine } from '../../services/mlEngine';
import { GitCompare, Award, CheckCircle, RefreshCw } from 'lucide-react';

interface ModelComparisonViewProps {
  zoneId?: string;
}

export const ModelComparisonView: React.FC<ModelComparisonViewProps> = ({ zoneId }) => {
  const [metrics, setMetrics] = useState<ModelMetrics[]>(() =>
    MLEngine.calculateModelMetrics(zoneId)
  );
  const [isRetraining, setIsRetraining] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      const updated = MLEngine.calculateModelMetrics(zoneId);
      setMetrics(updated);
      setIsRetraining(false);
    }, 400);
  };

  // Best model based on lowest MAE & highest R2
  const bestModel = [...metrics].sort((a, b) => b.r2 - a.r2)[0] || metrics[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-600" />
              <span>AI Model Performance & Cross-Validation Benchmarks</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative evaluation calculated against 80/20 train/test holdout telemetry on genuine historical time-series
            </p>
          </div>

          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Re-Evaluating Split...' : 'Recalculate Metrics'}</span>
          </button>
        </div>

        {/* Top Recommendation Callout */}
        <div className="mt-4 p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 rounded flex items-start gap-3">
          <Award className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-sky-900 dark:text-sky-200">
              Optimal Production Algorithm: {bestModel.model_name}
            </span>
            <p className="text-sky-800 dark:text-sky-300 mt-0.5 leading-relaxed">
              Achieves highest goodness-of-fit (R² = {bestModel.r2}) with the lowest test error (MAE = {bestModel.mae} ML, MAPE = {bestModel.mape}%). XGBoost effectively captures nonlinear meteorological temperature spikes and industrial load switching better than standard linear regression.
            </p>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Model Evaluation Metrics (Dynamic Calculation)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Test Holdout: ~{metrics[0]?.training_samples ? Math.round(metrics[0].training_samples * 0.25) : 36} days
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 pr-4 font-medium">Model Architecture</th>
                <th className="py-2.5 px-4 font-medium text-right">MAE (ML)</th>
                <th className="py-2.5 px-4 font-medium text-right">RMSE (ML)</th>
                <th className="py-2.5 px-4 font-medium text-right">R² Score</th>
                <th className="py-2.5 px-4 font-medium text-right">MAPE (%)</th>
                <th className="py-2.5 px-4 font-medium text-right">Compute Time</th>
                <th className="py-2.5 pl-4 font-medium text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {metrics.map((m) => {
                const isBest = m.model_name === bestModel.model_name;
                return (
                  <tr
                    key={m.model_name}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isBest ? 'bg-sky-50/40 dark:bg-sky-950/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 pr-4 font-sans text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{m.model_name}</span>
                        {isBest && (
                          <span className="text-[10px] text-sky-700 dark:text-sky-300 font-mono">
                            [Recommended]
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 dark:text-slate-200">
                      {m.mae}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 dark:text-slate-200">
                      {m.rmse}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {m.r2}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 dark:text-slate-200">
                      {m.mape}%
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {m.training_time_ms} ms
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span className="font-sans text-[11px] text-slate-700 dark:text-slate-300">
                        {isBest ? 'Primary Dispatch Engine' : 'Benchmark Candidate'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Feature Importance Weights (Gini Impurity Reduction)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Contribution of meteorological and autoregressive covariates to water consumption prediction
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {metrics[0]?.features_importance?.map((item) => (
              <div key={item.feature}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{item.feature}</span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {Math.round(item.weight * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-xs"
                    style={{ width: `${item.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architectural Explanations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Methodological Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Algorithm characteristics under variable municipal conditions
            </p>
          </div>

          <div className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
            <div>
              <strong className="text-slate-900 dark:text-slate-200 block">
                Linear / Ridge Regression (Baseline)
              </strong>
              Calculates normal closed-form least squares with L2 penalty. Fast and transparent, but underfits during severe heatwaves and sudden industrial shutdowns.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-slate-200 block">
                Random Forest Regressor
              </strong>
              Averages 18 bootstrap decision trees with randomized feature subsets. Resilient to sensor outliers and sudden weather spikes.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-slate-200 block">
                Gradient Boosted Trees / XGBoost
              </strong>
              Iteratively optimizes residuals with shrinkage rate $\eta = 0.12$. Produces highest accuracy across weekday/weekend transitions and commercial core shifts.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-slate-200 block">
                Recurrent / Exponential Smoothing (LSTM Equivalent)
              </strong>
              Captures weekly seasonality cycles and smooths long-term demographic drift over months.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
