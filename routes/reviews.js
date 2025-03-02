const express = require("express");
const client = require("../db");

const router = express();

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

// Get books reviews
router.get("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await client.query(
      "SELECT * FROM reviews WHERE book_id = $1",
      [bookId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add reviews
router.post("/", async (req, res) => {
  const user = await authenticateUser(req, res);
  if (!user) return;

  const { bookId, content } = req.body;
  const userId = user.id;

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
  const user = await authenticateUser(req, res);
  if (!user) return;

  const { reviewId } = req.params;
  const userId = user.id;

  try {
    const review = await client.query(
      "SELECT * FROM reviews WHERE id = $1 AND user_id = $2",
      [reviewId, userId]
    );

    if (review.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews." });
    }

    await client.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
    res.json({ message: "Review deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
