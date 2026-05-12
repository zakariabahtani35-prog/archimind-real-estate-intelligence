/**
 * ML Domain Types
 */

export interface PricePredictionInput {
  city: string;
  district: string;
  property_type: string;
  surface_m2: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  parking?: boolean;
  furnished?: boolean;
  property_age: number;
}

export interface PricePredictionResponse {
  predicted_price: number;
  confidence_score: number;
  market_category: string;
  risk_level: string;
  investment_score: number;
}

export interface ClassificationInput extends PricePredictionInput {}

export interface ClassificationResponse {
  predicted_type: string;
  confidence_score: number;
  class_probabilities: Record<string, number>;
}

export interface ModelMetrics {
  mae: string;
  mse: string;
  rmse: string;
  r2_score: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1_score: string;
  roc_auc: string;
  status: string;
  name: string;
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
