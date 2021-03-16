const jwt = require("jsonwebtoken");
const { User } = require("../model");
require("dotenv").config();

const path = require("path");
const multer = require("multer");
// const dataUri = require("datauri");

// image upload
//declare the file storage procedure
// const storage = multer.memoryStorage();
// const dUri = new Datauri();

// const imgStorage = multer({
//   storage,
// }).array("productavatar", 10);

// const dataUri = (req) => {
//   dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
// };

// exports.verifyJwt = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader) {
//     const token = authHeader.split(" ")[1];

//     jwt.verify(token, process.env.SECRET, (err, user) => {
//       if (err) {
//         return res.sendStatus(403);
//       }

//       req.user = user;
//       next();
//     });
//   } else {
//     res.sendStatus(401);
//   }
// };

exports.verifyJwt = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    res.send("there is no token");
  } else {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
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

// export default verifyJwt;
