CREATE TABLE aura_vaults (
  user_id TEXT PRIMARY KEY NOT NULL,
  document TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE aura_usage (
  user_id TEXT PRIMARY KEY NOT NULL,
  window_start INTEGER NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0
);
