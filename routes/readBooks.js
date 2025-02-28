const express = require("express");
const client = require("../db");

const router = express();

// Get user's read books 
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await client.query("SELECT * FROM read_books WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add read books
router.post("/", async (req, res) => {
  const { userId, bookId } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO read_books (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [userId, bookId]
    );
    res.json(result.rows[0] || { message: "Already in read list" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
