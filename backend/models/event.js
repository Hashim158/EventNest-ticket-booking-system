/* models/event.js */
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, enum: ['conference','seminar','workshop','concert','festival','exhibition','sport','networking','other'], required: true },
  price: { type: Number, required: true },
  totalTickets: { type: Number, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }], // file paths or URLs
  video: { type: String }   // file path or URL
  
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;