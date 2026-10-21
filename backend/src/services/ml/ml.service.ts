import { CrimeRecord } from '../../models/CrimeRecord';
import { ModelResult } from '../../models/ModelResult';
import { Prediction } from '../../models/Prediction';
import { DecisionTreeClassifier } from './decision-tree';
import { RandomForestClassifier } from './random-forest';
import { MultinomialLogisticRegression } from './logistic-regression';
import { ModelEvaluator } from './evaluator';
import { ModelMetrics, PredictionResult } from './types';
import { CrimeCategory } from '../../types';

export class MLService {
  private static rfModel: RandomForestClassifier | null = null;
  private static dtModel: DecisionTreeClassifier | null = null;
  private static lrModel: MultinomialLogisticRegression | null = null;

  private static districtMap: Map<string, number> = new Map();
  private static categories: CrimeCategory[] = [
    'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
    'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
    'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes',
  ];

  private static featureNames = [
    'Year',
    'Month',
    'Day of Week',
    'Hour of Day',
    'District Encoded',
    'Historical Area Activity',
  ];

  /**
   * Prepare dataset matrix from MongoDB CrimeRecords
   */
  public static async prepareDataset(datasetId?: string): Promise<{
    X: number[][];
    y: number[];
    labels: string[];
    districtMapping: Record<string, number>;
  }> {
    const query: any = datasetId ? { datasetId } : {};
    const records = await CrimeRecord.find(query).sort({ date: -1 }).limit(3000).lean();

    if (records.length < 20) {
      throw new Error(`Insufficient crime records (${records.length}) to train machine learning models. Minimum 20 records required.`);
    }

    // Build district frequency/label map
    const districtCounts: Record<string, number> = {};
    for (const r of records) {
      districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
    }

    const uniqueDistricts = Object.keys(districtCounts).sort();
    this.districtMap.clear();
    const districtMapping: Record<string, number> = {};
    uniqueDistricts.forEach((d, idx) => {
      this.districtMap.set(d.toLowerCase(), idx);
      districtMapping[d] = idx;
    });

    // Dynamically discover categories present in the dataset
    const categoriesFoundSet = new Set<string>();
    for (const r of records) {
      categoriesFoundSet.add(r.crimeCategory);
    }
    // Preserve canonical ordering for categories present in dataset
    const canonicalOrder: CrimeCategory[] = [
      'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
      'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
      'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes',
    ];
    this.categories = canonicalOrder.filter(c => categoriesFoundSet.has(c));
    // Add any unexpected categories at the end
    for (const c of categoriesFoundSet) {
      if (!this.categories.includes(c as CrimeCategory)) {
        this.categories.push(c as CrimeCategory);
      }
    }

    // Build feature matrix X and target y
    const X: number[][] = [];
    const y: number[] = [];

    for (const r of records) {
      const dIndex = this.districtMap.get(r.district.toLowerCase()) ?? 0;
      const historicalActivity = districtCounts[r.district] || 1;

      // Features: [year, month, dayOfWeek, hour, districtCode, historicalActivity]
      X.push([
        r.year,
        r.month,
        r.dayOfWeek,
        r.hour,
        dIndex,
        historicalActivity,
      ]);

      const catIdx = this.categories.indexOf(r.crimeCategory as CrimeCategory);
      y.push(catIdx !== -1 ? catIdx : 0);
    }

    return {
      X,
      y,
      labels: this.categories,
      districtMapping,
    };
  }

  /**
   * Train and evaluate all 3 models, persisting results to MongoDB.
   */
  public static async trainAllModels(datasetId?: string): Promise<{
    randomForest: ModelMetrics;
    decisionTree: ModelMetrics;
    logisticRegression: ModelMetrics;
    bestModel: string;
  }> {
    const { X, y, labels } = await this.prepareDataset(datasetId);

    const { trainX, trainY, testX, testY } = ModelEvaluator.splitData(X, y, 0.2);

    const numClasses = labels.length;

    // 1. Train Decision Tree
    const dtStart = Date.now();
    this.dtModel = new DecisionTreeClassifier(8, 4);
    this.dtModel.train(trainX, trainY, numClasses, this.featureNames);
    const dtTime = Date.now() - dtStart;
    const dtPreds = this.dtModel.predict(testX);
    const dtMetrics = ModelEvaluator.evaluate(
      testY,
      dtPreds,
      labels,
      this.featureNames,
      this.dtModel.featureImportances,
      dtTime,
      trainX.length,
      testX.length
    );

    // 2. Train Random Forest
    const rfStart = Date.now();
    this.rfModel = new RandomForestClassifier(20, 7, 3);
    this.rfModel.train(trainX, trainY, numClasses, this.featureNames);
    const rfTime = Date.now() - rfStart;
    const rfPreds = this.rfModel.predict(testX);
    const rfMetrics = ModelEvaluator.evaluate(
      testY,
      rfPreds,
      labels,
      this.featureNames,
      this.rfModel.featureImportances,
      rfTime,
      trainX.length,
      testX.length
    );

    // 3. Train Logistic Regression
    const lrStart = Date.now();
    this.lrModel = new MultinomialLogisticRegression(0.04, 350, 0.001);
    this.lrModel.train(trainX, trainY, numClasses, this.featureNames);
    const lrTime = Date.now() - lrStart;
    const lrPreds = this.lrModel.predict(testX);
    const lrMetrics = ModelEvaluator.evaluate(
      testY,
      lrPreds,
      labels,
      this.featureNames,
      this.lrModel.getFeatureImportances(),
      lrTime,
      trainX.length,
      testX.length
    );

    // Save or update ModelResults in DB
    await ModelResult.deleteMany(datasetId ? { datasetId } : {});

    await ModelResult.create([
      {
        modelName: 'Random Forest',
        datasetId,
        ...rfMetrics,
      },
      {
        modelName: 'Decision Tree',
        datasetId,
        ...dtMetrics,
      },
      {
        modelName: 'Logistic Regression',
        datasetId,
        ...lrMetrics,
      },
    ]);

    // Determine best model by Macro F1-Score
    let bestModel = 'Random Forest';
    let bestF1 = rfMetrics.f1Score;

    if (dtMetrics.f1Score > bestF1) {
      bestF1 = dtMetrics.f1Score;
      bestModel = 'Decision Tree';
    }
    if (lrMetrics.f1Score > bestF1) {
      bestModel = 'Logistic Regression';
    }

    return {
      randomForest: rfMetrics,
      decisionTree: dtMetrics,
      logisticRegression: lrMetrics,
      bestModel,
    };
  }

