export type UserRole = 'ADMIN' | 'POLICE' | 'USER';

export type CrimeSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CrimeCategory =
  | 'Murder'
  | 'Rape'
  | 'Kidnapping (Women & Girls)'
  | 'Kidnapping (Others)'
  | 'Dowry Deaths'
  | 'Molestation & Harassment'
  | 'Dacoity'
  | 'Robbery'
  | 'Burglary'
  | 'Theft'
  | 'Riots'
  | 'Cheatings'
  | 'Other IPC Crimes'
  | 'Other Crimes';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  notifications?: {
    _id?: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
}
export type IUser = User;

export interface CrimeRecord {
  _id: string;
  caseId: string;
  date: string | Date;
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  hour: number;
  crimeCategory: CrimeCategory;
  crimeType: string;
  locationName: string;
  latitude: number;
  longitude: number;
  district: string;
  city: string;
  description: string;
  severity: CrimeSeverity;
  datasetId?: string;
  createdAt?: string;
}
export type ICrimeRecord = CrimeRecord;

export interface DashboardSummary {
  totalRecords: number;
  totalCrimes?: number;
  totalCategories: number;
  topCategory: string;
  topCategoryCount: number;
  topCategoryPercentage: number;
  topDistrict: string;
  topDistrictCount: number;
  recordsThisMonth?: number;
  datasetCount?: number;
  criticalCount?: number;
  categoryDistribution?: Record<string, number>;
  hourlyBreakdown?: Record<number, number>;
  severityBreakdown?: { severity: CrimeSeverity; count: number }[];
}
export type IDashboardSummary = DashboardSummary;

export interface ITrendData {
  period: string;
  count: number;
  year?: number;
  month?: number;
}

export interface ICategoryData {
  category: string;
  count: number;
  percentage?: number;
}

export interface ILocationData {
  district: string;
  count: number;
  percentage?: number;
}

export interface IFilterOptions {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  crimeCategory?: string;
  district?: string;
  city?: string;
  severity?: string;
  search?: string;
}

export interface TemporalData {
  monthlyTimeline: { period: string; year: number; month: number; count: number }[];
  dayOfWeekData: { dayIndex: number; dayName: string; count: number }[];
  hourlyData: { hour: number; timeLabel: string; count: number }[];
  yearlyData: { year: string; count: number }[];
  dayOfWeekDistribution?: Record<number, number>;
  monthlySeasonality?: Record<number, number>;
  hourlyDistribution?: Record<number, number>;
}

export interface CategoryAnalysisData {
  total: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  categoryBySeverity: { category: string; severity: string; count: number }[];
  categories?: { category: string; count: number }[];
  crossTab?: any[];
}

export interface GeographicAnalysisData {
  districts: {
    district: string;
    count: number;
    percentage: number;
    center?: [number, number];
    concentrationLevel?: string;
    topCategory?: string;
    criticalRatio?: number;
  }[];
  topLocations?: {
    location: string;
    district: string;
    count: number;
    highSeverityCount?: number;
  }[];
}

export interface DynamicInsightsData {
  insights: string[];
  generatedAt: string;
  recordCount: number;
}

export interface FilterState {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  crimeCategory?: string;
  district?: string;
  city?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ModelResult {
  _id?: string;
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    classes?: string[];
    labels?: string[];
    matrix: number[][];
  };
  featureImportance: Record<string, number> | { feature: string; importance: number }[];
  trainingTimeMs: number;
  trainSetSize?: number;
  testSetSize?: number;
  createdAt?: string;
}
export type IModelResult = ModelResult;

export interface PredictionResponse {
  prediction: CrimeCategory;
  confidence: number;
  modelName: string;
  modelVersion?: string;
  inputFeatures?: any;
  probabilities: { category: string; probability: number }[];
  featureImportance?: { feature: string; importance: number }[] | Record<string, number>;
  disclaimer?: string;
}
export type IPredictionResult = PredictionResponse;

export interface IPreprocessingSummary {
  originalRows: number;
  duplicateRows: number;
  missingValues: number;
  invalidRecords: number;
  cleanRows: number;
  removedRows: number;
  finalDatasetSize: number;
  categoriesFound: string[];
  districtsFound: string[];
  dateRange: { start: string; end: string };
}

export interface DatasetItem {
  _id: string;
  name: string;
  description: string;
  filename: string;
  recordCount: number;
  columns: string[];
  uploadedBy: string;
  status: 'PENDING' | 'PREPROCESSED' | 'FAILED' | 'READY';
  preprocessingSummary?: IPreprocessingSummary;
  createdAt: string;
}
export type IDataset = DatasetItem;

export interface IAuditLog {
  _id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

export type DataRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type IdProofType = 'POLICE_ID_CARD' | 'COURT_ORDER' | 'DEPT_MEMO' | 'OFFICIAL_WARRANT';
export type UrgencyLevel = 'ROUTINE' | 'HIGH_PRIORITY' | 'ACTIVE_INVESTIGATION_EMERGENCY';

export interface IPoliceDataRequest {
  _id: string;
  userId: string | { _id: string; name: string; email: string; role: string };
  userEmail?: string;
  officerName: string;
  badgeNumber: string;
  rank: string;
  policeStation: string;
  districts: string[];
  contactPhone: string;
  officialEmail?: string;
  idProofType: IdProofType;
  idProofNumber: string;
  idProofAttachment?: string;
  firNumber: string;
  requestedDataScope: string;
  purposeDescription: string;
  urgencyLevel: UrgencyLevel;
  status: DataRequestStatus;
  adminRemarks?: string;
  reviewedBy?: string | { _id: string; name: string; email: string };
  reviewedAt?: string;
  statutoryDeclaration: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}
