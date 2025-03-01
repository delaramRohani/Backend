const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const router = express();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUserProfile);

module.exports = router;