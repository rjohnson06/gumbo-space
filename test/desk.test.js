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
})

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
