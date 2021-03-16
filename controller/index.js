const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { IqUser, Review } = require("../model");
const { cloudinary } = require("../config");

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
exports.GetIqUser = async (req, res) => {
  IqUser.findOne(req.params.id)
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

// post reviews (post method)

// file uplaod  (post method)
const fileUpload = async (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      { folder: "IqReviewFileFolder" },
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
exports.IqUserReview = async (req, res, file) => {
  // req.check("name", "you must put a name").notEmpty();

  // check for first error and signal error message
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.json({
      status: false,
      message: firstError,
    });
  }
  const id = req.params.id;
  let reqFiles = [];

  const files = req.files;
  for (const file of files) {
    const { path } = file;
    const newPath = await fileUpload(path);
    reqFiles.push(newPath);
  }

  try {
    Review.create({
      reviwavatarorvid: reqFiles.map((reqfile) => reqfile.result),
      landlordinfo: req.body.landlordinfo,
      locationofapartment: req.body.locationofapartment,
      amenitiesquality: req.body.amenitiesquality,
      marks: req.body.marks,
    })
      .then((reviewdb) => {
        IqUser.findByIdAndUpdate(
          { _id: id },
          { $push: { reviews: reviewdb._id } },
          { new: true }
        )
          .then((iquserpost) => {
            return res.send({
              status: true,
              message: "review posted" + "" + iquserpost,
            });
          })
          .catch((err) => {
            res.json({
              status: false,
              message: "review cannot be posted" + err,
            });
          });
      })
      .catch((err) => {
        res.json({
          status: false,
          message: err,
        });
      });
  } catch (err) {
    res.json({
      status: false,
      message: err,
    });
  }
};

// fetch all reviews by a user
// get review by user id  (post method)
exports.GetReviewByUserId = (req, res) => {
  IqUser.findOne({
    _id: req.params.id,
  })
    .populate({ path: "reviews", options: { sort: { date: -1 } } })
    .then((userreview) => {
      return res.json({
        status: true,
        data: userreview,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// get all reviews
//fetch user (get method)
exports.GetAllReviews = async (req, res) => {
  Review.find()
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

// matk review as helpful (post method)
exports.HelpulReviewMark = (req, res) => {
  Review.findOne({ _id: req.params.id })
    .then((count) => {
      return res.json({
        status: true,
        count: count + 1,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};

// get all users
exports.GetUsers = (req, res) => {
  IqUser.find()
    .then((users) => {
      return res.json({
        status: true,
        message: users,
      });
    })
    .catch((err) => {
      return res.json({
        status: false,
        message: err,
      });
    });
};
