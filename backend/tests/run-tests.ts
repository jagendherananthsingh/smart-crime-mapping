import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/models/User';
import { CrimeRecord } from '../src/models/CrimeRecord';
import { seedDatabase } from '../src/utils/seed';
import { generateToken, verifyToken } from '../src/utils/jwt';
import { DataCleanerService } from '../src/services/preprocessing/cleaner.service';
import { MLService } from '../src/services/ml/ml.service';
import { AnalyticsService } from '../src/services/analytics/analytics.service';
import { DecisionTreeClassifier } from '../src/services/ml/decision-tree';
import { RandomForestClassifier } from '../src/services/ml/random-forest';
import { MultinomialLogisticRegression } from '../src/services/ml/logistic-regression';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING SMART CRIME MAPPING BACKEND TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test Database & Seeder
    console.log('[Test Suite 1: Database & Seed]');
    await connectDatabase();
    await seedDatabase(false);

    const userCount = await User.countDocuments();
    assert(userCount >= 2, 'Admin and Tester seed users exist in database');

    const crimeCount = await CrimeRecord.countDocuments();
    assert(crimeCount >= 500, `Crime records properly loaded into database (found ${crimeCount})`);

    // 2. Test Auth & JWT
    console.log('\n[Test Suite 2: Authentication & JWT Security]');
    const testAdmin = await User.findOne({ email: 'admin@crimeanalytics.local' });
    assert(!!testAdmin, 'Demo Admin user retrieved');

    const token = generateToken({
      userId: testAdmin!._id.toString(),
      email: testAdmin!.email,
      role: testAdmin!.role,
    });
    assert(typeof token === 'string' && token.length > 20, 'JWT token generated successfully');

    const decoded = verifyToken(token);
    assert(decoded.email === 'admin@crimeanalytics.local' && decoded.role === 'ADMIN', 'JWT token decoded and verified');

    // 3. Test Preprocessing Pipeline
    console.log('\n[Test Suite 3: Data Preprocessing Pipeline]');
    const rawCSV = `case_id,date,crime_category,crime_type,location,district,city,latitude,longitude,hour,severity
CASE-TEST-1,2025-03-15 10:30:00,Theft,Shoplifting,Main Plaza,Central District,Metro City,14.4426,79.9865,10,LOW
CASE-TEST-1,2025-03-15 10:30:00,Theft,Shoplifting,Main Plaza,Central District,Metro City,14.4426,79.9865,10,LOW
CASE-TEST-2,invalid-date,Burglary,Break-in,Store,North Zone,Metro City,14.4500,79.9900,12,HIGH
CASE-TEST-3,2025-03-16 18:00:00,Cybercrime,Phishing,Tech Park,South Zone,Metro City,14.4200,79.9750,18,MEDIUM`;

    const { cleanRecords, summary } = DataCleanerService.preprocessCSV(rawCSV);
    assert(summary.originalRows === 4, 'Correctly parsed 4 raw rows');
    assert(summary.duplicateRows === 1, 'Correctly identified 1 duplicate row');
    assert(summary.invalidRecords === 1, 'Correctly flagged 1 invalid date row');
    assert(cleanRecords.length === 2, 'Correctly produced 2 clean records');
    assert(cleanRecords[0].dayOfWeek !== undefined && cleanRecords[0].month === 3, 'Engineered temporal features correctly');

    // 4. Test Machine Learning Algorithms
    console.log('\n[Test Suite 4: ML Models (Decision Tree, Random Forest, Logistic Regression)]');
    
    // Synthetic toy classification data
    const toyX = [
      [2024, 1, 0, 10, 0, 50],
      [2024, 1, 0, 11, 0, 48],
      [2024, 2, 1, 14, 1, 30],
      [2024, 2, 1, 15, 1, 32],
      [2024, 3, 2, 20, 2, 15],
      [2024, 3, 2, 21, 2, 18],
    ];
    const toyY = [0, 0, 1, 1, 2, 2];
    const toyLabels = ['Theft', 'Burglary', 'Cybercrime'];

    // Decision Tree test
    const dt = new DecisionTreeClassifier(4, 2);
    dt.train(toyX, toyY, 3, ['Year', 'Month', 'DayOfWeek', 'Hour', 'District', 'Activity']);
    const dtPred = dt.predictRow([2024, 1, 0, 10, 0, 50]);
    assert(dtPred.prediction === 0, 'Decision Tree correctly predicted class 0');

    // Random Forest test
    const rf = new RandomForestClassifier(5, 4, 2);
    rf.train(toyX, toyY, 3, ['Year', 'Month', 'DayOfWeek', 'Hour', 'District', 'Activity']);
    const rfPred = rf.predictRow([2024, 3, 2, 20, 2, 15]);
    assert(rfPred.prediction === 2, 'Random Forest correctly predicted class 2');

    // Logistic Regression test
    const lr = new MultinomialLogisticRegression(0.1, 150, 0.001);
    lr.train(toyX, toyY, 3, ['Year', 'Month', 'DayOfWeek', 'Hour', 'District', 'Activity']);
    const lrPred = lr.predictRow([2024, 2, 1, 14, 1, 30]);
    assert(lrPred.prediction === 1, 'Logistic Regression correctly predicted class 1');

    // Full ML pipeline test
    const trainResults = await MLService.trainAllModels();
    assert(trainResults.randomForest.accuracy > 0, `Random Forest trained on DB records (Accuracy: ${(trainResults.randomForest.accuracy * 100).toFixed(1)}%)`);
    assert(trainResults.decisionTree.accuracy > 0, `Decision Tree evaluated (Accuracy: ${(trainResults.decisionTree.accuracy * 100).toFixed(1)}%)`);
    assert(trainResults.logisticRegression.accuracy > 0, `Logistic Regression evaluated (Accuracy: ${(trainResults.logisticRegression.accuracy * 100).toFixed(1)}%)`);
    assert(!!trainResults.bestModel, `Best model selected: ${trainResults.bestModel}`);

    // Prediction test
    const predOutput = await MLService.predict({
      district: 'Central District',
      year: 2025,
      month: 6,
      dayOfWeek: 5,
      hour: 21,
      modelName: 'Random Forest',
    });
    assert(!!predOutput.prediction, `Live prediction output: ${predOutput.prediction} (Confidence: ${predOutput.confidence}%)`);
    assert(predOutput.probabilities.length > 0, 'Probabilities distribution generated');

    // 5. Test Analytics & Dynamic Insights
    console.log('\n[Test Suite 5: Analytics & Dynamic Insights Generation]');
    const summaryKPI = await AnalyticsService.getSummary({});
    assert(summaryKPI.totalRecords > 0, `KPI Total Records: ${summaryKPI.totalRecords}`);
    assert(summaryKPI.topCategory !== 'N/A', `KPI Top Category: ${summaryKPI.topCategory}`);

    const temporal = await AnalyticsService.getTemporalAnalysis({});
    assert(temporal.dayOfWeekData.length === 7, 'Temporal 7-day distribution generated');
    assert(temporal.hourlyData.length === 24, 'Temporal 24-hour distribution generated');

    const insights = await AnalyticsService.getDynamicInsights({});
    assert(insights.insights.length >= 3, `Generated ${insights.insights.length} dynamic textual statistical insights`);

    console.log('\n======================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    await disconnectDatabase();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test suite crashed with error:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

runTests();
