const express = require("express");
const router = express();
const client = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// User Authentication method
const authenticateUser = async (req, res) => {
    try {
        const user = await authMiddleware(req, res);
        if (!user) return null;
        return user;
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }
};

// Get all books
router.get("/", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM books");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Search books by author
router.get("/search", async (req, res) => {
    const { query } = req.query;
    try {
        const result = await client.query(
            "SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1",
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add books (Avoid Duplicates books)
router.post("/", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const { title, author, category } = req.body;

    try {
        // Avoid creating duplicate book
        const duplicateCheck = await client.query(
            "SELECT * FROM books WHERE title = $1 AND author = $2",
            [title, author]
        );
        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: "Book already exists" });
        }

        // Add new book
        const result = await client.query(
            "INSERT INTO books (title, author, category) VALUES ($1, $2, $3) RETURNING *",
            [title, author, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

