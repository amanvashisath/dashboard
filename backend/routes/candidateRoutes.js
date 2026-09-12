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

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM candidates WHERE id = ?", [req.params.id], (err, result) => {
        if (err) {
            return res.status(err.code === "ER_ROW_IS_REFERENCED_2" ? 409 : 500).json({
                message: err.code === "ER_ROW_IS_REFERENCED_2" ? "Remove linked applications before deleting this candidate" : "Failed to delete candidate",
                error: err.message
            });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Candidate not found" });
        res.json({ message: "Candidate deleted successfully" });
    });
});

router.put("/:id", (req, res) => {
    const { first_name, last_name, email, phone, resume_url, skills, experience_years, education, address } = req.body;
    db.query(`UPDATE candidates SET first_name = ?, last_name = ?, email = ?, phone = ?, resume_url = ?, skills = ?, experience_years = ?, education = ?, address = ? WHERE id = ?`, [first_name, last_name, email, phone, resume_url, skills, experience_years || 0, education, address, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to update candidate", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Candidate not found" });
        res.json({ message: "Candidate updated successfully" });
    });
});

module.exports = router;