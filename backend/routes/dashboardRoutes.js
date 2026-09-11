const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/stats", (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM employees) AS total_employees,
            (SELECT COUNT(*) FROM departments) AS total_departments,
            (SELECT COUNT(*) FROM designations) AS total_designations,
            (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS open_jobs,
            (SELECT COUNT(*) FROM candidates) AS total_candidates,
            (SELECT COUNT(*) FROM applications) AS total_applications,
            (SELECT COUNT(*) FROM interviews WHERE status = 'scheduled') AS scheduled_interviews
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("DASHBOARD STATS ERROR:", err);

            return res.status(500).json({
                message: "Failed to fetch dashboard statistics",
                error: err.message
            });
        }

        res.json(results[0]);
    });
});

module.exports = router;