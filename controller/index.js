const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { IqUser, IqUserReview } = require("../model");
const { cloudinary } = require("../config");
const iquserreview = require("../model/iquserreview");

// IqTest
//signup (post method)
exports.Signup = async (req, res) => {
  req.check("email", "make sure you fill in your email").notEmpty();
  req
    .check("email", "make sure your email is correct and in the right format")
    .isEmail();
  req.check("username", "username cannot be left blank").notEmpty();
  req
    .check("password", "password should contain more than 5 characters")
    .isLength({
      min: 6,
      max: 20,
    });
  req
    .check("confirm_password", "confirm_password should match your password")
    .isLength({
      min: 6,
      max: 20,
    });

  // check for first error and signal error message
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.json({
      status: false,
      message: firstError,
    });
  }

  const { email, username, password, confirm_password } = req.body;
  try {
    // check if email exists
    let checkemail = await IqUser.findOne({ email });
    if (checkemail) {
      return res.json({
        status: false,
        message: "user exists already, use another email",
      });
    }
    // check if username exists
    let checkusername = await IqUser.findOne({ username });
    if (checkusername) {
      return res.json({
        status: false,
        message: "user exists already, use another username",
      });
    }

    //chaeck for matching password
    if (password !== confirm_password) {
      return res.json({
        status: false,
        message: "passwords do not match",
      });
    } else {
      bcrypt.hash(password && confirm_password, 10, (err, hash) => {
        if (err) {
          res.json(err);
        } else {
          const user = new IqUser({
            username,
            email,
            password: hash,
            confirm_password: hash,
            avatar: "",
          });
          user
            .save()
            .then(() => {
              return res.json({
                status: true,
                message: "Signedup Successfully",
                user,
              });
            })
            .catch((err) => {
              res.json({
                status: false,
                message: `Could not sign you up ${err}`,
              });
            });
        }
      });
    }
  } catch (err) {
    res.json({
      status: false,
      message: err,
    });
  }
};

//login (post method)
exports.Login = async (req, res) => {
  req.check("email", "make sure you fill in your email").notEmpty();

  req
    .check("email", "make sure your email is correct and in the right format")
    .isEmail();

  req
    .check("password", "password should contain more than 5 characters")
    .isLength({
      min: 6,
      max: 20,
    });
  // check for first error and signal error message
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.json({
      status: false,
      message: firstError,
    });
  }

  const { email, password } = req.body;

  try {
    let user = await IqUser.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.json({
        success: false,
        message: "password is incorrect",
      });
    } else {
      const payload = {
        id: user.id,
      };

      const token = jwt.sign(payload, process.env.DB_SECRET);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 900000),
      });
      return res.json({
        success: true,
        token,
      });
    }
  } catch (err) {
    return res.json({
      status: false,
      message: err,
    });
  }
};

// get user (post method)
// get a user info by user's id
exports.GetUser = async (req, res) => {
  IqUser.findOne({ _id: req.params.id })
    .then((user) => {
      return res.json({
        status: true,
        user: user,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: "cannot get user" + err,
      });
    });
};

