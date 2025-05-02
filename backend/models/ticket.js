const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  qrCode: {
    type: String,  // Store the QR code data as a string
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;