import { DecisionTreeClassifier } from './decision-tree';

export class RandomForestClassifier {
  public trees: DecisionTreeClassifier[] = [];
  public numTrees: number;
  public maxDepth: number;
  public minSamplesSplit: number;
  public numClasses: number = 0;
  public featureNames: string[] = [];
  public featureImportances: number[] = [];

  constructor(
    numTrees: number = 20,
    maxDepth: number = 7,
    minSamplesSplit: number = 4
  ) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  public train(
    X: number[][],
    y: number[],
    numClasses: number,
    featureNames: string[] = []
  ): void {
    this.numClasses = numClasses;
    this.featureNames = featureNames;
    this.trees = [];

    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;
    this.featureImportances = new Array(numFeatures).fill(0);

    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sampling with replacement
      const sampleIndices: number[] = [];
      for (let s = 0; s < numSamples; s++) {
        sampleIndices.push(Math.floor(Math.random() * numSamples));
      }

      const sampleX = sampleIndices.map((i) => X[i]);
      const sampleY = sampleIndices.map((i) => y[i]);

      const tree = new DecisionTreeClassifier(this.maxDepth, this.minSamplesSplit);
      tree.train(sampleX, sampleY, numClasses, featureNames);
      this.trees.push(tree);

      // Accumulate feature importance
      for (let f = 0; f < numFeatures; f++) {
        this.featureImportances[f] += tree.featureImportances[f] || 0;
      }
    }

    // Normalize aggregate feature importances
    const totalImportance = this.featureImportances.reduce((a, b) => a + b, 0);
    if (totalImportance > 0) {
      this.featureImportances = this.featureImportances.map((v) => v / totalImportance);
    }
  }

  public predictRow(x: number[]): { prediction: number; probabilities: number[] } {
    if (this.trees.length === 0) {
      return { prediction: 0, probabilities: new Array(this.numClasses).fill(0) };
    }

    const avgProbabilities = new Array(this.numClasses).fill(0);

    for (const tree of this.trees) {
      const { probabilities } = tree.predictRow(x);
      for (let c = 0; c < this.numClasses; c++) {
        avgProbabilities[c] += (probabilities[c] || 0) / this.trees.length;
      }
    }

    let maxProb = -1;
    let bestClass = 0;
    for (let c = 0; c < this.numClasses; c++) {
      if (avgProbabilities[c] > maxProb) {
        maxProb = avgProbabilities[c];
        bestClass = c;
      }
    }

    return {
      prediction: bestClass,
      probabilities: avgProbabilities,
    };
  }

  public predict(X: number[][]): number[] {
    return X.map((row) => this.predictRow(row).prediction);
  }
}
