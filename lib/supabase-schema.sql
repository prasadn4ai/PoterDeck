-- PoterDeck Beta — Supabase Schema
-- Run this in Supabase SQL Editor to initialize the database.

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  provider TEXT CHECK (provider IN ('email', 'google', 'github')),
  provider_id TEXT,
  max_decks_per_month INT DEFAULT 10,
  max_slides_per_deck INT DEFAULT 30,
  monthly_deck_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (for token invalidation)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MaskMap (server-side only, never exposed to client)
CREATE TABLE IF NOT EXISTS mask_maps (
  session_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mask_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours')
);

-- Analytics events (never stores prompt content, key values, or slide data)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  provider TEXT,
  key_type TEXT,
  export_format TEXT,
  slide_count INT,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_mask_maps_expires ON mask_maps(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type, created_at);

-- Auto-cleanup expired sessions (run as a cron or Supabase edge function)
-- DELETE FROM sessions WHERE expires_at < NOW();
-- DELETE FROM mask_maps WHERE expires_at < NOW();
