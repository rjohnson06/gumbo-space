const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
state = {
  selectedDeskId: 1,
  showBooker: true,
  viewDate: new Date(),

  users: [
    {name: "Sam", userId: 1},
    {name: "Ryan", userId: 2}
  ],
  desks: [
    {id: 1, location: null, type: null},
    {id: 2, location: null, type: null}
  ],
  deskOwners: [
    {userId: 1, deskId: 1},
    {userId: 2, deskId: 2}
  ],
  reservedTimes: [
    {id: 1, startDate: this.addHoursToDate(new Date(), -4), endDate: this.addHoursToDate(new Date(), 4), userId: 1, deskId: 1},
    {id: 2, startDate: new Date(), endDate: new Date(), userId: 2, deskId: 2}
  ]
};
*/

// shouldn't this just be inside the desk object
const UserSchema = new Schema({
  id: { type: mongoose.ObjectId },
  name: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
