const express = require("express");
const client = require("../db");

const router = express();

// Get books reviews
router.get("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await client.query("SELECT * FROM reviews WHERE book_id = $1", [bookId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add reviews
router.post("/", async (req, res) => {
  const { userId, bookId, content } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO reviews (user_id, book_id, content) VALUES ($1, $2, $3) RETURNING *",
      [userId, bookId, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete reviews
router.delete("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    await client.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
