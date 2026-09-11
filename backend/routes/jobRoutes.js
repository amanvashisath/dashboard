const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL JOBS
router.get("/", (req, res) => {

    const sql = `
        SELECT
            jobs.*,
            departments.name AS department_name,
            designations.name AS designation_name
        FROM jobs
        LEFT JOIN departments
            ON jobs.department_id = departments.id
        LEFT JOIN designations
            ON jobs.designation_id = designations.id
        ORDER BY jobs.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("GET JOBS ERROR:", err);

            return res.status(500).json({
                message: "Failed to fetch jobs",
                error: err.message
            });
        }

        res.json(results);
    });
});

// ADD JOB
router.post("/", (req, res) => {

    const {
        job_title,
        department_id,
        designation_id,
        description,
        requirements,
        salary_min,
        salary_max,
        location,
        employment_type,
        closing_date
    } = req.body;

    const sql = `
        INSERT INTO jobs
        (
            job_title,
            department_id,
            designation_id,
            description,
            requirements,
            salary_min,
            salary_max,
            location,
            employment_type,
            closing_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        job_title,
        department_id,
        designation_id,
        description,
        requirements,
        salary_min,
        salary_max,
        location,
        employment_type,
        closing_date
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("ADD JOB ERROR:", err);

            return res.status(500).json({
                message: "Failed to add job",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Job added successfully",
            job_id: result.insertId
        });
    });
});

module.exports = router;