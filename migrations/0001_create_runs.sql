CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  source_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  student_count INTEGER NOT NULL CHECK (student_count > 0),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at DESC);
