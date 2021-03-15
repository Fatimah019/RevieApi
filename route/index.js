const express = require("express");
const router = express.Router();
const user = require("../controller");
const multer = require("multer");

// create a storage space for files in multer
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// filer  files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb({ message: "unsupported file" }, false);
  }
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
/*--------------
 ROUTES
--------------- */

//register a user
router.post("/signup", user.IqSignup);

//log in a user
router.post("/login", user.IqLogin);

// get logged in user's info by id
router.post("/userlogged/:id", user.GetIqUser);

// get reviews by user id
router.post("/user/review/:id", user.GetReviewByUserId);

// create new review
router.post(
  "/new/review/:id",
  upload.array("reviwavatarorvid", 10),
  user.IqUserReview
);

// get all reviews
router.get("/reviews", user.GetAllReviews);

// get all users
router.get("/users", user.GetUsers);

module.exports = router;
