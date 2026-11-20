import Database from "better-sqlite3";
import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { runMigrations } from "./migrations";

const dataDir = path.join(app.getPath("userData"), "data");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "history.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

runMigrations(db);

export default db;
