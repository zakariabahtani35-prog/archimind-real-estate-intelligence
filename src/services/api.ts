import { 
  PricePredictionInput, 
  PricePredictionResponse, 
  ClassificationInput, 
  ClassificationResponse,
  ModelMetrics,
  PropertyRecord,
  AnalyticsData
} from '../types/ml';
import { 
  MOCK_PROPERTIES, 
  PRICE_DISTRIBUTION, 
  MARKET_TRENDS, 
  FEATURE_IMPORTANCE,
  MODEL_METRICS_DATA
} from '../lib/data';
import { appEnv } from '../config/env';

const API_URL = appEnv.apiUrl;

const handleApiError = (message: string, error: unknown): never => {
  const details = error instanceof Error ? error.message : String(error);
  throw new Error(`${message}: ${details}`);
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Enterprise ML API Service
 * Handles communication with the FastAPI backend.
 */
export const MLService = {
  /**
   * Predict property price using trained regression models.
   */
  async predictPrice(input: PricePredictionInput): Promise<PricePredictionResponse> {
    try {
      return await requestJson<PricePredictionResponse>('/predict-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    } catch (error) {
      if (!appEnv.enableMocks) handleApiError('Price prediction API request failed', error);
      return new Promise((resolve) => setTimeout(() => resolve({
        predicted_price: 1850000 + (Math.random() * 500000),
        confidence_score: 94.2,
        market_category: 'Premium Residential',
        risk_level: 'Stable',
        investment_score: 8.5
      }), 1200));
    }
  },

  /**
   * Classify property category or type.
   */
  async predictType(input: ClassificationInput): Promise<ClassificationResponse> {
    try {
      return await requestJson<ClassificationResponse>('/predict-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    } catch (error) {
      if (!appEnv.enableMocks) handleApiError('Property classification API request failed', error);
      return {
        predicted_type: input.property_type,
        confidence_score: 0.98,
        class_probabilities: { [input.property_type]: 0.98, 'Other': 0.02 }
      };
    }
  },

  /**
   * Fetch current model performance metrics.
   */
  async getMetrics(): Promise<ModelMetrics[]> {
    try {
      return await requestJson<ModelMetrics[]>('/metrics');
    } catch (error) {
      if (!appEnv.enableMocks) handleApiError('Model metrics API request failed', error);
      // Map mock data to the proper interface
      return MODEL_METRICS_DATA.map(m => ({
        mae: m.mae,
        mse: 'N/A', // Not in basic mock
        rmse: m.rmse,
        r2_score: m.r2,
        accuracy: '94%',
        precision: '0.92',
        recall: '0.91',
        f1_score: '0.915',
        roc_auc: '0.96',
        status: m.status,
        name: m.name
      }));
    }
  },

  /**
   * Retrieve records from the property dataset.
   */
  async getProperties(): Promise<PropertyRecord[]> {
    try {
      return await requestJson<PropertyRecord[]>('/properties');
    } catch (error) {
      if (!appEnv.enableMocks) handleApiError('Properties API request failed', error);
      return MOCK_PROPERTIES.map(p => ({
        id: p.id,
        city: p.city,
        district: p.district,
        property_type: p.type,
        price: p.price,
        surface_m2: p.surface,
        bedrooms: p.rooms,
        bathrooms: p.bathrooms,
        status: p.status as 'Predicted' | 'Actual'
      }));
    }
  },

  /**
   * Get aggregated market analytics.
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      return await requestJson<AnalyticsData>('/analytics');
    } catch (error) {
      if (!appEnv.enableMocks) handleApiError('Analytics API request failed', error);
      return {
        price_distribution: PRICE_DISTRIBUTION,
        market_trends: MARKET_TRENDS,
        feature_importance: FEATURE_IMPORTANCE
      };
    }
  }
};
