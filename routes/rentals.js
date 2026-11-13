
const express = require("express");
const router = express.Router();

const db = require("../database/database");

// Helper function to validate dates
function validDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
        return false;
    }

    const parsed = new Date(date + "T00:00:00Z");

    return !isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date;
}

// 1. GET - Retrieve all rentals with photographer and camera details
router.get("/", (req, res) => {
    const query = `
        SELECT
            rentals.id,
            photographers.name AS photographer_name,
            photographers.phone,
            cameras.name AS camera_name,
            cameras.kind,
            cameras.price_per_day,
            rentals.start_date,
            rentals.end_date
        FROM rentals
        JOIN photographers
            ON rentals.photographer_id = photographers.id
        JOIN cameras
            ON rentals.camera_id = cameras.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

// 2. GET - Retrieve a rental by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT
            rentals.id,
            photographers.name AS photographer_name,
            photographers.phone,
            cameras.name AS camera_name,
            cameras.kind,
            cameras.price_per_day,
            rentals.start_date,
            rentals.end_date
        FROM rentals
        JOIN photographers
            ON rentals.photographer_id = photographers.id
        JOIN cameras
            ON rentals.camera_id = cameras.id
        WHERE rentals.id = ?
    `;

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({
                message: "Rental not found"
            });
        }

        res.status(200).json(row);
    });
});

// 3. POST - Create a new rental
router.post("/", (req, res) => {
    const {
        photographer_id,
        camera_id,
        start_date,
        end_date
    } = req.body;

    if (
        !Number.isInteger(photographer_id) ||
        photographer_id <= 0 ||
        !Number.isInteger(camera_id) ||
        camera_id <= 0 ||
        !validDate(start_date) ||
        !validDate(end_date) ||
        end_date < start_date
    ) {
        return res.status(400).json({
            message: "Provide valid photographer_id, camera_id, start_date and end_date"
        });
    }

    // Check whether the camera is already booked
    const conflictQuery = `
        SELECT id FROM rentals
        WHERE camera_id = ?
        AND NOT (end_date < ? OR start_date > ?)
    `;

    db.get(
        conflictQuery,
        [camera_id, start_date, end_date],
        (err, booking) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (booking) {
                return res.status(409).json({
                    message: "Camera is already booked for these dates"
                });
            }

            const insertQuery = `
                INSERT INTO rentals
                (photographer_id, camera_id, start_date, end_date)
                VALUES (?, ?, ?, ?)
            `;

            db.run(
                insertQuery,
                [photographer_id, camera_id, start_date, end_date],
                function (err) {
                    if (err) {
                        return res.status(400).json({
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        message: "Rental created successfully",
                        rentalId: this.lastID
                    });
                }
            );
        }
    );
});

// 4. PUT - Update rental details
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        photographer_id,
        camera_id,
        start_date,
        end_date
    } = req.body;

    if (
        !Number.isInteger(photographer_id) ||
        photographer_id <= 0 ||
        !Number.isInteger(camera_id) ||
        camera_id <= 0 ||
        !validDate(start_date) ||
        !validDate(end_date) ||
        end_date < start_date
    ) {
        return res.status(400).json({
            message: "Provide valid rental details and dates"
        });
    }

    const conflictQuery = `
        SELECT id FROM rentals
        WHERE camera_id = ?
        AND id != ?
        AND NOT (end_date < ? OR start_date > ?)
    `;

    db.get(
        conflictQuery,
        [camera_id, id, start_date, end_date],
        (err, booking) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (booking) {
                return res.status(409).json({
                    message: "Camera is already booked for these dates"
                });
            }

            const updateQuery = `
                UPDATE rentals
                SET photographer_id = ?,
                    camera_id = ?,
                    start_date = ?,
                    end_date = ?
                WHERE id = ?
            `;

            db.run(
                updateQuery,
                [photographer_id, camera_id, start_date, end_date, id],
                function (err) {
                    if (err) {
                        return res.status(400).json({
                            error: err.message
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            message: "Rental not found"
                        });
                    }

                    res.status(200).json({
                        message: "Rental updated successfully"
                    });
                }
            );
        }
    );
});

// 5. DELETE - Cancel a rental
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM rentals WHERE id = ?";

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(400).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Rental not found"
            });
        }

        res.status(200).json({
            message: "Rental cancelled successfully"
        });
    });
});

module.exports = router;
