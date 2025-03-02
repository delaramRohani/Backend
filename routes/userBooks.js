const express = require('express');
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

// Get the list of users reads book
router.get("/read", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
        const result = await client.query(
            "SELECT books.* FROM books JOIN user_books ON books.id = user_books.book_id WHERE user_books.user_id = $1 AND user_books.status = 'read'",
            [user.id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get the list of users favorites book
router.get("/favorite", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
        const result = await client.query(
            "SELECT books.* FROM books JOIN user_books ON books.id = user_books.book_id WHERE user_books.user_id = $1 AND user_books.status = 'favorite'",
            [user.id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add book to the read list
router.post("/read", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
        const { bookId } = req.body;
        await client.query(
            "INSERT INTO user_books (user_id, book_id, status) VALUES ($1, $2, 'read') ON CONFLICT (user_id, book_id, status) DO NOTHING",
            [user.id, bookId]
        );

        res.status(201).json({ message: "Book added to read list." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add book to favorites list
router.post("/favorite", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
        const { bookId } = req.body;
        await client.query(
            "INSERT INTO user_books (user_id, book_id, status) VALUES ($1, $2, 'favorite') ON CONFLICT (user_id, book_id, status) DO NOTHING",
            [user.id, bookId]
        );

        res.status(201).json({ message: "Book added to favorite list." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete the book from the read list
router.delete("/read/:bookId", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
        const { bookId } = req.params;
        const result = await client.query(
            "DELETE FROM user_books WHERE user_id = $1 AND book_id = $2 AND status = 'read' RETURNING *",
            [user.id, bookId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Book not found in read list." });
        }

        res.json({ message: "Book removed from read list." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete the book from the favorites list
router.delete("/favorite/:bookId", async (req, res) => {
    const user = await authenticateUser(req, res);
    if (!user) return;

    try {
        const { bookId } = req.params;
        const result = await client.query(
            "DELETE FROM user_books WHERE user_id = $1 AND book_id = $2 AND status = 'favorite' RETURNING *",
            [user.id, bookId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Book not found in favorite list." });
        }

        res.json({ message: "Book removed from favorite list." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;