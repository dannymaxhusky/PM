CREATE TABLE IF NOT EXISTS pm_workspace_state (
  workspace_key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pm_workspace_state_updated_idx
  ON pm_workspace_state (updated_at DESC);
