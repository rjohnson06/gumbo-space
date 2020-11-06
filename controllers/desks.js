const Desk = require("../models/desk");
const User = require("../models/user");
const Reservation = require('../models/reservation');

class DeskController {
  static async getDesks() {
    return await Desk.find();
  }

  static async getDesk(id) {
    return await Desk.find({ _id: id });
  }

  static async addDesk(ownerId) {
    const desk = new Desk();
    desk.owner = ownerId;

    return await desk.save();
  }

  static async updateDesk(deskId, ownerId) {
    return await Desk.findOneAndUpdate(
      { _id: deskId },
      { owner: ownerId }
    );
  }

  static async deleteDesk(deskId) {
    return await Desk.deleteOne({ _id: deskId });
  }

  static async addReservation(deskId, startDate, endDate, userId) {
    return await Desk.updateOne(
      { _id: deskId },
      { $push:
          { reservations :
              { startDate: startDate, endDate: endDate, userId: userId }
          }
      }
    );
  }

  static async updateReservation(deskId, resId, startDate, endDate, userId) {
    return await Desk.findOneAndUpdate(
      {
        _id: deskId,
        "reservations._id": resId
      },
      {
        "reservations.$.startDate": startDate,
        "reservations.$.endDate": endDate,
        "reservations.$.userId": userId
      }
    );
  }

  static async deleteReservation(deskId, resId) {
    return await Desk.updateOne(
      { _id: deskId },
      { $pull: { reservations: { _id: resId } } }
    );
  }
}

module.exports = DeskController;
