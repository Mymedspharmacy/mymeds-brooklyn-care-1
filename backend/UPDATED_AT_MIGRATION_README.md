# UpdatedAt Columns Migration

This document explains how to add the missing `updatedAt` columns to your database tables to resolve the TypeScript errors.

## Problem

The Prisma schema has been updated to include `updatedAt` fields for the following models:
- `Product` - Added `updatedAt DateTime @updatedAt`
- `Order` - Added `updatedAt DateTime @updatedAt`  
- `Blog` - Added `updatedAt DateTime @updatedAt`

However, the existing database tables don't have these columns, causing TypeScript errors when trying to set `updatedAt` values in the code.

## Solution

You need to run a database migration to add the missing columns. Since the Prisma migration command can't connect to your database, you'll need to run the SQL manually.

## Migration Steps

### Option 1: Simple Migration (Recommended)

1. Connect to your PostgreSQL database (using psql, pgAdmin, or your preferred tool)
2. Run the SQL script: `add-updated-at-columns-simple.sql`

This script will:
- Add `updatedAt` columns to the `Product`, `Order`, and `Blog` tables
- Set default values for existing records
- Use Prisma's built-in `@updatedAt` functionality for automatic updates

### Option 2: Full Migration with Triggers

If you prefer to have database-level triggers for automatic updates:
1. Run the SQL script: `add-updated-at-columns.sql`
2. This includes database triggers that automatically update the `updatedAt` column

## After Running the Migration

1. **Regenerate Prisma Client**: Run `npx prisma generate` to ensure the client includes the new fields
2. **Verify**: The TypeScript errors about `updatedAt` should be resolved
3. **Test**: Your application should now be able to set and update the `updatedAt` fields

## Files Modified

- `prisma/schema.prisma` - Added `updatedAt` fields to Product, Order, and Blog models
- `src/routes/wordpress.ts` - Restored `updatedAt` field usage
- `src/routes/woocommerce.ts` - Restored `updatedAt` field usage

## Database Connection Issues

If you're having trouble connecting to your database:
1. Check your `.env` file for correct `DATABASE_URL`
2. Ensure your database server is running and accessible
3. Verify network connectivity and firewall settings
4. Check if your database credentials are correct

## Alternative: Use Prisma Migrate

Once your database connection is working, you can use the standard Prisma migration:

```bash
npx prisma migrate dev --name add-updated-at-fields
```

This will automatically create and apply the migration files.
