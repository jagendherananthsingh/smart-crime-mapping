const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('==================================================');
console.log('UNIFIED MONOREPO VERCEL PRODUCTION BUILD');
console.log('==================================================');

// 1. Install & Build Backend
console.log('\n[1/4] Building Backend TypeScript...');
execSync('npm --prefix backend install && npm --prefix backend run build', {
  cwd: rootDir,
  stdio: 'inherit',
});

// 2. Synchronize Backend to api/backend/dist for self-contained Serverless execution
console.log('\n[2/4] Packaging Backend into api/ layer for Vercel...');
const backendDist = path.join(rootDir, 'backend', 'dist');
const apiBackendDist = path.join(rootDir, 'api', 'backend', 'dist');
fs.mkdirSync(apiBackendDist, { recursive: true });
fs.cpSync(backendDist, apiBackendDist, { recursive: true });

// 3. Install & Build Frontend
console.log('\n[3/4] Building Frontend Vite Application...');
execSync('npm --prefix frontend install && npm --prefix frontend run build', {
  cwd: rootDir,
  stdio: 'inherit',
});

// 4. Synchronize Frontend to root dist
console.log('\n[4/4] Synchronizing Frontend artifacts into root ./dist ...');
const frontendDist = path.join(rootDir, 'frontend', 'dist');
const rootDist = path.join(rootDir, 'dist');
fs.mkdirSync(rootDist, { recursive: true });
fs.cpSync(frontendDist, rootDist, { recursive: true });

console.log('\n==================================================');
console.log('SUCCESS: Fullstack application compiled and verified for Vercel!');
console.log('==================================================');
