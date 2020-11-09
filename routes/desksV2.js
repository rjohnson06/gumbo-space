const express = require("express");
const Desk = require("../models/desk");
const User = require("../models/user");
const router = express.Router();
const DeskCtr = require('../controllers/desks.js');

// get all desks
router.get("/desks", async (req, res) => {
  DeskCtr
    .getDesks()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// get desk
router.get("/desk/:id", async (req, res) => {
  DeskCtr
    .getDesk(req.params.id)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// add a desk
router.post("/desk", async(req, res) => {
  DeskCtr
    .addDesk(req.body.owner)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log("error");
      res.send(err);
    });
});

// update a desk
router.put("/desk/:id", async(req, res) => {
  DeskCtr
    .updateDesk(req.params.id, req.body.owner)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// delete a desk
router.delete("/desk/:id", async(req, res) => {
  DeskCtr
    .deleteDesk(req.params.id)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

// add a desk reservation
router.post("/desk/:deskId/reservation", async(req, res) => {
  DeskCtr
    .addReservation(
      req.params.deskId,
      new Date(req.body.startDate),
      new Date(req.body.endDate),
      req.body.userId
    )
    .then((desk) => {
      res.send(desk);
    })
    .catch(err => {
      res.send(err);
    });
});

// update a reservation
router.put("/desk/:deskId/reservation/:resId", async(req, res) => {
  DeskCtr
    .updateReservation(
      req.params.deskId,
      req.params.resId,
      req.body.startDate,
      req.body.endDate,
      req.body.userId
    )
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
  DeskCtr
    .deleteReservation(req.params.deskId, req.params.resId)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
