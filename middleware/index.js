const jwt = require("jsonwebtoken");
const { User } = require("../model");
require("dotenv").config();
exports.verifyJwt = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("there is no token");
  } else {
    jwt.verify(token, process.env.DB_SECRET, (err, decoded) => {
      if (err) {
        res.json({
          error: "not authenticated",
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};
