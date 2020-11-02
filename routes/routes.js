const express = require("express");
const Desk = require("../models/desk");
const User = require("../models/user");
const Reservation = require('../models/reservation');
const router = express.Router();

router.get("/desks", async (req, res) => {
  const desks = await Desk.find();
  res.send(desks);
});

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

router.delete("/user/:id", async(req, res) => {
  User.deleteOne({ _id: req.params.id }, function (err, result) {
      if (err){
        res.send(err);
      } else {
        res.send(result);
      }
    });
});

router.post("/desk", async(req, res) => {
  const desk = new Desk();
  desk.owner = req.body.owner;

  desk.save()
    .then(result => {
      res.send(desk);
    })
    .catch(err => {
      res.send({ error: err });
    });
});

router.delete("/desk/:id", async(req, res) => {
  Desk.deleteOne({ _id: req.params.id }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

router.post("/desk/:deskId/reservation", async(req, res) => {
  const desk = Desk.findOne({ _id: req.params.deskId });

  desk.reservations.push({
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    userId: req.body.userId
  });
});

module.exports = router;
