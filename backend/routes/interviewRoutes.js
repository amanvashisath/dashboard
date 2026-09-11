const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================================================
// GET ALL INTERVIEWS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            interviews.*,

            CONCAT(
                candidates.first_name,
                ' ',
                COALESCE(candidates.last_name, '')
            ) AS candidate_name,

            candidates.email AS candidate_email,

            jobs.job_title

        FROM interviews

        INNER JOIN applications
            ON interviews.application_id = applications.id

        INNER JOIN candidates
            ON applications.candidate_id = candidates.id

        INNER JOIN jobs
            ON applications.job_id = jobs.id

        ORDER BY interviews.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "GET INTERVIEWS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch interviews",
                error: err.message
            });
        }

        res.json(results);
    });

});


// ======================================================
// ADD INTERVIEW
// ======================================================

router.post("/", (req, res) => {

    const {
        application_id,
        interview_date,
        interviewer,
        interview_mode,
        meeting_link,
        location,
        status,
        feedback,
        result
    } = req.body;


    const sql = `
        INSERT INTO interviews
        (
            application_id,
            interview_date,
            interviewer,
            interview_mode,
            meeting_link,
            location,
            status,
            feedback,
            result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [
        application_id,
        interview_date,
        interviewer,
        interview_mode || "online",
        meeting_link,
        location,
        status || "scheduled",
        feedback,
        result || "pending"
    ];


    db.query(sql, values, (err, resultData) => {

        if (err) {

            console.error(
                "ADD INTERVIEW ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to add interview",
                error: err.message
            });
        }


        res.status(201).json({

            message: "Interview added successfully",

            interview_id:
                resultData.insertId

        });

    });

});


module.exports = router;