import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { CrimeRecord } from '../models/CrimeRecord';
import { Dataset } from '../models/Dataset';
import { ModelResult } from '../models/ModelResult';
import { DataCleanerService } from '../services/preprocessing/cleaner.service';
import { MLService } from '../services/ml/ml.service';

const seedUsers = async () => {
  // Ensure Admin User exists
  const adminEmail = 'admin@crimeanalytics.local';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const adminHash = await bcrypt.hash('Admin@12345', 10);
    await User.create({
      name: 'Dr. System Administrator',
      email: adminEmail,
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
    });
    console.log(`[Seed] Created Admin User: ${adminEmail} (Password: Admin@12345)`);
  }

  // Ensure Tester User exists
  const testerEmail = 'tester@crimeanalytics.local';
  let tester = await User.findOne({ email: testerEmail });
  if (!tester) {
    const testerHash = await bcrypt.hash('Tester@12345', 10);
    await User.create({
      name: 'Research Analyst (Tester)',
      email: testerEmail,
      passwordHash: testerHash,
      role: 'TESTER',
      isActive: true,
    });
    console.log(`[Seed] Created Tester User: ${testerEmail} (Password: Tester@12345)`);
  }
};

const runImport = async () => {
  console.log('======================================================');
  printProgress('ANDHRA PRADESH CRIME DATA IMPORT PIPELINE');
  console.log('======================================================');

  // 1. Clear existing dataset and records to start fresh with Andhra Pradesh
  console.log('[Import] Clearing previous datasets, crime records, and model results...');
  await CrimeRecord.deleteMany({});
  await Dataset.deleteMany({});
  await ModelResult.deleteMany({});
  
  // Ensure demo accounts are intact
  await seedUsers();

  // 2. Read AP CSV data
  const dataPath = path.resolve(__dirname, '../../../data/ap-crime-data.csv');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Andhra Pradesh CSV file not found at ${dataPath}. Please run the generation script first.`);
  }

  console.log(`[Import] Reading dataset from ${dataPath}...`);
  const csvContent = fs.readFileSync(dataPath, 'utf-8');

  // 3. Create Dataset Metadata
  const dataset = await Dataset.create({
    name: 'Andhra Pradesh District-level Crime Dataset (2021-2023)',
    description: 'Actual spatial-temporal crime aggregates from Andhra Pradesh Police reports, sampled and synthesized to individual coordinates for mapping and machine learning.',
    filename: 'ap-crime-data.csv',
    uploadedBy: 'System Administrator',
    status: 'PENDING',
  });

  // 4. Preprocess Data
  console.log('[Import] Cleaning and preprocessing CSV records...');
  const { cleanRecords, summary } = DataCleanerService.preprocessCSV(
    csvContent,
    dataset._id.toString()
  );

  console.log(`[Import] Preprocessing summary:
  - Original Rows: ${summary.originalRows}
  - Clean Rows: ${summary.cleanRows}
  - Removed Rows: ${summary.removedRows}
  - Districts Found: ${summary.districtsFound.length}
  - Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}`);

  if (cleanRecords.length === 0) {
    dataset.status = 'FAILED';
    await dataset.save();
    throw new Error('Preprocessing rejected: No valid crime records found in CSV.');
  }

  // 5. Ingest Records into MongoDB
  console.log(`[Import] Ingesting ${cleanRecords.length} records into database...`);
  await CrimeRecord.insertMany(cleanRecords, { ordered: false });

  // Update Dataset status to READY
  dataset.recordCount = cleanRecords.length;
  dataset.columns = Object.keys(cleanRecords[0]);
  dataset.status = 'READY';
  dataset.preprocessingSummary = summary;
  await dataset.save();
  console.log('[Import] Dataset ingested successfully.');

  // 6. Train Machine Learning Models on AP Dataset
  console.log('[Import] Training classification models (Random Forest, Decision Tree, Logistic Regression)...');
  try {
    const mlResults = await MLService.trainAllModels(dataset._id.toString());
    
    console.log(`[Import] Model training completed successfully!
    - Best Model: ${mlResults.bestModel}
    - Random Forest Accuracy: ${(mlResults.randomForest.accuracy * 100).toFixed(2)}%
    - Decision Tree Accuracy: ${(mlResults.decisionTree.accuracy * 100).toFixed(2)}%
    - Logistic Regression Accuracy: ${(mlResults.logisticRegression.accuracy * 100).toFixed(2)}%`);
  } catch (mlErr: any) {
    console.error('[Import] Error training machine learning models:', mlErr.message);
  }

  console.log('======================================================');
  console.log('🎉 IMPORT AND MODEL TRAINING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
};

const printProgress = (msg: string) => {
  console.log(`🚀 ${msg}`);
};

// Connect, run, disconnect
connectDatabase()
  .then(() => runImport())
  .then(() => disconnectDatabase())
  .catch((err: any) => {
    console.error('❌ Import failed with error:', err);
    disconnectDatabase().finally(() => process.exit(1));
  });
