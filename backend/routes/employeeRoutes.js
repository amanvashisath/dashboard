const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL EMPLOYEES
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            employees.*,
            departments.name AS department_name,
            designations.name AS designation_name
        FROM employees
        LEFT JOIN departments 
            ON employees.department_id = departments.id
        LEFT JOIN designations 
            ON employees.designation_id = designations.id
        ORDER BY employees.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("GET ERROR:", err);
            return res.status(500).json({
                message: "Failed to fetch employees",
                error: err.message
            });
        }

        res.json(results);
    });
});


// ADD EMPLOYEE
router.post("/", (req, res) => {
    const {
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        gender,
        date_of_birth,
        address,
        department_id,
        designation_id,
        joining_date,
        salary,
        employment_status
    } = req.body;

    const sql = `
        INSERT INTO employees
        (
            employee_code,
            first_name,
            last_name,
            email,
            phone,
            gender,
            date_of_birth,
            address,
            department_id,
            designation_id,
            joining_date,
            salary,
            employment_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        gender,
        date_of_birth,
        address,
        department_id,
        designation_id,
        joining_date,
        salary,
        employment_status || "active"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("POST ERROR:", err);

            return res.status(500).json({
                message: "Failed to add employee",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Employee added successfully",
            employee_id: result.insertId
        });
    });
});


// DELETE EMPLOYEE
router.delete("/:id", (req, res) => {
    const employeeId = req.params.id;

    console.log("DELETE REQUEST RECEIVED:", employeeId);

    const sql = "DELETE FROM employees WHERE id = ?";

    db.query(sql, [employeeId], (err, result) => {
        if (err) {
            console.error("DELETE ERROR:", err);

            return res.status(500).json({
                message: "Failed to delete employee",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        console.log("EMPLOYEE DELETED:", employeeId);

        res.json({
            message: "Employee deleted successfully"
        });
    });
});

// UPDATE EMPLOYEE
// UPDATE EMPLOYEE
router.put("/:id", (req, res) => {

    const employeeId = req.params.id;

    const {
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        gender,
        date_of_birth,
        address,
        department_id,
        designation_id,
        joining_date,
        salary,
        employment_status
    } = req.body;

    const sql = `
        UPDATE employees
        SET
            employee_code = ?,
            first_name = ?,
            last_name = ?,
            email = ?,
            phone = ?,
            gender = ?,
            date_of_birth = ?,
            address = ?,
            department_id = ?,
            designation_id = ?,
            joining_date = ?,
            salary = ?,
            employment_status = ?
        WHERE id = ?
    `;

    const values = [
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        gender,
        date_of_birth,
        address,
        department_id,
        designation_id,
        joining_date,
        salary,
        employment_status,
        employeeId
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("UPDATE ERROR:", err);

            return res.status(500).json({
                message: "Failed to update employee",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            message: "Employee updated successfully"
        });
    });
});
module.exports = router;