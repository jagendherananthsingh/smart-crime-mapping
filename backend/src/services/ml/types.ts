export interface DatasetSplit {
  trainFeatures: number[][];
  trainLabels: number[];
  testFeatures: number[][];
  testLabels: number[];
  featureNames: string[];
  labelNames: string[];
}

export interface PredictionResult {
  predictedIndex: number;
  predictedLabel: string;
  confidence: number;
  probabilities: { category: string; probability: number }[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
  featureImportance: { feature: string; importance: number }[];
  trainingTimeMs: number;
  trainSetSize: number;
  testSetSize: number;
}

export interface IMLModel {
  train(features: number[][], labels: number[], featureNames?: string[]): Promise<void>;
  predict(features: number[]): Promise<PredictionResult>;
  predictBatch(featureMatrix: number[][]): Promise<number[]>;
  getFeatureImportance(): { feature: string; importance: number }[];
}
