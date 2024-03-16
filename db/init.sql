-- Conditionally create the database (if it doesn't exist)
SELECT 'CREATE DATABASE mproc_local'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mproc_local')\gexec

-- Connect to the database
\c mproc_local

-- Create the tables
\i /docker-entrypoint-initdb.d/def/init_tables.sql