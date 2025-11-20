
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite'); // Database file

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user' -- 'user' or 'admin'
  )`);


  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in-progress', 'completed'
    createdBy INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE CASCADE
  )`);


  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (err) {
      console.error("Error checking for initial users:", err);
      return;
    }
    if (row.count === 0) {
  
    }
  });

  console.log('SQLite Database connected and tables ensured.');
});

module.exports = db;