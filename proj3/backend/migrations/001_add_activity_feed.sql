-- Activity feed and incentive tables for NeighborhoodPool Milestone 3
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_event_type') THEN
    CREATE TYPE activity_event_type AS ENUM ('POOL_CREATED', 'POOL_JOINED', 'INCENTIVE_EARNED', 'ERRAND_SCHEDULED');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incentive_source_type') THEN
    CREATE TYPE incentive_source_type AS ENUM ('POOL_JOIN', 'POOL_CREATOR_REWARD');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS activity_feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_event_type NOT NULL,
  user_id UUID REFERENCES users(id),
  pool_id UUID REFERENCES pools(id),
  errand_id UUID REFERENCES errands(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_incentive_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_type incentive_source_type NOT NULL,
  source_id UUID,
  amount_cents INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_credits_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS privacy_preference VARCHAR(32) NOT NULL DEFAULT 'PUBLIC_NAME';
