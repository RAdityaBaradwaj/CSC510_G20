-- Baseline tables required for activity feed and incentives
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  privacy_preference VARCHAR(32) DEFAULT 'PUBLIC_NAME',
  total_credits_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pools (
  id UUID PRIMARY KEY,
  creator_user_id UUID REFERENCES users(id),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_window_start TIMESTAMPTZ,
  scheduled_window_end TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS errands (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_time TIMESTAMPTZ
);
