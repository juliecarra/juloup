//require modules
const express = require("express");
const passport = require("passport");
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const upload = require("../config/cloudinary");
const User = require("../models/user");
const videoModel = require("../models/video");
const courseModel = require("../models/course");

//auth with passport middleware

//ensure that we are logged out so we can logged in
router.get("/login", ensureLoggedOut(), (req, res) => {
  res.render("auth/login", { message: req.flash("error") });
});

//when we manage to logged in, we are redirected to the home page, if not, the user is still in the login page
router.post(
  "/login",
  ensureLoggedOut(),
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true //display a message in case of failure to logged in
  })
);

// router.patch("/profile/:id", (req, res) => {
//   console.log("je passe par ici");
//   console.log(req.params.id);
//   console.log(req.body);
//   console.log(req.user);
// });

//ensure that we are logged out so we can signup
router.get("/signup", ensureLoggedOut(), (req, res) => {
  res.render("auth/signup", { message: req.flash("error") });
});

//if we manage to sign up, we are redirected to the home page, if not, the user is still in the sign up page
router.post(
  "/signup",
  ensureLoggedOut(),
  passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

function findUserVideos(array) {
  return videoModel
    .find({ _id: array })
    .then(dbRes => dbRes)
    .catch(err => console.log(err));
}
function findAllVideos() {
  return videoModel
    .find()
    .then(dbRes => dbRes)
    .catch(err => console.log(err));
}

//ensure that we are logged in with our account, if it's the case, we can have access to the profile page
router.get("/profile", ensureLoggedIn("/login"), (req, res) => {
  const userViewedVideos = findUserVideos(req.user.viewed_videos);
  const allVideos = findAllVideos();
  Promise.all([userViewedVideos, allVideos])
    .then(values => {
      console.log("User Viewed Videos", values[0]);
      const viewed = values[0];
      const allVideos = values[1];
      for (let i = 0; i < viewed.length; i++) {
        for (let j = allVideos.length - 1; j >= 0; j--) {
          if (allVideos[j]._id.equals(viewed[i]._id)) {
            allVideos.splice(j, 1);
            console.log(allVideos.length);
          }
        }
      }
      res.render("profile", {
        viewedVideos: viewed,
        notViewedVideos: allVideos
      });
    })
    .catch(err => console.log(err));
});

//if we don't upload a profil picture and we click on "save", we have a message that appear "photo field is empty"
//if we upload a profile picture and click on save we are redirected to the profile page
router.post("/upload", upload.single("profilePhoto"), (req, res) => {
  console.log(req.body);
  console.log(req.file);

  if (req.file !== undefined) {
    User.findByIdAndUpdate(req.user._id, {
      $set: { profilePhoto: req.file.url }
    }).then(() => {
      res.redirect("/profile");
    });
  } else {
    res.render("profile", { message: "Photo field is empty!" });
  }
});

//ensure to be logged in in order to logged out
//when we logged out, we are redirected to the home page
router.get("/logout", ensureLoggedIn("/login"), (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
