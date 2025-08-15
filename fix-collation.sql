-- PostgreSQL Collation Version Fix Script
-- Run this directly in your Railway PostgreSQL database

-- Check current collation status
SELECT 
    'Current Status' as info,
    datname as database_name,
    datcollversion as collation_version
FROM pg_database 
WHERE datname = current_database();

-- Check system collation version
SELECT 
    'System Collation' as info,
    collname,
    collversion as system_collation_version
FROM pg_collation 
WHERE collname = 'default';

-- Fix the collation version mismatch
ALTER DATABASE current_database() REFRESH COLLATION VERSION;

-- Verify the fix
SELECT 
    'After Fix' as info,
    datname as database_name,
    datcollversion as collation_version
FROM pg_database 
WHERE datname = current_database();

-- Check if any objects still use old collation
SELECT 
    'Objects Check' as info,
    schemaname,
    tablename,
    attname,
    attcollation
FROM pg_attribute 
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE attcollation = (SELECT oid FROM pg_collation WHERE collname = 'default')
LIMIT 5;
