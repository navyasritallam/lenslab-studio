
const express = require("express");
const router = express.Router();

const db = require("../database/database");

// GET - Retrieve all photographers
router.get("/", (req, res) => {
    const query = "SELECT * FROM photographers";

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.status(200).json(rows);
    });
});

// GET - Retrieve photographer by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM photographers WHERE id = ?";

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                message: "Photographer not found"
            });
        }

        res.status(200).json(row);
    });
});

// POST - Add a new photographer
router.post("/", (req, res) => {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({
            message: "Name, phone and email are required"
        });
    }

    const query = `
        INSERT INTO photographers (name, phone, email)
        VALUES (?, ?, ?)
    `;

    db.run(query, [name, phone, email], function (err) {
        if (err) {
            return res.status(400).json({
                error: err.message
            });
        }

        res.status(201).json({
            message: "Photographer added successfully",
            photographerId: this.lastID
        });
    });
});

// PUT - Update photographer
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({
            message: "Name, phone and email are required"
        });
    }

    const query = `
        UPDATE photographers
        SET name = ?, phone = ?, email = ?
        WHERE id = ?
    `;

    db.run(query, [name, phone, email, id], function (err) {
        if (err) {
            return res.status(400).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Photographer not found"
            });
        }

        res.status(200).json({
            message: "Photographer updated successfully"
        });
    });
});

// DELETE - Remove photographer
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM photographers WHERE id = ?";

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(400).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Photographer not found"
            });
        }

        res.status(200).json({
            message: "Photographer deleted successfully"
        });
    });
});

module.exports = router;
