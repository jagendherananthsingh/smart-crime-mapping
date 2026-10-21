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

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICrimeRecord {
  _id?: string;
  caseId: string;
  date: Date;
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  hour: number; // 0-23
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
  createdAt: Date;
  updatedAt: Date;
}

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

export interface IDataset {
  _id?: string;
  name: string;
  description: string;
  filename: string;
  recordCount: number;
  columns: string[];
  uploadedBy: string; // User ID or Name
  status: 'PENDING' | 'PREPROCESSED' | 'FAILED' | 'READY';
  preprocessingSummary?: IPreprocessingSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrediction {
  _id?: string;
  modelName: string;
  modelVersion: string;
  inputFeatures: {
    district: string;
    locationName?: string;
    year: number;
    month: number;
    dayOfWeek: number;
    hour: number;
    historicalCount?: number;
  };
  prediction: CrimeCategory;
  confidence: number;
  probabilities: { category: string; probability: number }[];
  createdBy?: string;
  createdAt: Date;
}

export interface IModelResult {
  _id?: string;
  modelName: 'Random Forest' | 'Decision Tree' | 'Logistic Regression';
  datasetId?: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    labels: string[];
    matrix: number[][]; // matrix[actual][predicted]
  };
  featureImportance: { feature: string; importance: number }[];
  trainingTimeMs: number;
  testSetSize: number;
  trainSetSize: number;
  createdAt: Date;
}

export interface IAuditLog {
  _id?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type DataRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type IdProofType = 'POLICE_ID_CARD' | 'COURT_ORDER' | 'DEPT_MEMO' | 'OFFICIAL_WARRANT';
export type UrgencyLevel = 'ROUTINE' | 'HIGH_PRIORITY' | 'ACTIVE_INVESTIGATION_EMERGENCY';

export interface IPoliceDataRequest {
  _id?: string;
  userId?: string;
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
  reviewedBy?: string;
  reviewedAt?: Date;
  statutoryDeclaration: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

