const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,          // assume usernames must be unique
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  // new profile fields
  cnic: {
    type: String,
    default: "",
  },
  number: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,        // adds createdAt / updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = User;
