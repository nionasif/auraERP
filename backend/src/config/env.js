import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'auratech_enterprise_jwt_super_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  FACILITY_ID: process.env.FACILITY_ID || 'DC01',
  FACILITY_NAME: process.env.FACILITY_NAME || 'Silicon Tower Tech Hub & Cloud Data Center',
  HOST_REGION: process.env.HOST_REGION || 'ap-south-1',
  DB_PATH: process.env.DB_PATH || './src/data/database.json'
};
