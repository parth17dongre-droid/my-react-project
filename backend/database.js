const Database = require('better-sqlite3');

const db = new Database('database.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log("SQLite database and tables initialized successfully.");

module.exports = db;