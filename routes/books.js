const express = require("express");
const client = require("../db");

const router = express();

// Get all books
router.get("/books", async (req, res) => {
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
router.post("/books", async (req, res) => {
  const { title, author, category } = req.body;

  try {
    const result = await client.query(
      "INSERT INTO books (title, author, category) VALUES ($1, $2, $3) RETURNING *",
      [title, author, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Book already exists" });
  }
});

module.exports = router;
