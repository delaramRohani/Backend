require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function(_, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

const port = 3000;

const usersRoutes = require("./routes/users");
const booksRoutes = require("./routes/books");
const reviewsRoutes = require("./routes/reviews");
const ratingsRoutes = require("./routes/ratings");
const favoritesRoutes = require("./routes/favorites");
const readBooksRoutes = require("./routes/readBooks");

app.use("/users", usersRoutes);
app.use("/books", booksRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/ratings", ratingsRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/read-books", readBooksRoutes);

app.listen(port, () => {
    console.log(` My app is listening at http://localhost:${port}`);
  });
  