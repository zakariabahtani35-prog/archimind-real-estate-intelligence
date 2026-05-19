import { useState, useCallback } from 'react';
import { MLService } from '../services/api';
import { PricePredictionInput, PricePredictionResponse } from '../types/ml';

/**
 * Hook for managing property price predictions.
 */
export function usePricePrediction() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PricePredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (input: PricePredictionInput) => {
    setIsPredicting(true);
    setError(null);
    setResult(null);

    try {
      const data = await MLService.predictPrice(input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during prediction.');
    } finally {
      setIsPredicting(false);
    }
  }, []);

  return { predict, isPredicting, result, error };
}


