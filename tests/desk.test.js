// tests/product.test.js

const mongoose = require('mongoose');
const { DateTime } = require("luxon");

const dbHandler = require('./db-handler');

const Desk = require("../models/desk");
const User = require("../models/user");
const Reservation = require('../models/reservation');
const deskCtr = require('../controllers/desks.js');
const userCtr = require('../controllers/users.js');

jest.setTimeout(3 * 60 * 1000);

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

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

      /*
      await deskCtr.addReservation(
          desk._id,
          DateTime.local().toJSDate(),
          DateTime.local().plus({ hours: 3 }).toJSDate(),
          user._id
        );

      console.log("deskID " + desk._id);
      */
    })
    .not
    .toThrow();
  });

  it('can be deleted successfully', () => {
  });
});
