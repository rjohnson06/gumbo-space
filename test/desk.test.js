// tests/product.test.js

const assert = require("assert");
const mongoose = require('mongoose');
const { DateTime } = require("luxon");

const Desk = require("../models/desk");
const User = require("../models/user");
const Reservation = require('../models/reservation');
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
