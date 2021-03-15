const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const expressValidator = require("express-validator");
const mongoose = require("mongoose");
const path = require("path");
const router = require("./route");
const PORT = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

// connect to database
mongoose
  .set("useCreateIndex", true)
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
  });

// app.use("/images", express.static("images"));
// app.use(express.static(__dirname + '/public'));
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.DB_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  cors({
    origin: [process.env.DB_SECRET, "https://localhost:5000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/", router);
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

module.exports = app;
