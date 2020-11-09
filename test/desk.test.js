// tests/product.test.js

const assert = require("assert");
const mongoose = require('mongoose');
const { DateTime, Interval } = require("luxon");

const Desk = require("../models/desk");
const User = require("../models/user");
const deskCtr = require('../controllers/desks.js');
const userCtr = require('../controllers/users.js');

describe("Creating records", () => {
  it("saves a user", (done) => {
    const joe = new User({ name: "Bill" });

    joe.save()
      .then(() => {
        assert(!joe.isNew);
        done();
      });
  });
});

/*
var dt = DateTime.local();
dt.plus({hours: 3, minutes: 2});
dt.minus({days: 7});
dt.startOf('day');
dt.endOf('hour');
*/

describe("Luxon tests", () => {
  it("durations conflict", () => {
    const start = DateTime.local();
    const end = DateTime.local().plus({ hours: 3 });
    const interval1 = Interval.fromDateTimes(start, end);

    const start2 = DateTime.local().plus({ hours: 2 });
    const end2 = DateTime.local().plus({ hours: 4 });
    const interval2 = Interval.fromDateTimes(start2, end2);

    assert(interval1.overlaps(interval2));
  });

  it("durations do not conflict", () => {
    const start = DateTime.local();
    const end = DateTime.local().plus({ hours: 3 });
    const interval1 = Interval.fromDateTimes(start, end);

    const start2 = DateTime.local().plus({ hours: 4 });
    const end2 = DateTime.local().plus({ hours: 4 });
    const interval2 = Interval.fromDateTimes(start2, end2);

    assert(!interval1.overlaps(interval2));
  });
});

const dateAttributesMatch = (attrs, dateTime) => {
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== dateTime[key]) {
      return false;
    }
  }

  return true;
};

const basicDeskAndUserSetup = () => {
  const joe = new User({ name: "Bill" });
  let newUser;

  return joe.save()
    .then((user) => {
      newUser = user;
      return deskCtr.addDesk(user._id);
    })
    .then((desk) => {
      return Promise.all([Desk.find({ _id: desk._id }), Promise.resolve(newUser)]);
    });
}

