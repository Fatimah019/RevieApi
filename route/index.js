const express = require("express");
const router = express.Router();
const user = require("../controller");
const multer = require("multer");
const verifyJwt = require("../middleware");

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
//display docs

//register a user
router.post("/signup", user.Signup);

//log in a user
router.post("/login", user.Login);

// // get logged in user's info by id
// router.get("/userlogged/:id", user.GetUser);

// // upload and update profile picture
// router.put(
//   "/upload/picture/:id",
//   verifyJwt,
//   upload.single("avatar"),
//   user.UploadImage
// );

// // edit user info
// router.put("/edit/user/:id", verifyJwt, user.EditUser);

// // post reviews by user id
// router.post(
//   "/user/review/:id",
//   verifyJwt,
//   upload.single("reviewimageorvideo"),
//   user.PostReviewByUserId
// );

// // get review by user id
// router.get("/user/reviews/:id", verifyJwt, user.GetReviewsByUserId);

// // get a rewb]view  by review's id
// router.get("/review/:id", user.GetReviewById);

// // edit a review by its id
// router.put("/edit/review/:id", verifyJwt, user.EditReviewId);

// // edit a review by its id
// router.delete("/delete/review/:id", verifyJwt, user.DeleteReviewId);

// // mark a review as helpful by its id
// router.put("/mark/review/:id", user.MarkReview);

// // get review marks count
// router.get("/review/count/:id", user.GetReviewMarkCount);

// // get all reviews
// router.get("/reviews", user.GetAllReviews);

module.exports = router;