  /**
   * Generate Crime Category Prediction for a given spatial-temporal input
   */
  public static async predict(input: {
    district: string;
    locationName?: string;
    year: number;
    month: number;
    dayOfWeek: number;
    hour: number;
    historicalCount?: number;
    modelName?: 'Random Forest' | 'Decision Tree' | 'Logistic Regression';
    userId?: string;
  }): Promise<{
    prediction: CrimeCategory;
    confidence: number;
    modelName: string;
    modelVersion?: string;
    inputFeatures?: any;
    probabilities: { category: string; probability: number }[];
    featureImportance: { feature: string; importance: number }[];
    disclaimer: string;
  }> {
    // If models are not loaded in memory, train or initialize them
    if (!this.rfModel || !this.dtModel || !this.lrModel) {
      await this.trainAllModels();
    }

    // Lookup district encoding
    const dLower = input.district.toLowerCase();
    let districtCode = this.districtMap.get(dLower);
    if (districtCode === undefined) {
      districtCode = Math.abs(input.district.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10;
    }

    const historicalActivity = input.historicalCount && input.historicalCount > 0
      ? input.historicalCount
      : 25;

    const featureVector = [
      input.year,
      input.month,
      input.dayOfWeek,
      input.hour,
      districtCode,
      historicalActivity,
    ];

    const chosenModel = input.modelName || 'Random Forest';
    let predResult: { prediction: number; probabilities: number[] };
    let importances: number[] = [];

    if (chosenModel === 'Decision Tree' && this.dtModel) {
      predResult = this.dtModel.predictRow(featureVector);
      importances = this.dtModel.featureImportances;
    } else if (chosenModel === 'Logistic Regression' && this.lrModel) {
      predResult = this.lrModel.predictRow(featureVector);
      importances = this.lrModel.getFeatureImportances();
    } else {
      // Default to Random Forest
      if (!this.rfModel) await this.trainAllModels();
      predResult = (this.rfModel as RandomForestClassifier).predictRow(featureVector);
      importances = (this.rfModel as RandomForestClassifier).featureImportances;
    }

    const predictedCategory = this.categories[predResult.prediction] || 'Other';
    const confidence = Number(((predResult.probabilities[predResult.prediction] || 0.45) * 100).toFixed(1));

    const probabilities = this.categories.map((cat, i) => ({
      category: cat,
      probability: Number(((predResult.probabilities[i] || 0) * 100).toFixed(1)),
    })).sort((a, b) => b.probability - a.probability);

    const featureImportance = this.featureNames.map((name, i) => ({
      feature: name,
      importance: Number((importances[i] || 0.1).toFixed(4)),
    })).sort((a, b) => b.importance - a.importance);

    // Save Prediction in DB
    try {
      await Prediction.create({
        modelName: chosenModel,
        modelVersion: '1.0',
        inputFeatures: {
          district: input.district,
          locationName: input.locationName,
          year: input.year,
          month: input.month,
          dayOfWeek: input.dayOfWeek,
          hour: input.hour,
          historicalCount: historicalActivity,
        },
        prediction: predictedCategory,
        confidence,
        probabilities,
        createdBy: input.userId || 'Anonymous',
      });
    } catch (e) {
      console.warn('[Prediction Log] Warning: could not log prediction', e);
    }

    return {
      prediction: predictedCategory,
      confidence,
      modelName: chosenModel,
      modelVersion: '1.0',
      inputFeatures: {
        district: input.district,
        locationName: input.locationName || input.district,
        year: input.year,
        month: input.month,
        dayOfWeek: input.dayOfWeek,
        hour: input.hour,
        historicalCount: historicalActivity,
      },
      probabilities,
      featureImportance,
      disclaimer:
        'Predictions are statistical estimates based on aggregate historical data and are intended for academic and analytical purposes only. They should not be used to make decisions about individuals or to determine guilt, risk, or policing actions.',
    };
  }
}
