import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Keep the DB file next to dist/src in production and src in dev.
// For simplicity we just put it in project root:
const DB_PATH = path.resolve("./data.sqlite");

// Ensure directory exists (in case path includes folders)
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

// Safe/widely-used pragmas
db.pragma("journal_mode = WAL");

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_items_createdAt ON items (createdAt);
  CREATE INDEX IF NOT EXISTS idx_items_name ON items (name);
`);
