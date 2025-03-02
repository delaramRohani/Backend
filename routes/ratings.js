const express = require("express");
const client = require("../db");

const router = express();

// Get rate for a book
router.get("/rating:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await client.query("SELECT AVG(rating) as average_rating FROM ratings WHERE book_id = $1", [bookId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add new rating
router.post("/rating", async (req, res) => {
  const { userId, bookId, rating } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO ratings (user_id, book_id, rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, book_id) DO UPDATE SET rating = $3 RETURNING *",
      [userId, bookId, rating]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
