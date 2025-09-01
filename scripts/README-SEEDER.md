# Protocol Templates Seeder

This document describes the database seeder script for populating the HealthProtocol application with sample protocol templates and test data.

## Overview

The seeder script populates the database with:

- **10 Protocol Templates** across various health categories
- **1 Test Trainer** (trainer.test@evofitmeals.com)
- **5 Test Customers** assigned to the trainer

## Protocol Template Categories

### Weight Loss (2 templates)
- **Beginner Weight Loss Protocol**: Gentle 90-day program with sustainable habits
- **Advanced Fat Loss Protocol**: Intensive 60-day program with carb cycling and IF

### Muscle Gain (2 templates)
- **Lean Muscle Building Protocol**: Structured 120-day lean mass building
- **Hardgainer Mass Protocol**: High-calorie 150-day program for hard gainers

### General Wellness (1 template)
- **Metabolic Health Optimization**: 120-day metabolic health and blood sugar regulation

### Longevity (1 template)
- **Anti-Aging Longevity Protocol**: Evidence-based 180-day longevity protocol

### Cardiovascular Health (1 template)
- **Heart Health Optimization Protocol**: 120-day cardiovascular health program

### Detox (1 template)
- **Gentle Detox Protocol**: 30-day mild detoxification and liver support

### Therapeutic (1 template)
- **Comprehensive Parasite Cleanse**: 60-day three-phase parasite elimination

### Energy Enhancement (1 template)
- **Energy Enhancement Protocol**: 90-day mitochondrial support and vitality boost

## Usage

### Prerequisites

1. **Docker Environment**: Ensure the development environment is running:
   ```bash
   docker-compose --profile dev up -d
   ```

2. **Database Running**: Verify PostgreSQL container is healthy:
   ```bash
   docker ps
   ```

### Running the Seeder

#### Option 1: TypeScript Version (Recommended)
```bash
npx tsx scripts/seed-protocol-templates.ts
```

#### Option 2: CommonJS Wrapper
```bash
node scripts/seed-protocol-templates.cjs
```

### Environment Variables

The script automatically configures the necessary environment variables:
- `DATABASE_URL`: Points to the local PostgreSQL database
- `NODE_ENV`: Set to 'development'

## Test Credentials

After running the seeder, you can use these credentials for testing:

### Trainer Account
- **Email**: trainer.test@evofitmeals.com
- **Password**: Trainer123!

### Customer Accounts
- **customer1@test.com** / Customer123! (Alice Johnson)
- **customer2@test.com** / Customer123! (Bob Smith)
- **customer3@test.com** / Customer123! (Carol Davis)
- **customer4@test.com** / Customer123! (David Wilson)
- **customer5@test.com** / Customer123! (Emma Brown)

## Features

### Upsert Functionality
- The seeder can be run multiple times safely
- Existing records are updated rather than duplicated
- Uses name + category combination to identify existing templates

### Comprehensive Data
Each protocol template includes:
- **Basic Info**: Name, description, category
- **Configuration**: Duration, intensity, type
- **Detailed Config**: Macro ratios, supplementation, restrictions
- **Targeting**: Target audience, health focus areas
- **Metadata**: Tags for categorization

### Error Handling
- Graceful error handling with detailed error messages
- Database connection validation
- Transaction safety for data integrity

## Database Schema

The seeder populates these tables:
- `protocol_templates`: Core protocol template data
- `users`: Test trainer and customer accounts
- Password hashing using bcrypt with 12 salt rounds

## Development Notes

### File Structure
- `seed-protocol-templates.ts`: Main TypeScript implementation
- `seed-protocol-templates.cjs`: CommonJS wrapper for compatibility
- Uses dynamic imports to ensure environment variables are loaded first

### Dependencies
- **TypeScript**: Uses tsx for TypeScript execution
- **Database**: Drizzle ORM with PostgreSQL
- **Security**: bcrypt for password hashing
- **Environment**: dotenv for configuration

### Template Data
All template configurations include:
- Caloric adjustments (deficit/surplus)
- Macronutrient ratios
- Exercise frequency recommendations
- Supplementation protocols
- Dietary restrictions and allowed foods
- Hydration and sleep targets
- Advanced features (IF, carb cycling, etc.)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure Docker containers are running
   - Check database name matches `evofithealthprotocol_db`

2. **Permission Errors**
   - Verify PostgreSQL credentials in environment
   - Check Docker container health status

3. **TypeScript Compilation Issues**
   - Ensure tsx is installed: `npm install tsx`
   - Try the CommonJS version as fallback

### Verification

Check seeded data:
```bash
# Count templates
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "SELECT COUNT(*) FROM protocol_templates;"

# View test users
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "SELECT email, role, name FROM users WHERE email LIKE '%test%';"

# Sample templates
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "SELECT name, category, default_duration FROM protocol_templates LIMIT 5;"
```

## Integration

The seeded data integrates with:
- **Protocol Creation**: Templates serve as starting points
- **Trainer Workflows**: Test trainer can assign protocols
- **Customer Experience**: Test customers can receive assignments
- **UI Components**: Templates populate selection interfaces

## Security

- Passwords are properly hashed with bcrypt
- No sensitive data in templates
- Test accounts clearly marked for development use
- Environment variables properly isolated