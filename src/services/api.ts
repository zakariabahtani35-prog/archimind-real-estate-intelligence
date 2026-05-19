import {
  AnalyticsData,
  ArtifactResponse,
  ClassificationInput,
  ClassificationReport,
  ClassificationResponse,
  DatasetSummary,
  DbHealthStatus,
  ErrorAnalysisReport,
  FeatureImportanceReport,
  HealthStatus,
  ModelMetrics,
  ModelStatus,
  PricePredictionInput,
  PricePredictionResponse,
  PropertyRecord,
  RegressionReport,
} from '../types/ml';
import { appEnv } from '../config/env';

const API_URL = appEnv.apiUrl;

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body);
    } catch {
      // Keep the HTTP status message when the backend does not return JSON.
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
};

export const MLService = {
  getHealth(): Promise<HealthStatus> {
    return requestJson<HealthStatus>('/health');
  },

  getDbHealth(): Promise<DbHealthStatus> {
    return requestJson<DbHealthStatus>('/db/health');
  },

  getModelStatus(): Promise<ModelStatus> {
    return requestJson<ModelStatus>('/models/status');
  },

  predictPrice(input: PricePredictionInput): Promise<PricePredictionResponse> {
    return requestJson<PricePredictionResponse>('/predict/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  predictType(input: ClassificationInput): Promise<ClassificationResponse> {
    return requestJson<ClassificationResponse>('/predict/classification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  getMetrics(): Promise<ModelMetrics[]> {
    return requestJson<ModelMetrics[]>('/metrics');
  },

  getRegressionReport(): Promise<RegressionReport> {
    return requestJson<ArtifactResponse<RegressionReport>>('/metrics/regression').then((response) => response.data);
  },

  getClassificationReport(): Promise<ClassificationReport> {
    return requestJson<ArtifactResponse<ClassificationReport>>('/metrics/classification').then((response) => response.data);
  },

  getErrorAnalysis(): Promise<ErrorAnalysisReport> {
    return requestJson<ArtifactResponse<ErrorAnalysisReport>>('/metrics/error-analysis').then((response) => response.data);
  },

  getFeatureImportance(): Promise<FeatureImportanceReport> {
    return requestJson<ArtifactResponse<FeatureImportanceReport>>('/metrics/feature-importance').then((response) => response.data);
  },

  getDatasetSummary(): Promise<DatasetSummary> {
    return requestJson<DatasetSummary>('/dataset/summary');
  },

  getProperties(): Promise<PropertyRecord[]> {
    return requestJson<PropertyRecord[]>('/properties');
  },

  getAnalytics(): Promise<AnalyticsData> {
    return requestJson<AnalyticsData>('/analytics');
  },
};
