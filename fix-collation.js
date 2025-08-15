#!/usr/bin/env node

/**
 * PostgreSQL Collation Version Fix Script
 * Fixes the collation version mismatch in Railway PostgreSQL database
 * 
 * Usage: node fix-collation.js
 */

const { Client } = require('pg');
require('dotenv').config();

async function fixCollationIssue() {
  console.log('🔧 Starting PostgreSQL Collation Fix...\n');
  
  // Database connection configuration
  const config = {
    connectionString: process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
  
  if (!config.connectionString) {
    console.error('❌ Error: DATABASE_URL or RAILWAY_DATABASE_URL environment variable not found');
    console.log('Please set your database connection string in your environment variables.');
    return;
  }
  
  const client = new Client(config);
  
  try {
    // Connect to database
    console.log('📡 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Check current collation version
    console.log('🔍 Checking current collation version...');
    const collationQuery = `
      SELECT 
        datname as database_name,
        datcollversion as collation_version,
        pg_collation.collversion as system_collation_version
      FROM pg_database 
      LEFT JOIN pg_collation ON pg_collation.collname = 'default'
      WHERE datname = current_database();
    `;
    
    const collationResult = await client.query(collationQuery);
    console.log('📊 Current Database Collation Status:');
    console.log(JSON.stringify(collationResult.rows[0], null, 2));
    console.log('');
    
    // Check if there's a mismatch
    if (collationResult.rows[0]?.collation_version !== collationResult.rows[0]?.system_collation_version) {
      console.log('⚠️  Collation version mismatch detected!');
      console.log('🔄 Attempting to fix...\n');
      
      try {
        // Try to refresh collation version
        console.log('🔄 Running: ALTER DATABASE current_database() REFRESH COLLATION VERSION');
        await client.query('ALTER DATABASE current_database() REFRESH COLLATION VERSION');
        console.log('✅ Collation version refreshed successfully!\n');
        
        // Verify the fix
        console.log('🔍 Verifying the fix...');
        const verifyResult = await client.query(collationQuery);
        console.log('📊 Updated Database Collation Status:');
        console.log(JSON.stringify(verifyResult.rows[0], null, 2));
        
        if (verifyResult.rows[0]?.collation_version === verifyResult.rows[0]?.system_collation_version) {
          console.log('\n🎉 SUCCESS: Collation version mismatch has been resolved!');
        } else {
          console.log('\n⚠️  WARNING: Collation version still shows mismatch');
          console.log('This might require manual intervention or database recreation.');
        }
        
      } catch (refreshError) {
        console.error('❌ Error refreshing collation version:', refreshError.message);
        console.log('\n🔄 Trying alternative approach...');
        
        // Alternative: Check for objects using default collation
        const objectsQuery = `
          SELECT 
            schemaname,
            tablename,
            attname,
            attcollation
          FROM pg_attribute 
          JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
          JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
          WHERE attcollation = (SELECT oid FROM pg_collation WHERE collname = 'default')
          LIMIT 10;
        `;
        
        try {
          const objectsResult = await client.query(objectsQuery);
          console.log('📋 Objects using default collation (first 10):');
          console.log(JSON.stringify(objectsResult.rows, null, 2));
          
          if (objectsResult.rows.length > 0) {
            console.log('\n💡 RECOMMENDATION:');
            console.log('Some database objects are using the old collation version.');
            console.log('Consider running: pg_dump and pg_restore to rebuild the database.');
          }
        } catch (objectsError) {
          console.error('❌ Error checking objects:', objectsError.message);
        }
      }
      
    } else {
      console.log('✅ No collation version mismatch detected!');
      console.log('Your database is already using the correct collation version.');
    }
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your DATABASE_URL is correct');
    console.log('2. Ensure your database is accessible');
    console.log('3. Verify you have sufficient permissions');
    console.log('4. Check Railway service status');
    
  } finally {
    // Close connection
    if (client) {
      await client.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run the fix
fixCollationIssue().catch(console.error);

