const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully!",
      user: newUser.rows[0],
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }
  
    try {
      const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials!" });
      }
  
      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials!" });
      }
  
      const token = jwt.sign(
        { id: user.rows[0].id, email: user.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.status(200).json({
        message: "Login successful!",
        user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error!", error: error.message });
    }
  };
  
  const getUserProfile = async (req, res) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.query("SELECT id, name, email FROM users WHERE id = $1", [decoded.id]);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User not found!" });
      }
  
      res.status(200).json({ user: user.rows[0] });
    } catch (error) {
      res.status(401).json({ message: "Invalid token", error: error.message });
    }
  };

module.exports = { registerUser, loginUser, getUserProfile };