// edit user information
exports.UploadImage = async (req, res) => {
  const imgFile = await cloudinary.uploader.upload(req.file.path);
  IqUser.findByIdAndUpdate(
    { _id: req.params.id },
    { avatar: imgFile.secure_url },
    { new: true }
  )
    .then((userimage) => {
      return res.json({
        status: true,
        data: userimage,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// edit profile
exports.EditUserProfile = (req, res) => {
  IqUser.findByIdAndUpdate(
    { _id: req.params.id },
    {
      username: req.body.username,
    },
    { new: true }
  )
    .then((updateduser) => {
      return res.json({
        status: true,
        data: updateduser,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// post reviews (post method)

// file uplaod  (post method)
const imageUpload = async (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      { folder: "apartmentImagesFolder" },
      (err, res) => {
        if (err) {
          console.log("err");
        } else {
          resolve({
            result: res.secure_url,
          });
        }
      }
    );
  });
};

// create a review by user id  (post method)
exports.PostReview = async (req, res) => {
  let reqFiles = [];

  const files = req.files;
  for (const file of files) {
    const { path } = file;
    const newPath = await imageUpload(path);
    reqFiles.push(newPath);
  }
  try {
    IqUserReview.create({
      location: req.body.location,
      housetype: req.body.housetype,
      landlordname: req.body.landlordname,
      landlordstateoforigin: req.body.landlordstateoforigin,
      landlordoccupation: req.body.landlordoccupation,
      NoOfOccupants: req.body.NoOfOccupants,
      electricityavailability: req.body.electricityavailability,
      wateravailability: req.body.wateravailability,
      areaType: req.body.areaType,
      distancetoroad: req.body.distancetoroad,
      reviewimageorvideo: reqFiles.map((reqfile) => reqfile.result),
    })
      .then((reviewdb) => {
        IqUser.findByIdAndUpdate(
          { _id: req.params.id },
          { $push: { review: reviewdb._id } },
          { new: true }
        )
          .then((post) => {
            res.json({
              status: true,
              data: post,
            });
          })
          .catch((err) => {
            return res.json({
              status: false,
              message: err,
            });
          });
      })
      .catch((err) => {
        return res.json({
          status: false,
          message: err,
        });
      });
  } catch (err) {
    return res.json({
      status: false,
      message: err,
    });
  }
};

// // fetch all reviews by a user
// // get review by user id  (post method)
exports.GetReviewsByUserId = (req, res) => {
  IqUser.findOne({
    _id: req.params.id,
  })
    .populate({ path: "review", options: { sort: { date: -1 } } })
    .then((userreview) => {
      return res.json({
        status: true,
        data: userreview.review,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// get review by review id
exports.GetReviewById = (req, res) => {
  IqUserReview.findOne({ _id: req.params.id })
    .then((review) => {
      return res.json({
        status: true,
        data: review,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// edit review by review id
exports.EditReviewById = (req, res) => {
  IqUserReview.findByIdAndUpdate(
    { _id: req.params.id },
    {
      location: req.body.location,
      housetype: req.body.housetype,
      landlordname: req.body.landlordname,
      landlordstateoforigin: req.body.landlordstateoforigin,
      landlordoccupation: req.body.landlordoccupation,
      NoOfOccupants: req.body.NoOfOccupants,
      electricityavailability: req.body.electricityavailability,
      wateravailability: req.body.wateravailability,
      areaType: req.body.areaType,
      distancetoroad: req.body.distancetoroad,
    },
    { new: true }
  )
    .then((updatedreview) => {
      return res.json({
        status: true,
        data: updatedreview,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// delete review by review id
exports.DeleteReviewById = async (req, res) => {
  IqUserReview.findOneAndDelete({ _id: req.params.id })
    .then(() => {
      return res.json({
        status: true,
        message: "post deleted",
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// // get all reviews and sort by recent
exports.GetAllReviews = async (req, res) => {
  IqUserReview.find()
    .populate({ path: "review", options: { sort: { date: 1 } } })
    .then((reviews) => {
      return res.json({
        status: true,
        data: reviews,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// // matk review as helpful (post method)
// exports.HelpulReviewMark = (req, res) => {
//   Review.findOne({ _id: req.params.id })
//     .then((count) => {
//       return res.json({
//         status: true,
//         count: count + 1,
//       });
//     })
//     .catch((err) => {
//       return res.json({
//         status: false,
//         message: err,
//       });
//     });
// };

// // get all users
// exports.GetUsers = (req, res) => {
//   IqUser.find()
//     .then((users) => {
//       return res.json({
//         status: true,
//         message: users,
//       });
//     })
//     .catch((err) => {
//       return res.json({
//         status: false,
//         message: err,
//       });
//     });
// };
