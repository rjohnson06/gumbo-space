const express = require("express");

const User = require("../models/user");
const router = express.Router();

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.post("/user", async(req, res) => {
  const user = new User();
  console.log("User " + req.body.name);
  user.name = req.body.name;

  user.save()
    .then(result => {
      res.send(user);
    })
    .catch(err => {
      res.send({ error: err });
    });
});

// TODO : when you delete a user, you've got to delete all their ressies right?
router.delete("/user/:id", async(req, res) => {
  User.deleteOne({ _id: req.params.id }, function (err, result) {
      if (err){
        res.send(err);
      } else {
        res.send(result);
      }
    });
});

module.exports = router;
