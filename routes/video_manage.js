const express = require("express");
const router = express.Router();
const videoModel = require("../models/video");

// ADD VIDEO
router.post("/video-add", (req, res) => {
  var { name, url, difficulty_tag, description } = req.body;
  req.body.front_end === "on" ? (front_end = true) : (front_end = false);
  req.body.back_end === "on" ? (back_end = true) : (back_end = false);

  // replace watch?v= by embed for registered url
  if (url[24] === "w") {
    const realUrl = url.slice(32);
    url = "https://www.youtube.com/embed/" + `${realUrl}`;
  }

  const newVid = {
    name,
    url,
    difficulty_tag,
    description,
    front_end,
    back_end
  };
  console.log("new object :", newVid);

  videoModel
    .find({ url: newVid.url })
    .then(dbRes => {
      if (dbRes.length) {
        const msg = "Sorry, video already exists";
        res.render("video_add", { msg });
      } else {
        videoModel
          .create(newVid)
          .then(dbRes => {
            const msg = "Video added to the database";
            res.render("video_add", { msg });
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
});

// DELETE VIDEO
router.delete("/video-delete/:id", (req, res) => {
  console.log("YAY");
  console.log(req.params.id);
  videoModel
    .findByIdAndRemove(req.params.id)
    .then(dbRes => res.send(dbRes))
    .catch(err => console.log(err));
});

// EDIT VIDEO
router.get("/video-edit/:id", (req, res) => {
  console.log(req.params.id);
  videoModel
    .findById(req.params.id)
    .then(dbRes => {
      console.log(dbRes);
      res.render("video_edit", { video: dbRes });
    })
    .catch(err => console.log(err));
});

module.exports = router;
