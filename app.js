const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database('./ex.db');

// Middleware to parse JSON bodies
app.use(express.json());

// Route to get all players
app.get('/players', (req, res) => {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const pageSize = parseInt(req.query.pageSize) || 100; // default to 100 rows per page
    const offset = (page - 1) * pageSize; // Calculate offset based on page number

    db.all('SELECT * FROM players LIMIT ? OFFSET ?', [pageSize, offset], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); 
    });
});

// Route to add a new player
app.post('/players', (req, res) => {
    const { name, age } = req.body;
    db.run('INSERT INTO players (Name, Age) VALUES (?, ?)', [name, age], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });  // Return the ID of the new player
    });
});

// Route to update an existing player
app.put('/players/:id', (req, res) => {
    const { name, age } = req.body;
    const { id } = req.params;
    db.run('UPDATE players SET Name = ?, Age = ? WHERE id = ?', [name, age, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changes: this.changes });  // Return the number of rows updated
    });
});

// Route to delete a player
app.delete('/players/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM players WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ changes: this.changes });  // Return the number of rows deleted
    });
});

// Start the API server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});


