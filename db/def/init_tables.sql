-- Create the tables

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY NOT NULL,
  name VARCHAR(32),
  email VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS webauthn_authenticators (
  credential_id BYTEA PRIMARY KEY NOT NULL,
  credential_public_key BYTEA NOT NULL,
  counter BIGINT DEFAULT 0 NOT NULL,
  credential_device_type VARCHAR(100) NOT NULL,
  is_credential_backed_up BOOLEAN DEFAULT FALSE NOT NULL,
  transports JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_hash BYTEA CHECK (octet_length(key_hash) = 32) PRIMARY KEY NOT NULL,
  owner_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  name TEXT DEFAULT 'default' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS key_usage_log (
  id SERIAL PRIMARY KEY NOT NULL,
  key_hash BYTEA REFERENCES api_keys(key_hash) NOT NULL,
  owner_id UUID REFERENCES users(id) NOT NULL,
  unit_count INTEGER NOT NULL,
  operation VARCHAR(100) NOT NULL,
  date_executed TIMESTAMP DEFAULT NOW() NOT NULL
);