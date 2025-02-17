const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: { type: mongoose.ObjectId },
  name: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
