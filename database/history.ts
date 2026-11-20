import {
  HistoryEntrySettings,
  HistoryEntry,
  HistoryEntryKind,
} from "../common/types/types";
import db from "./index";

type RunKind = "upscale" | "bg_remove";

const ENTRY_KIND_TO_RUN_KIND: Record<HistoryEntryKind, RunKind> = {
  upscayl: "upscale",
  "double-upscayl": "upscale",
  "batch-upscayl": "upscale",
  "remove-background": "bg_remove",
};

const RUN_KIND_TO_ENTRY_KIND: Record<RunKind, HistoryEntryKind> = {
  upscale: "upscayl",
  bg_remove: "remove-background",
};

interface RunRow {
  id: number;
  kind: RunKind;
  input_path: string;
  input_sha256: string | null;
  output_path: string;
  thumb_path: string | null;
  settings: string;
  batch_id: string | null;
  parent_run_id: number | null;
  created_at: number;
}

export type NewHistoryEntry = HistoryEntrySettings & {
  kind: HistoryEntryKind;
  inputPath: string;
  outputPath: string;
  inputSha256?: string;
  model?: string;
  scale?: string;
  batchId?: string;
  parentRunId?: string;
  createdAt?: number;
};

export interface ListHistoryOptions {
  limit?: number;
  offset?: number;
  kind?: HistoryEntryKind;
  batchId?: string;
  search?: string;
  since?: number;
  until?: number;
}

const toRunId = (id: number | string): number | null => {
  const parsed = typeof id === "number" ? id : Number.parseInt(id, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseSettings = (raw: string): HistoryEntrySettings => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as HistoryEntrySettings)
      : {};
  } catch {
    return {};
  }
};

const toHistoryEntry = (row: RunRow): HistoryEntry => {
  const settings = parseSettings(row.settings);

  return {
    id: row.id,
    kind: settings.entryKind ?? RUN_KIND_TO_ENTRY_KIND[row.kind],
    inputPath: row.input_path,
    inputSha256: row.input_sha256,
    outputPath: row.output_path,
    thumbPath: row.thumb_path,
    settings,
    batchId: row.batch_id,
    parentRunId: row.parent_run_id,
    createdAt: row.created_at,
  };
};

const toRunParams = (entry: NewHistoryEntry) => {
  const settings: HistoryEntrySettings = {
    entryKind: entry.kind,
    ...(entry.model !== undefined && { model: entry.model }),
    ...(entry.scale !== undefined && { scale: entry.scale }),
    ...(entry.saveImageAs !== undefined && { saveImageAs: entry.saveImageAs }),
  };

  return {
    kind: ENTRY_KIND_TO_RUN_KIND[entry.kind],
    input_path: entry.inputPath,
    input_sha256: entry.inputSha256 ?? null,
    output_path: entry.outputPath,
    settings: JSON.stringify(settings),
    batch_id: entry.batchId ?? null,
    parent_run_id: entry.parentRunId ?? null,
    created_at: entry.createdAt ?? Date.now(),
  };
};

const upsert = () =>
  db.prepare(`
  INSERT INTO runs (
    kind, input_path, input_sha256, output_path, settings,
    batch_id, parent_run_id, created_at
  ) VALUES (
    @kind, @input_path, @input_sha256, @output_path, @settings,
    @batch_id, @parent_run_id, @created_at
  )
  ON CONFLICT(output_path) DO UPDATE SET
    kind          = excluded.kind,
    input_path    = excluded.input_path,
    input_sha256  = excluded.input_sha256,
    settings      = excluded.settings,
    batch_id      = excluded.batch_id,
    parent_run_id = excluded.parent_run_id,
    created_at    = excluded.created_at
  RETURNING id
`);

const selectById = () =>
  db.prepare<[number], RunRow>(`SELECT * FROM runs WHERE id = ?`);

