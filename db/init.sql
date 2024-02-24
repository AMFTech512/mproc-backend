-- Conditionally create the database (if it doesn't exist)
SELECT 'CREATE DATABASE mproc'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mproc')\gexec

-- Connect to the database
\c mproc

-- Create the tables
\i init_tables.sql