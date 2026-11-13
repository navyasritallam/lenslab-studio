
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to SQLite database
const db = new sqlite3.Database(
    path.join(__dirname, "lenslab.db"),
    (err) => {
        if (err) {
            console.error("Database connection failed:", err.message);
        } else {
            console.log("Connected to LensLab Studio Database");
        }
    }
);

// Enable foreign key support
db.run("PRAGMA foreign_keys = ON");

// Create database tables
db.serialize(() => {

    // Photographers table
    db.run(`
        CREATE TABLE IF NOT EXISTS photographers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    `);

    // Cameras table
    db.run(`
        CREATE TABLE IF NOT EXISTS cameras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            kind TEXT NOT NULL,
            price_per_day REAL NOT NULL
        )
    `);

    // Rentals table
    db.run(`
        CREATE TABLE IF NOT EXISTS rentals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            photographer_id INTEGER NOT NULL,
            camera_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,

            FOREIGN KEY (photographer_id)
            REFERENCES photographers(id),

            FOREIGN KEY (camera_id)
            REFERENCES cameras(id),

            CHECK (end_date >= start_date)
        )
    `);

    console.log("Database tables created successfully");
});

module.exports = db;
