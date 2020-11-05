const express = require("express");
const Desk = require("../models/desk");
const User = require("../models/user");
const Reservation = require('../models/reservation');
const router = express.Router();

// get all desks
router.get("/desks", async (req, res) => {
  const desks = await Desk.find();
  res.send(desks);
});

// get desk
router.get("/desk/:id", async (req, res) => {
  Desk
    .find({ _id: req.params.id })
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// add a desk
router.post("/desk", async(req, res) => {
  const desk = new Desk();
  desk.owner = req.body.owner;

  // testing remove
  desk.reservations = [{
    startDate: new Date(),
    endDate: new Date(),
    userId: req.body.owner
   }];
   // testing remove

  desk.save()
    .then(result => {
      res.send(desk);
    })
    .catch(err => {
      res.send({ error: err });
    });
});

router.put("/desk/:id", async(req, res) => {
  Desk.findOneAndUpdate(
    {
      _id: req.params.deskId
    },
    {
      owner: req.body.owner
    })
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// delete a desk
router.delete("/desk/:id", async(req, res) => {
  Desk.deleteOne({ _id: req.params.id }, function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

// add a desk reservation
router.post("/desk/:deskId/reservation", async(req, res) => {
  Desk.findOne({ _id: req.params.deskId })
      .then((desk) => {
        desk.reservations.push({
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          userId: req.body.userId
        });

        return desk.save();
      })
      .then((desk) => {
        res.send(desk);
      })
      .catch(err => {
        res.send(err);
      });
});

// update a reservation
router.put("/desk/:deskId/reservation/:resId", async(req, res) => {
  Desk.findOneAndUpdate(
    {
      _id: req.params.deskId,
      "reservations._id": req.params.resId
    },
    {
      "reservations.$.startDate": req.body.startDate,
      "reservations.$.endDate": req.body.endDate,
      "reservations.$.userId": req.body.userId
    })
    .then(result => {
      // Weirdly, this shows the desk data prior to the update
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// delete a reservation
router.delete("/desk/:deskId/reservation/:resId", async(req, res) => {
  Desk.updateOne(
    { _id: req.params.deskId },
    { $pull: { reservations: { _id: req.params.resId } } })
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
