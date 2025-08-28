// server/utils/production-migrations.ts
/**
 * Production database migration utilities
 * Safe, automated database migrations for production deployment
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';

interface MigrationResult {
  success: boolean;
  migrationsRun: number;
  errors: string[];
  warnings: string[];
}

/**
 * Run production database migrations with safety checks
 */
export async function runProductionMigrations(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migrationsRun: 0,
    errors: [],
    warnings: []
  };

  console.log('🚀 Starting production database migration process...');

  // Validate environment
  if (!process.env.DATABASE_URL) {
    result.errors.push('DATABASE_URL environment variable is not set');
    return result;
  }

  if (process.env.NODE_ENV !== 'production') {
    result.warnings.push('NODE_ENV is not set to production');
  }

  // Create database connection with production settings
  const migrationClient = postgres(process.env.DATABASE_URL, {
    max: 1, // Single connection for migrations
    ssl: process.env.DATABASE_URL.includes('ssl=true') ? 'require' : false,
    connection: {
      application_name: 'healthprotocol-migration'
    }
  });

  try {
    console.log('🔍 Validating database connection...');
    
    // Test connection
    const testResult = await migrationClient`SELECT 1 as test`;
    if (!testResult || testResult.length === 0) {
      throw new Error('Database connection test failed');
    }
    
    console.log('✅ Database connection validated');
    
    // Check if migrations directory exists
    const migrationsPath = path.join(process.cwd(), 'migrations');
    try {
      await fs.access(migrationsPath);
      console.log(`📁 Migrations directory found: ${migrationsPath}`);
    } catch (error) {
      result.errors.push(`Migrations directory not found: ${migrationsPath}`);
      return result;
    }

    // List available migrations
    const migrationFiles = await fs.readdir(migrationsPath);
    const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql'));
    console.log(`📋 Found ${sqlFiles.length} migration files:`, sqlFiles);

    if (sqlFiles.length === 0) {
      result.warnings.push('No migration files found');
      result.success = true;
      return result;
    }

    // Create drizzle instance
    const db = drizzle(migrationClient);
    console.log('📦 Drizzle ORM initialized');

    // Run migrations with error handling
    console.log('⚡ Running database migrations...');
    
    try {
      await migrate(db, { 
        migrationsFolder: migrationsPath,
        migrationsTable: 'drizzle_migrations'
      });
      
      console.log('✅ Migrations completed successfully');
      result.success = true;
      result.migrationsRun = sqlFiles.length;
      
    } catch (migrationError) {
      console.error('❌ Migration failed:', migrationError);
      result.errors.push(`Migration failed: ${migrationError.message}`);
      
      // Don't fail the entire deployment for migration errors in production
      // Log the error but continue with application startup
      if (process.env.MIGRATION_FAILURE_MODE === 'continue') {
        console.warn('⚠️  Continuing startup despite migration failure (MIGRATION_FAILURE_MODE=continue)');
        result.success = true;
        result.warnings.push('Migration failed but startup continued');
      }
    }

  } catch (error) {
    console.error('💥 Database connection or setup failed:', error);
    result.errors.push(`Database error: ${error.message}`);
  } finally {
    try {
      await migrationClient.end();
      console.log('🔌 Database connection closed');
    } catch (closeError) {
      console.error('Warning: Failed to close database connection:', closeError);
      result.warnings.push('Failed to close database connection properly');
    }
  }

  return result;
}

/**
 * Validate database schema after migration
 */
export async function validateDatabaseSchema(): Promise<boolean> {
  console.log('🔍 Validating database schema...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set for schema validation');
    return false;
  }

  const client = postgres(process.env.DATABASE_URL, {
    max: 1,
    ssl: process.env.DATABASE_URL.includes('ssl=true') ? 'require' : false
  });

  try {
    // Check for essential tables
    const essentialTables = [
      'users',
      'health_protocols',
      'drizzle_migrations'
    ];

    for (const tableName of essentialTables) {
      try {
        const result = await client`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          )
        `;
        
        if (!result[0]?.exists) {
          console.error(`❌ Essential table missing: ${tableName}`);
          return false;
        }
        
        console.log(`✅ Table verified: ${tableName}`);
      } catch (error) {
        console.error(`❌ Error checking table ${tableName}:`, error);
        return false;
      }
    }

    console.log('✅ Database schema validation passed');
    return true;

  } catch (error) {
    console.error('💥 Schema validation failed:', error);
    return false;
  } finally {
    await client.end();
  }
}

/**
 * Create database backup before migrations (if supported)
 */
export async function createPreMigrationBackup(): Promise<boolean> {
  console.log('💾 Checking backup capabilities...');

  // In production, backups are typically handled by managed database services
  // This is a placeholder for custom backup logic if needed
  
  if (process.env.DATABASE_BACKUP_ENABLED === 'true') {
    console.log('📋 Backup creation would be handled by external service');
    // Implement actual backup logic here if using self-managed database
  } else {
    console.log('ℹ️  Backup creation delegated to managed database service');
  }

  return true;
}

/**
 * Complete production migration workflow
 */
export async function runProductionMigrationWorkflow(): Promise<MigrationResult> {
  console.log('🎯 Starting complete production migration workflow...');

  // Step 1: Create backup (if enabled)
  const backupSuccess = await createPreMigrationBackup();
  if (!backupSuccess) {
    return {
      success: false,
      migrationsRun: 0,
      errors: ['Backup creation failed'],
      warnings: []
    };
  }

  // Step 2: Run migrations
  const migrationResult = await runProductionMigrations();
  
  // Step 3: Validate schema (if migrations succeeded)
  if (migrationResult.success) {
    const schemaValid = await validateDatabaseSchema();
    if (!schemaValid) {
      migrationResult.success = false;
      migrationResult.errors.push('Schema validation failed after migration');
    }
  }

  // Log final result
  if (migrationResult.success) {
    console.log(`🎉 Migration workflow completed successfully (${migrationResult.migrationsRun} migrations)`);
  } else {
    console.error('❌ Migration workflow failed:', migrationResult.errors);
  }

  return migrationResult;
}