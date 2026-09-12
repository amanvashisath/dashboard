const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ======================================================
// GET ALL DESIGNATIONS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM designations
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "GET DESIGNATIONS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch designations",
                error: err.message
            });

        }

        res.json(results);

    });

});


// ======================================================
// ADD DESIGNATION
// ======================================================

router.post("/", (req, res) => {

    const {
        name,
        description
    } = req.body;


    if (!name || !name.trim()) {

        return res.status(400).json({
            message: "Designation name is required"
        });

    }


    const sql = `
        INSERT INTO designations
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
                    "ADD DESIGNATION ERROR:",
                    err
                );


                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        message:
                            "Designation already exists"
                    });

                }


                return res.status(500).json({
                    message:
                        "Failed to add designation",
                    error: err.message
                });

            }


            res.status(201).json({

                message:
                    "Designation added successfully",

                designation_id:
                    result.insertId

            });

        }
    );

});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM designations WHERE id = ?", [req.params.id], (err, result) => {
        if (err) {
            return res.status(err.code === "ER_ROW_IS_REFERENCED_2" ? 409 : 500).json({
                message: err.code === "ER_ROW_IS_REFERENCED_2" ? "Remove employees or jobs using this designation first" : "Failed to delete designation",
                error: err.message
            });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Designation not found" });
        res.json({ message: "Designation deleted successfully" });
    });
});


module.exports = router;