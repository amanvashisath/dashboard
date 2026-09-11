const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================================================
// SEARCH
// ======================================================

router.get("/", (req, res) => {

    const search = req.query.q || "";
    const type = req.query.type || "all";

    if (!search.trim()) {
        return res.status(400).json({
            message: "Search term is required"
        });
    }

    const keyword = `%${search.trim()}%`;

    // ==================================================
    // SEARCH EMPLOYEES
    // ==================================================

    if (type === "employees") {

        const sql = `
            SELECT
                e.id,
                e.employee_code,
                CONCAT(
                    e.first_name,
                    ' ',
                    COALESCE(e.last_name, '')
                ) AS name,
                e.email,
                e.phone,
                d.name AS department,
                dg.name AS designation,
                e.employment_status AS status
            FROM employees e
            LEFT JOIN departments d
                ON e.department_id = d.id
            LEFT JOIN designations dg
                ON e.designation_id = dg.id
            WHERE
                e.employee_code LIKE ?
                OR e.first_name LIKE ?
                OR e.last_name LIKE ?
                OR e.email LIKE ?
                OR e.phone LIKE ?
                OR d.name LIKE ?
                OR dg.name LIKE ?
            ORDER BY e.id DESC
        `;

        const values = [
            keyword,
            keyword,
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        ];

        db.query(sql, values, (err, results) => {

            if (err) {
                console.error(
                    "SEARCH EMPLOYEES ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to search employees",
                    error: err.message
                });
            }

            res.json({
                type: "employees",
                results: results
            });

        });

        return;
    }


    // ==================================================
    // SEARCH CANDIDATES
    // ==================================================

    if (type === "candidates") {

        const sql = `
            SELECT
                id,
                CONCAT(
                    first_name,
                    ' ',
                    COALESCE(last_name, '')
                ) AS name,
                email,
                phone,
                skills,
                experience_years,
                education
            FROM candidates
            WHERE
                first_name LIKE ?
                OR last_name LIKE ?
                OR email LIKE ?
                OR phone LIKE ?
                OR skills LIKE ?
                OR education LIKE ?
            ORDER BY id DESC
        `;

        const values = [
            keyword,
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        ];

        db.query(sql, values, (err, results) => {

            if (err) {
                console.error(
                    "SEARCH CANDIDATES ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to search candidates",
                    error: err.message
                });
            }

            res.json({
                type: "candidates",
                results: results
            });

        });

        return;
    }


    // ==================================================
    // SEARCH JOBS
    // ==================================================

    if (type === "jobs") {

        const sql = `
            SELECT
                j.id,
                j.job_title,
                d.name AS department,
                dg.name AS designation,
                j.location,
                j.employment_type,
                j.status,
                j.salary_min,
                j.salary_max
            FROM jobs j
            LEFT JOIN departments d
                ON j.department_id = d.id
            LEFT JOIN designations dg
                ON j.designation_id = dg.id
            WHERE
                j.job_title LIKE ?
                OR j.description LIKE ?
                OR j.requirements LIKE ?
                OR j.location LIKE ?
                OR d.name LIKE ?
                OR dg.name LIKE ?
            ORDER BY j.id DESC
        `;

        const values = [
            keyword,
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        ];

        db.query(sql, values, (err, results) => {

            if (err) {
                console.error(
                    "SEARCH JOBS ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to search jobs",
                    error: err.message
                });
            }

            res.json({
                type: "jobs",
                results: results
            });

        });

        return;
    }


    // ==================================================
    // SEARCH ALL
    // ==================================================

    if (type === "all") {

        const employeeSql = `
            SELECT
                e.id,
                e.employee_code,
                CONCAT(
                    e.first_name,
                    ' ',
                    COALESCE(e.last_name, '')
                ) AS name,
                e.email,
                d.name AS department,
                dg.name AS designation,
                e.employment_status AS status
            FROM employees e
            LEFT JOIN departments d
                ON e.department_id = d.id
            LEFT JOIN designations dg
                ON e.designation_id = dg.id
            WHERE
                e.employee_code LIKE ?
                OR e.first_name LIKE ?
                OR e.last_name LIKE ?
                OR e.email LIKE ?
                OR d.name LIKE ?
                OR dg.name LIKE ?
            ORDER BY e.id DESC
        `;

        const employeeValues = [
            keyword,
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        ];


        db.query(
            employeeSql,
            employeeValues,
            (employeeError, employees) => {

                if (employeeError) {

                    console.error(
                        "SEARCH ALL EMPLOYEES ERROR:",
                        employeeError
                    );

                    return res.status(500).json({
                        message: "Failed to search employees",
                        error: employeeError.message
                    });
                }


                const candidateSql = `
                    SELECT
                        id,
                        CONCAT(
                            first_name,
                            ' ',
                            COALESCE(last_name, '')
                        ) AS name,
                        email,
                        phone,
                        skills,
                        experience_years,
                        education
                    FROM candidates
                    WHERE
                        first_name LIKE ?
                        OR last_name LIKE ?
                        OR email LIKE ?
                        OR phone LIKE ?
                        OR skills LIKE ?
                        OR education LIKE ?
                    ORDER BY id DESC
                `;

                const candidateValues = [
                    keyword,
                    keyword,
                    keyword,
                    keyword,
                    keyword,
                    keyword
                ];


                db.query(
                    candidateSql,
                    candidateValues,
                    (candidateError, candidates) => {

                        if (candidateError) {

                            console.error(
                                "SEARCH ALL CANDIDATES ERROR:",
                                candidateError
                            );

                            return res.status(500).json({
                                message: "Failed to search candidates",
                                error: candidateError.message
                            });
                        }


                        const jobSql = `
                            SELECT
                                j.id,
                                j.job_title,
                                d.name AS department,
                                dg.name AS designation,
                                j.location,
                                j.employment_type,
                                j.status
                            FROM jobs j
                            LEFT JOIN departments d
                                ON j.department_id = d.id
                            LEFT JOIN designations dg
                                ON j.designation_id = dg.id
                            WHERE
                                j.job_title LIKE ?
                                OR j.description LIKE ?
                                OR j.requirements LIKE ?
                                OR j.location LIKE ?
                                OR d.name LIKE ?
                                OR dg.name LIKE ?
                            ORDER BY j.id DESC
                        `;

                        const jobValues = [
                            keyword,
                            keyword,
                            keyword,
                            keyword,
                            keyword,
                            keyword
                        ];


                        db.query(
                            jobSql,
                            jobValues,
                            (jobError, jobs) => {

                                if (jobError) {

                                    console.error(
                                        "SEARCH ALL JOBS ERROR:",
                                        jobError
                                    );

                                    return res.status(500).json({
                                        message: "Failed to search jobs",
                                        error: jobError.message
                                    });
                                }


                                res.json({
                                    type: "all",
                                    employees: employees,
                                    candidates: candidates,
                                    jobs: jobs
                                });

                            }
                        );

                    }
                );

            }
        );

        return;
    }


    // ==================================================
    // INVALID SEARCH TYPE
    // ==================================================

    return res.status(400).json({
        message: "Invalid search type"
    });

});


module.exports = router;