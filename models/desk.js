const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReservationPatternSchema = new Schema({
  id: { type: mongoose.ObjectId }
});

const ReservationSchema = new Schema({
  id: { type: mongoose.ObjectId },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  userId: { type: mongoose.ObjectId, required: true, ref: "User" },
  patternId: { type: mongoose.ObjectId, ref: "ReservationPattern" }
});

const DeskSchema = new Schema({
  id: { type: mongoose.ObjectId },
  owner: { type: mongoose.ObjectId, ref: "User", required: true },
  reservations: {
    type: [ReservationSchema],
    validate: {
      validator: () => Promise.resolve(false),
      message: 'Email validation failed'
    }
  },
  reservationPatterns: [ReservationPatternSchema]
});

module.exports = mongoose.model('Desk', DeskSchema);