describe("Pattern creation tests", () => {
  it("Creates the correct intervals, no existing reservations", (done) => {

    let newUser;

    basicDeskAndUserSetup()
      .then(values => {
        const desk = values[0];
        newUser = values[1];

        const startDate = DateTime.fromObject({
          month: 11,
          day: 9
        });
        const endDate = startDate.plus({ days: 14 });
        const daysOfWeekIndices = [0,1];
        const startTime = DateTime.fromObject({
          month: 11,
          day: 9,
          hour: 0
        });
        const endTime = startTime.plus({ hours: 4 });

        return deskCtr.createReservationPattern(
          desk[0]._id,
          newUser._id,
          daysOfWeekIndices,
          startTime.toJSDate(),
          endTime.toJSDate(),
          startDate.toJSDate(),
          endDate.toJSDate()
        );

      })
      .then((desk) => {

        const expectedResults = [
          {
            start: { month: 11, day: 8, hour: 0 },
            end: { month: 11, day: 8, hour: 4 }
          },
          {
            start: { month: 11, day: 9, hour: 0 },
            end: { month: 11, day: 9, hour: 4 }
          },
          {
            start: { month: 11, day: 15, hour: 0 },
            end: { month: 11, day: 15, hour: 4 }
          },
          {
            start: { month: 11, day: 16, hour: 0 },
            end: { month: 11, day: 16, hour: 4 }
          }
        ];

        const reservations = desk.reservations.toObject();

        const missingResults = expectedResults.filter(result => {
          for (const res of reservations) {
            if (dateAttributesMatch(result.start, DateTime.fromJSDate(res.startDate)) &&
                dateAttributesMatch(result.end, DateTime.fromJSDate(res.endDate))) {
                return false;
              }
          }

          return true;
        });

        assert(reservations.length === 4);
        assert(missingResults.length === 0);

        // this sucks, when the assert fails, we get a timeout, not the helpful
        // assert failed message
        done();
      })
      .catch(e => {
        console.log(e);
      });
  });

  it("Creates the correct intervals, 1 non-conflicting reservation", (done) => {

    let newUser;

    basicDeskAndUserSetup()
      .then(values => {
        const desk = values[0];
        newUser = values[1];

        return Promise.all([
          Promise.resolve(desk[0]),
          deskCtr.addReservation(
            desk[0]._id,
            DateTime.fromObject({
              month: 11,
              day: 9,
              hour: 6
            }).toJSDate(),
            DateTime.fromObject({
              month: 11,
              day: 9,
              hour: 8
            }).toJSDate(),
            newUser._id
          )
        ]);
      })
      .then(desk => {

        const startDate = DateTime.fromObject({
          month: 11,
          day: 9
        });
        const endDate = startDate.plus({ days: 14 });
        const daysOfWeekIndices = [0,1];
        const startTime = DateTime.fromObject({
          month: 11,
          day: 9,
          hour: 0
        });
        const endTime = startTime.plus({ hours: 4 });

        return deskCtr.createReservationPattern(
          desk[0]._id,
          newUser._id,
          daysOfWeekIndices,
          startTime.toJSDate(),
          endTime.toJSDate(),
          startDate.toJSDate(),
          endDate.toJSDate()
        );
      })
      .then((desk) => {

        const expectedResults = [
          {
            start: { month: 11, day: 8, hour: 0 },
            end: { month: 11, day: 8, hour: 4 }
          },
          {
            start: { month: 11, day: 9, hour: 0 },
            end: { month: 11, day: 9, hour: 4 }
          },
          {
            start: { month: 11, day: 15, hour: 0 },
            end: { month: 11, day: 15, hour: 4 }
          },
          {
            start: { month: 11, day: 16, hour: 0 },
            end: { month: 11, day: 16, hour: 4 }
          }
        ];

        const reservations = desk.reservations.toObject();

        const missingResults = expectedResults.filter(result => {
          for (const res of reservations) {
            if (dateAttributesMatch(result.start, DateTime.fromJSDate(res.startDate)) &&
                dateAttributesMatch(result.end, DateTime.fromJSDate(res.endDate))) {
                return false;
              }
          }

          return true;
        });

        assert(reservations.length === 5);
        assert(missingResults.length === 0);

        // this sucks, when the assert fails, we get a timeout, not the helpful
        // assert failed message
        done();
      })
      .catch(e => {
        console.log(e);
      });
  });

  it("Creates the correct intervals, 1 conflicting reservation", (done) => {

    let newUser;

    basicDeskAndUserSetup()
      .then(values => {
        const desk = values[0];
        newUser = values[1];

        return Promise.all([
          Promise.resolve(desk[0]),
          deskCtr.addReservation(
            desk[0]._id,
            DateTime.fromObject({
              month: 11,
              day: 9,
              hour: 1
            }).toJSDate(),
            DateTime.fromObject({
              month: 11,
              day: 9,
              hour: 3
            }).toJSDate(),
            newUser._id
          )
        ]);
      })
      .then(desk => {

        const startDate = DateTime.fromObject({
          month: 11,
          day: 9
        });
        const endDate = startDate.plus({ days: 14 });
        const daysOfWeekIndices = [0,1];
        const startTime = DateTime.fromObject({
          month: 11,
          day: 9,
          hour: 0
        });
        const endTime = startTime.plus({ hours: 4 });

        return deskCtr.createReservationPattern(
          desk[0]._id,
          newUser._id,
          daysOfWeekIndices,
          startTime.toJSDate(),
          endTime.toJSDate(),
          startDate.toJSDate(),
          endDate.toJSDate()
        );
      })
      .then((desk) => {

        const expectedResults = [
          {
            start: { month: 11, day: 8, hour: 0 },
            end: { month: 11, day: 8, hour: 4 }
          },
          {
            start: { month: 11, day: 9, hour: 0 },
            end: { month: 11, day: 9, hour: 4 }
          },
          {
            start: { month: 11, day: 15, hour: 0 },
            end: { month: 11, day: 15, hour: 4 }
          },
          {
            start: { month: 11, day: 16, hour: 0 },
            end: { month: 11, day: 16, hour: 4 }
          }
        ];

        const reservations = desk.reservations.toObject();

        const missingResults = expectedResults.filter(result => {
          for (const res of reservations) {
            if (dateAttributesMatch(result.start, DateTime.fromJSDate(res.startDate)) &&
                dateAttributesMatch(result.end, DateTime.fromJSDate(res.endDate))) {
                return false;
              }
          }

          return true;
        });

        assert(reservations.length === 4);
        assert(missingResults.length === 0);

        // this sucks, when the assert fails, we get a timeout, not the helpful
        // assert failed message
        done();
      })
      .catch(e => {
        console.log(e);
      });
  });
});

/*
describe('desk ', () => {
    it('can be created correctly', async () => {
        expect(async () => {
          const user = new User();
          user.name = "TestUser";
          await user.save();
          return await deskCtr.addDesk(user._id);
        })
        .not
        .toThrow();
    });
});

describe('reservation ', () => {

  let user;
  let desk;

  beforeEach((done), () => {
    user = new User();
    user.name = "TestUser";
    user.save()
      .then(() => {
        return deskCtr.addDesk(user._id);
      })
      .then(result => {
        desk = result;
        done();
      });
  });

  it('can be created successfully', async () => {
    expect(async () => {

      const users = User.find();
      console.log("users " + JSON.stringify(users));
    })
    .not
    .toThrow();
  });

  it('can be deleted successfully', () => {
  });
});
*/
