-- Run this in Neon SQL editor once before first production login.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  unit_id TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_state (
  unit_key TEXT PRIMARY KEY,
  state_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example insert (replace hash value with bcrypt hash):
-- INSERT INTO users (username, password_hash, role, unit_id, is_active)
-- VALUES ('admin', '$2a$10$replace_with_bcrypt_hash', 'admin', NULL, TRUE)
-- ON CONFLICT (username) DO NOTHING;

