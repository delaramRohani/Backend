const express = require("express");
const router = express();
const { authenticateToken } = require("../middleware/authMiddleware");
const User = require("./users");

router.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "email"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
