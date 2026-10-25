import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env, root .env, and default environment
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const PRIMARY_MONGODB_URI = 'mongodb+srv://jagendherananthsingh_db_user:1223334444@cluster0.foucqyy.mongodb.net/smart_crime_mapping?appName=Cluster0';
const PRIMARY_JWT_SECRET = 'smart_crime_mapping_super_secure_jwt_secret_key_2026';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || PRIMARY_MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || PRIMARY_JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'https://smart-crime-mapping.vercel.app',
};

