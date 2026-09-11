const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL CANDIDATES
router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM candidates
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("GET CANDIDATES ERROR:", err);

            return res.status(500).json({
                message: "Failed to fetch candidates",
                error: err.message
            });
        }

        res.json(results);
    });
});


// ADD CANDIDATE
router.post("/", (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone,
        resume_url,
        skills,
        experience_years,
        education,
        address
    } = req.body;

    const sql = `
        INSERT INTO candidates
        (
            first_name,
            last_name,
            email,
            phone,
            resume_url,
            skills,
            experience_years,
            education,
            address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        first_name,
        last_name,
        email,
        phone,
        resume_url,
        skills,
        experience_years || 0,
        education,
        address
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("ADD CANDIDATE ERROR:", err);

            return res.status(500).json({
                message: "Failed to add candidate",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Candidate added successfully",
            candidate_id: result.insertId
        });
    });
});

module.exports = router;