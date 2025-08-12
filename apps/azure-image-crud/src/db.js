import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbFile = process.env.DATABASE_FILE || "data/app.db";
const dir = path.dirname(dbFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbFile);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  blobName TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  contentType TEXT,
  size INTEGER,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`);

export function createImage({ title, description, blobName, url, contentType, size }) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO images (title, description, blobName, url, contentType, size, createdAt, updatedAt)
    VALUES (@title, @description, @blobName, @url, @contentType, @size, @createdAt, @updatedAt)
  `);
  const info = stmt.run({
    title,
    description: description || "",
    blobName,
    url,
    contentType: contentType || null,
    size: size || null,
    createdAt: now,
    updatedAt: now
  });
  return getImage(info.lastInsertRowid);
}

export function listImages() {
  return db.prepare("SELECT * FROM images ORDER BY id DESC").all();
}

export function getImage(id) {
  return db.prepare("SELECT * FROM images WHERE id = ?").get(id);
}

export function updateImage(id, { title, description, blobName, url, contentType, size }) {
  const existing = getImage(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE images
    SET title = COALESCE(@title, title),
        description = COALESCE(@description, description),
        blobName = COALESCE(@blobName, blobName),
        url = COALESCE(@url, url),
        contentType = COALESCE(@contentType, contentType),
        size = COALESCE(@size, size),
        updatedAt = @updatedAt
    WHERE id = @id
  `);
  stmt.run({
    id,
    title,
    description,
    blobName,
    url,
    contentType,
    size,
    updatedAt: now
  });
  return getImage(id);
}

export function deleteImageRow(id) {
  const img = getImage(id);
  if (!img) return null;
  db.prepare("DELETE FROM images WHERE id = ?").run(id);
  return img;
}