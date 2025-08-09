import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

export default defineConfig({
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/healthprotocol_db',
    ssl: isDevelopment ? false : { rejectUnauthorized: false }
  },
  verbose: true,
  strict: true
});