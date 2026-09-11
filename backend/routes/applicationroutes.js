const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL APPLICATIONS
router.get("/", (req, res) => {

    const sql = `
        SELECT
            applications.*,

            CONCAT(
                candidates.first_name,
                ' ',
                COALESCE(candidates.last_name, '')
            ) AS candidate_name,

            candidates.email AS candidate_email,

            jobs.job_title

        FROM applications

        INNER JOIN candidates
            ON applications.candidate_id = candidates.id

        INNER JOIN jobs
            ON applications.job_id = jobs.id

        ORDER BY applications.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("GET APPLICATIONS ERROR:", err);

            return res.status(500).json({
                message: "Failed to fetch applications",
                error: err.message
            });
        }

        res.json(results);
    });
});


// ADD APPLICATION
router.post("/", (req, res) => {

    const {
        candidate_id,
        job_id,
        status,
        notes
    } = req.body;

    const sql = `
        INSERT INTO applications
        (
            candidate_id,
            job_id,
            status,
            notes
        )
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        candidate_id,
        job_id,
        status || "applied",
        notes
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("ADD APPLICATION ERROR:", err);

            return res.status(500).json({
                message: "Failed to add application",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Application added successfully",
            application_id: result.insertId
        });
    });
});


module.exports = router;