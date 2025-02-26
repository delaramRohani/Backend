const express = require("express");
const client = require("../db");

const router = express.Router();

// Get user's favorites books
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await client.query("SELECT * FROM favorites WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add books to favorites
router.post("/", async (req, res) => {
  const { userId, bookId } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [userId, bookId]
    );
    res.json(result.rows[0] || { message: "Already in favorites" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete books from favorites
router.delete("/", async (req, res) => {
  const { userId, bookId } = req.body;
  try {
    await client.query("DELETE FROM favorites WHERE user_id = $1 AND book_id = $2", [userId, bookId]);
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
