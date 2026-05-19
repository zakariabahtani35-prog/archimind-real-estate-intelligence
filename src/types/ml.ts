/**
 * ML Domain Types
 */

export interface PricePredictionInput {
  city: string;
  district: string;
  surface_m2: number;
  bedrooms: number;
  bathrooms: number;
  property_type?: string;
  floor?: number;
  price_per_m2?: number;
  parking?: boolean;
  furnished?: boolean;
  property_age?: number;
}

export interface PricePredictionResponse {
  predicted_price: number;
  estimated_range: {
    lower: number | null;
    upper: number | null;
    basis_rmse: number | null;
  };
  model_reliability_indicator: {
    label: string;
    basis: string;
    r2_score?: number | null;
    rmse?: number | null;
    cv_rmse_mean?: number | null;
  };
  out_of_distribution_warning: boolean;
  warnings: string[];
  model_name: string;
}

export interface ClassificationInput extends PricePredictionInput {}

export interface ClassificationResponse {
  predicted_label: string;
  confidence_score: number;
  class_probabilities: Record<string, number>;
  label_source?: string | null;
  model_name: string;
}

export interface ModelMetrics {
  mae?: number | null;
  mse?: number | null;
  rmse?: number | null;
  r2_score?: number | null;
  accuracy?: number | null;
  precision_macro?: number | null;
  recall_macro?: number | null;
  f1_macro?: number | null;
  roc_auc_macro?: number | null;
  cv_score_mean?: number | null;
  cv_score_std?: number | null;
  cv_rmse_mean?: number | null;
  cv_rmse_std?: number | null;
  label_source?: string | null;
  status: string;
  name: string;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  price_model_ready: boolean;
  classification_model_ready: boolean;
}

export interface DbHealthStatus {
  status: string;
  database?: string | null;
  table_schema: string;
  table_name: string;
  table_exists: boolean;
  row_count?: number | null;
  columns: string[];
  missing_required_columns: string[];
  missing_recommended_columns: string[];
  message: string;
}

export interface ModelStatus {
  price_model_ready: boolean;
  classification_model_ready: boolean;
  price_model_path: string;
  classification_model_path: string;
  regression_report_ready: boolean;
  classification_report_ready: boolean;
  error_analysis_ready: boolean;
  feature_importance_ready: boolean;
  latest_training_timestamp?: string | null;
}

export interface DatasetSummary {
  source_table: string;
  row_count: number;
  column_count: number;
  columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  missing_values: Array<{ column: string; missing_count: number; missing_ratio: number }>;
  sample_records: Array<Record<string, unknown>>;
  missing_required_columns: string[];
  missing_recommended_columns: string[];
  price: Record<'min' | 'max' | 'mean' | 'median', number | null>;
  surface_m2: Record<'min' | 'max' | 'mean' | 'median', number | null>;
  cities: Array<{ value: string; count: number }>;
  districts: Array<{ value: string; count: number }>;
}

export interface PropertyRecord {
  id: string;
  city: string;
  district: string;
  property_type: string;
  price: number;
  surface_m2: number;
  bedrooms: number;
  bathrooms: number;
  status: 'Predicted' | 'Actual';
  created_at?: string;
}

export interface AnalyticsData {
  price_distribution: Array<{ price: string; count: number }>;
  market_trends: Array<{ month: string; price: number }>;
  feature_importance: Array<{ feature: string; score: number }>;
}

export interface ArtifactResponse<T = Record<string, unknown>> {
  data: T;
}

export interface RegressionReport {
  generated_at: string;
  source_table: string;
  split: Record<string, number>;
  dataset: Record<string, unknown>;
  model_comparison: ModelMetrics[];
  best_model: ModelMetrics;
  hyperparameter_tuning: Record<string, unknown>;
}

export interface ClassificationReport {
  generated_at: string;
  source_table: string;
  split: Record<string, number>;
  dataset: Record<string, unknown>;
  class_distribution: Record<string, number>;
  model_comparison: ModelMetrics[];
  best_model: ModelMetrics;
  labels: string[];
  confusion_matrix: number[][];
  per_class: Array<{ class: string; precision: number; recall: number; f1: number; support: number }>;
}

export interface ErrorAnalysisReport {
  regression?: {
    residual_summary: Record<string, number>;
    mae_by_city: Array<{ group: string; mae: number }>;
    mae_by_property_type: Array<{ group: string; mae: number }>;
    top_over_predicted_samples: Array<Record<string, unknown>>;
    top_under_predicted_samples: Array<Record<string, unknown>>;
  };
  classification?: {
    labels: string[];
    confusion_matrix: number[][];
    per_class: Array<{ class: string; precision: number; recall: number; f1: number; support: number }>;
    worst_performing_class?: { class: string; precision: number; recall: number; f1: number; support: number } | null;
  };
}

export interface FeatureImportanceReport {
  regression?: {
    model_name: string;
    method: string;
    top_features: Array<{ feature: string; importance: number }>;
  };
  classification?: {
    model_name: string;
    method: string;
    top_features: Array<{ feature: string; importance: number }>;
  };
}
