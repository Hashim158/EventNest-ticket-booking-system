// src/models/Favourite.js
const mongoose = require('mongoose');

const favouritesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',      // Reference to the User model
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',     // Reference to the Event model
    required: true,
  },
}, {
  timestamps: true,   // optional: track createdAt/updatedAt
});

// Note: model name must be 'Favourite', not 'Ticket'
const Favourite = mongoose.model('Favourite', favouritesSchema);

module.exports = Favourite;
