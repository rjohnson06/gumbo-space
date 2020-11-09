const Desk = require("../models/desk");
const User = require("../models/user");
const { DateTime, Interval, Duration } = require("luxon");

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
      { owner: ownerId },
      { new: true }
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
      },
      { new: true }
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
      },
      { new: true }
    );
  }

  static async deleteReservation(deskId, resId) {
    return await Desk.updateOne(
      { _id: deskId },
      { $pull: { reservations: { _id: resId } } },
      { new: true }
    );
  }

  // weekly, monthly, every day, custom

  static async createReservationPattern(
    deskId,
    userId,
    daysOfWeekIndices,
    startTime,
    endTime,
    startDate,
    endDate) {
      return Desk.findById(deskId)
        .then((desk) => {

          var newPattern = desk.reservationPatterns.create({
            daysOfWeekIndices: daysOfWeekIndices,
            startDate: startDate,
            endDate: endDate
          });

          desk.reservationPatterns.push(newPattern);
          return Promise.all([desk.save(), Promise.resolve(newPattern._id)]);
        })
        .then(values => {
          const desk = values[0];
          const patternId = values[1];

          //console.log("Promise values " + JSON.stringify(values));

          startDate = DateTime.fromJSDate(startDate);
          endDate = DateTime.fromJSDate(endDate);
          startTime = DateTime.fromJSDate(startTime);
          endTime = DateTime.fromJSDate(endTime);

          /*
          console.log("startDate " + startDate.toString());
          console.log("endDate " + endDate.toString());
          console.log("startTime " + startTime.toString());
          console.log("endTime " + endTime.toString());
          */

          const patternIntervals = daysOfWeekIndices.map(dayOfWeek => {
            const startIntervalDate = startTime.set({weekday: dayOfWeek});
            const endIntervalDate = endTime.set({weekday: dayOfWeek});

            return Interval.fromDateTimes(
              startIntervalDate,
              endIntervalDate
            );
          });

          /*
          patternIntervals.forEach(interval => {
            console.log(interval.toString());
          });
          */

          let week = 0;
          const allPatternIntervals = [];
          let offsetDuration = Duration.fromObject({ days: week * 7 });

          // TODO : you're including start and end dates outside of the
          // desired start and end date, if they are in the same interval
          while(startDate.plus(offsetDuration) < endDate) {

            patternIntervals.forEach(patternInterval => {
              allPatternIntervals.push(
                patternInterval.set({
                  start: patternInterval.start.plus(offsetDuration),
                  end: patternInterval.end.plus(offsetDuration)
                })
              );
            });

            week++;
            offsetDuration = Duration.fromObject({ days: week * 7 });
          }

          /*
          console.log("all intervals : ");
          console.log("");

          allPatternIntervals.forEach(interval => {
            console.log(interval.toString());
          });
          */

          // existing conflicting reservations get deleted
          desk.reservations.toObject().forEach(res => {
            const interval = Interval.fromDateTimes(
                DateTime.fromJSDate(res.startDate),
                DateTime.fromJSDate(res.endDate)
            );

            let overlaps = false;

            allPatternIntervals.forEach(patternInterval => {
              if (patternInterval.overlaps(interval)) {
                overlaps = true;
              }
            });

            if (overlaps) {
              desk.reservations.pull({ _id: res._id });
            }
          });

          // create new reservations and concat
          const newReservations = allPatternIntervals.forEach(patternInterval => {
            const res = desk.reservations.create({
              startDate: patternInterval.start.toJSDate(),
              endDate: patternInterval.end.toJSDate(),
              userId: userId,
              patternId: patternId
            });

            desk.reservations.push(res);

            //console.log("Desk " + JSON.stringify(desk));
          });

          return desk.save();
        });
  }

  static async updateReservationPattern(
    deskId,
    userId,
    patternId,
    daysOfWeekIndices,
    startTime,
    endTime,
    startDate,
    endDate) {


  }
}

module.exports = DeskController;
