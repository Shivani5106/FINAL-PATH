const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware allows our React app (on port 5173/3000) to securely talk to our Server (on port 5000)
app.use(cors());
app.use(express.json());

// 1. Database Connection (Creates a local 'database.sqlite' file on your computer!)
const dbPath = path.resolve(__dirname, 'finalpath_local.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to local SQLite database (Free & Private!).');
    }
});

// 2. Create the 'Cases' database table automatically if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error("Error creating tables:", err.message);
        } else {
            console.log("✅ Database schema initialized.");
        }
    });
});

// ==========================================
// REST API ROUTES
// ==========================================

// Route 1: Health check
app.get('/', (req, res) => {
    res.json({ message: "FinalPath Backend API is running perfectly!" });
});

// Route 2: Register a new case (Triggered when Family clicks 'Submit Case' in React)
app.post('/api/cases', (req, res) => {
    const { name, origin, destination } = req.body;
    
    // Validation
    if (!name || !origin || !destination) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // SQL Injection safe insert
    const sql = `INSERT INTO cases (name, origin, destination, status) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [name, origin, destination, 'registered'], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            message: "Case registered successfully", 
            caseId: this.lastID 
        });
        console.log(`✅ New Case registered! ID: ${this.lastID}, Name: ${name}`);
    });
});

// Route 3: Get all cases (Used by the Coordinator Dashboard to list active cases)
app.get('/api/cases', (req, res) => {
    const sql = `SELECT * FROM cases ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ cases: rows });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🚀 FINALPATH BACKEND STARTED ON PORT ${PORT}`);
    console.log(`===========================================`);
});
