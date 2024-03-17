-- Create the tables

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_hash BYTEA CHECK (octet_length(key_hash) = 32) PRIMARY KEY NOT NULL,
  owner_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  name TEXT DEFAULT 'default' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS uploads (
  filename TEXT PRIMARY KEY NOT NULL
);