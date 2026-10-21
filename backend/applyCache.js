const fs = require('fs');
const path = 'c:/Users/ANANTH LOKESH/.gemini/antigravity-ide/scratch/smart-crime-mapping/backend/src/services/analytics/analytics.service.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('private static cache = new Map')) {
  code = code.replace(
    'export class AnalyticsService {',
    'export class AnalyticsService {\n  private static cache = new Map<string, { data: any; expiry: number }>();\n  private static CACHE_TTL = 5 * 60 * 1000;\n\n  private static async withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {\n    const cached = this.cache.get(key);\n    if (cached && cached.expiry > Date.now()) return cached.data;\n    const data = await fn();\n    this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL });\n    return data;\n  }\n'
  );
}

const methods = [
  'getSummary',
  'getTemporalAnalysis',
  'getCategoryAnalysis',
  'getGeographicAnalysis',
  'getDynamicInsights'
];

methods.forEach(method => {
  const methodStart = `public static async ${method}(filters: FilterOptions = {}) {`;
  if (code.includes(methodStart) && !code.includes(`return this.withCache('${method}_' + JSON.stringify(filters)`)) {
    code = code.replace(
      `public static async ${method}(filters: FilterOptions = {}) {`,
      `public static async ${method}(filters: FilterOptions = {}) {\n    return this.withCache('${method}_' + JSON.stringify(filters), () => this._${method}(filters));\n  }\n\n  private static async _${method}(filters: FilterOptions = {}) {`
    );
  }
});

fs.writeFileSync(path, code);
console.log('Success');