const buildWhere = (options: ListHistoryOptions) => {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};

  if (options.kind) {
    clauses.push("kind = @kind");
    params.kind = ENTRY_KIND_TO_RUN_KIND[options.kind];
    // `upscale` covers three renderer kinds; narrow via the settings blob.
    if (options.kind !== RUN_KIND_TO_ENTRY_KIND[params.kind as RunKind]) {
      clauses.push("json_extract(settings, '$.entryKind') = @entryKind");
      params.entryKind = options.kind;
    }
  }

  if (options.batchId) {
    clauses.push("batch_id = @batchId");
    params.batchId = options.batchId;
  }

  if (options.search) {
    clauses.push(
      "(input_path LIKE @search OR output_path LIKE @search OR settings LIKE @search)",
    );
    params.search = `%${options.search.replace(/[%_]/g, "\\$&")}%`;
  }

  if (typeof options.since === "number") {
    clauses.push("created_at >= @since");
    params.since = options.since;
  }

  if (typeof options.until === "number") {
    clauses.push("created_at < @until");
    params.until = options.until;
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

/** Record a single run and return the stored history entry. */
export const createHistoryEntry = (entry: NewHistoryEntry): HistoryEntry => {
  // Re-recording the same output path (e.g. re-upscaling) updates in place
  // instead of tripping the UNIQUE constraint. RETURNING id also stays correct
  // on the DO UPDATE branch, unlike lastInsertRowid.
  const { id } = upsert().get(toRunParams(entry)) as { id: number };
  const row = selectById().get(id);
  if (!row) throw new Error("Failed to read back inserted history entry");
  return toHistoryEntry(row);
};

/** Record many runs atomically (batch jobs). */
export const createHistoryEntries = (
  entries: NewHistoryEntry[],
): HistoryEntry[] => {
  const statement = upsert();
  const ids = db.transaction((items: NewHistoryEntry[]) =>
    items.map(
      (item) => (statement.get(toRunParams(item)) as { id: number }).id,
    ),
  )(entries);

  return ids
    .map((id) => selectById().get(id))
    .filter((row): row is RunRow => Boolean(row))
    .map(toHistoryEntry);
};

export const listHistoryEntries = (
  options: ListHistoryOptions = {},
): HistoryEntry[] => {
  const { where, params } = buildWhere(options);
  const limit = Math.max(1, Math.min(options.limit ?? 200, 1000));
  const offset = Math.max(0, options.offset ?? 0);

  const rows = db
    .prepare(
      `SELECT * FROM runs ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit, offset }) as RunRow[];

  return rows.map(toHistoryEntry);
};

export const countHistoryEntries = (
  options: Omit<ListHistoryOptions, "limit" | "offset"> = {},
): number => {
  const { where, params } = buildWhere(options);
  const row = db
    .prepare(`SELECT COUNT(*) AS count FROM runs ${where}`)
    .get(params) as { count: number };
  return row.count;
};

export const findHistoryEntriesByInputHash = (
  inputSha256: string,
): HistoryEntry[] => {
  const rows = db
    .prepare(
      `SELECT * FROM runs WHERE input_sha256 = ?
       ORDER BY created_at DESC, id DESC`,
    )
    .all(inputSha256) as RunRow[];
  return rows.map(toHistoryEntry);
};

export const updateHistorySettings = (
  id: number | string,
  patch: HistoryEntrySettings,
): boolean => {
  const runId = toRunId(id);
  if (runId === null) return false;
  const row = selectById().get(runId);
  if (!row) return false;
  const settings = { ...parseSettings(row.settings), ...patch };
  return (
    db
      .prepare(`UPDATE runs SET settings = ? WHERE id = ?`)
      .run(JSON.stringify(settings), runId).changes > 0
  );
};

export const deleteHistoryEntry = (id: number | string): boolean => {
  const runId = toRunId(id);
  if (runId === null) return false;
  return db.prepare(`DELETE FROM runs WHERE id = ?`).run(runId).changes > 0;
};

export const deleteHistoryEntriesByBatch = (batchId: string): boolean => {
  if (batchId.trim().length === 0) return false;
  return (
    db.prepare(`DELETE FROM runs WHERE batch_id = ?`).run(batchId).changes > 0
  );
};

export const clearHistoryEntries = (kind?: HistoryEntryKind): number => {
  if (!kind) return db.prepare(`DELETE FROM runs`).run().changes;
  const { where, params } = buildWhere({ kind });
  return db.prepare(`DELETE FROM runs ${where}`).run(params).changes;
};

export const closeHistoryDatabase = () => {
  if (db.open) db.close();
};
