import Database from "better-sqlite3";

const migrations = [
  // v1: initial schema
  `
    CREATE TABLE runs (
      id            INTEGER PRIMARY KEY,
      kind          TEXT NOT NULL,
      input_path    TEXT NOT NULL,
      input_sha256  TEXT,
      output_path   TEXT NOT NULL,
      thumb_path    TEXT,
      settings      TEXT NOT NULL DEFAULT '{}'
                      CHECK (json_valid(settings)),
      batch_id      TEXT,
      parent_run_id INTEGER REFERENCES runs(id) ON DELETE SET NULL,
      created_at    INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX idx_runs_output_unique ON runs(output_path);

    CREATE INDEX idx_runs_created   ON runs(created_at DESC, id DESC);
    CREATE INDEX idx_runs_batch     ON runs(batch_id, created_at, id);
    CREATE INDEX idx_runs_input     ON runs(input_path);
    CREATE INDEX idx_runs_input_sha ON runs(input_sha256);
  `,
];

export function runMigrations(db: Database.Database) {
  const currentVersion = db.pragma("user_version", {
    simple: true,
  }) as number;

  const latestVersion = migrations.length;

  if (currentVersion > latestVersion) {
    throw new Error(
      `Database version ${currentVersion} is newer than supported version ${latestVersion}.`,
    );
  }

  migrations.forEach((migration, idx) => {
    if (currentVersion < idx + 1) {
      db.transaction(() => {
        db.exec(migration);
        db.pragma(`user_version = ${idx + 1}`);
      })();
    }
  });
}
