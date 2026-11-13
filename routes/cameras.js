
const express = require("express");
const router = express.Router();

const db = require("../database/database");

// 1. GET - Retrieve all cameras
router.get("/", (req, res) => {
    const query = "SELECT * FROM cameras";

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

// 2. GET - Search cameras by kind
router.get("/search", (req, res) => {
    const { kind } = req.query;

    if (!kind) {
        return res.status(400).json({
            message: "Please provide a camera kind"
        });
    }

    const query = "SELECT * FROM cameras WHERE kind LIKE ?";

    db.all(query, [`%${kind}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

// 3. GET - Retrieve camera by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM cameras WHERE id = ?";

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({
                message: "Camera not found"
            });
        }

        res.status(200).json(row);
    });
});

// 4. POST - Add a new camera
router.post("/", (req, res) => {
    const { name, kind, price_per_day } = req.body;

    if (!name || !kind || price_per_day === undefined ||
        !Number.isFinite(Number(price_per_day)) ||
        Number(price_per_day) <= 0) {
        return res.status(400).json({
            message: "Valid name, kind and positive price_per_day are required"
        });
    }

    const query = `
        INSERT INTO cameras (name, kind, price_per_day)
        VALUES (?, ?, ?)
    `;

    db.run(query, [name, kind, Number(price_per_day)], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.status(201).json({
            message: "Camera added successfully",
            cameraId: this.lastID
        });
    });
});

// 5. PUT - Update camera details
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, kind, price_per_day } = req.body;

    if (!name || !kind || price_per_day === undefined ||
        !Number.isFinite(Number(price_per_day)) ||
        Number(price_per_day) <= 0) {
        return res.status(400).json({
            message: "Valid name, kind and positive price_per_day are required"
        });
    }

    const query = `
        UPDATE cameras
        SET name = ?, kind = ?, price_per_day = ?
        WHERE id = ?
    `;

    db.run(query, [name, kind, Number(price_per_day), id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Camera not found"
            });
        }

        res.status(200).json({
            message: "Camera updated successfully"
        });
    });
});

// 6. DELETE - Remove a camera
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM cameras WHERE id = ?";

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Camera not found"
            });
        }

        res.status(200).json({
            message: "Camera deleted successfully"
        });
    });
});

module.exports = router;
