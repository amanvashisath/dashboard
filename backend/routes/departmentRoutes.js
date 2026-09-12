const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ======================================================
// GET ALL DEPARTMENTS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM departments
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "GET DEPARTMENTS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch departments",
                error: err.message
            });

        }

        res.json(results);

    });

});


// ======================================================
// ADD DEPARTMENT
// ======================================================

router.post("/", (req, res) => {

    const {
        name,
        description
    } = req.body;


    // Validate department name

    if (!name || !name.trim()) {

        return res.status(400).json({
            message: "Department name is required"
        });

    }


    const sql = `
        INSERT INTO departments
        (
            name,
            description
        )
        VALUES (?, ?)
    `;


    const values = [
        name.trim(),
        description || null
    ];


    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.error(
                    "ADD DEPARTMENT ERROR:",
                    err
                );


                // Duplicate department name

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        message:
                            "Department already exists"
                    });

                }


                return res.status(500).json({
                    message:
                        "Failed to add department",
                    error: err.message
                });

            }


            res.status(201).json({

                message:
                    "Department added successfully",

                department_id:
                    result.insertId

            });

        }
    );

});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM departments WHERE id = ?", [req.params.id], (err, result) => {
        if (err) {
            return res.status(err.code === "ER_ROW_IS_REFERENCED_2" ? 409 : 500).json({
                message: err.code === "ER_ROW_IS_REFERENCED_2" ? "Remove employees or jobs using this department first" : "Failed to delete department",
                error: err.message
            });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Department not found" });
        res.json({ message: "Department deleted successfully" });
    });
});

router.put("/:id", (req, res) => {
    db.query("UPDATE departments SET name = ?, description = ? WHERE id = ?", [req.body.name, req.body.description || null, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to update department", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Department not found" });
        res.json({ message: "Department updated successfully" });
    });
});


module.exports = router;