const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const { CrimeRecord } = require('../src/models/CrimeRecord');
const { env } = require('../src/config/env');

async function main() {
  await mongoose.connect(env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const excelPath = path.resolve('C:/Users/ANANTH LOKESH/Downloads/CRIME EXCEL.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found at', excelPath);
    process.exit(1);
  }
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const docs = rows
    .filter(row => (row.state || '').toString().toLowerCase() === 'andhra pradesh')
    .map(row => ({
      caseId: row.caseId?.toString() || '',
      date: row.date ? new Date(row.date) : new Date(),
      year: row.year ? Number(row.year) : undefined,
      month: row.month ? Number(row.month) : undefined,
      day: row.day ? Number(row.day) : undefined,
      dayOfWeek: row.dayOfWeek ? Number(row.dayOfWeek) : undefined,
      hour: row.hour ? Number(row.hour) : undefined,
      crimeCategory: row.crimeCategory?.toString() || '',
      crimeType: row.crimeType?.toString() || '',
      description: row.description?.toString() || '',
      locationName: row.locationName?.toString() || '',
      district: row.district?.toString() || '',
      city: row.city?.toString() || '',
      state: 'Andhra Pradesh',
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      severity: row.severity?.toString() || '',
    }));

  if (docs.length === 0) {
    console.log('No Andhra Pradesh records found.');
    process.exit(0);
  }

  await CrimeRecord.insertMany(docs);
  console.log(`Inserted ${docs.length} records.`);
  await mongoose.disconnect();
  console.log('Disconnected');
}

main().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
