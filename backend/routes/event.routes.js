const express = require('express');
const eventRouter = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const Event = require('../models/event');
const authMiddleware = require('../middleware/auth');

// Search events by keywords or category
eventRouter.get('/search', async (req, res) => {
  try {
    console.log('Search params:', req.query); // Log what's being searched
    
    const { query, category } = req.query;
    let searchQuery = {};

    // If we have a text query, search in title and description
    if (query) {
      searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { venue: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } }
        ]
      };
    }

    // If category is specified, add it to the search query
    if (category && category !== 'all') {
      searchQuery.category = category;
    }

    console.log('MongoDB query:', searchQuery); // Log the constructed query
    
    const events = await Event.find(searchQuery);
    console.log(`Found ${events.length} events`); // Log results count
    
    res.status(200).json(events);
  } catch (err) {
    console.error('Search error details:', err); // Log the full error, not just message
    res.status(500).json({ error: 'Search failed. Please try again later.' });
  }
});

eventRouter.get("/all", async(req,res) => {
    try{
     const allEvent = await Event.find()
     //console.log(allEvent)
     res.status(200).send(allEvent)

    }
    catch(err){
        console.error(err.message)
    }
})


// Fetch a single event by ID
eventRouter.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err.message);
    res.status(500).json({ error: 'Failed to fetch event. Please try again later.' });
  }
});

// === New: fetch events by category path ===
eventRouter.get('/:categoryName', authMiddleware, async (req, res) => {
  const { categoryName } = req.params;
  console.log('Searching for category:', categoryName);
  try {
    // Log what we're searching for
    console.log('Query:', { category: categoryName });
    
    const events = await Event.find({ category: categoryName });
    console.log(`Found ${events.length} events`);
    
    if (events.length === 0) {
      return res.status(404).json({ error: `No events found in category '${categoryName}'.` });
    }
    res.status(200).json({ events });
  } catch (err) {
    console.error('Error fetching events by category:', err);  // Log the full error
    res.status(500).json({ error: 'Failed to fetch events. Please try again later.' });
  }

});


// Event retrieval endpoint
eventRouter.get('/', authMiddleware, async (req, res) => {
  try {
      const userEvents = await Event.find({ organizer: req.userId });
      res.status(200).json({ userEvents });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Event retrieval failed. Please try again later.' });
  }
});


  
  // Configure storage for uploaded files
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'images') cb(null, 'uploads/images');
      else if (file.fieldname === 'video') cb(null, 'uploads/videos');
      else cb(null, 'uploads/others');
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
  });
  const upload = multer({ storage });
  
  // Create event with media uploads and QR code generation
  eventRouter.post(
    '/create',
    authMiddleware,
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'video', maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { title, description, date, time, venue, address, category, price, totalTickets } = req.body;
        // Combine date and time into a single Date
        const dateTime = new Date(`${date}T${time}`);
  
        const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const video = req.files['video'] ? req.files['video'][0].path : null;
  
        // Create and save the event
        const newEvent = new Event({
          title,
          description,
          date: dateTime,
          venue,
          address,
          category,
          price: parseFloat(price),
          totalTickets: parseInt(totalTickets, 10),
          organizer: req.userId,
          images,
          video,
        });
        await newEvent.save();
  
  
        res.status(201).json({
          message: 'Event created successfully.',
          eventId: newEvent._id,

        });
      } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Event creation failed. Please try again later.' });
      }
    }
  );
  


// === UPDATED: Event Update endpoint ===
eventRouter.put('/:id', authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const {
    title,
    description,
    date,
    venue,
    address,
    category,
    price,
    totalTickets
  } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to update this event.' });
    }

    // Only overwrite fields that were sent
    if (title !== undefined)       event.title       = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined)        event.date        = new Date(date);
    if (venue !== undefined)       event.venue       = venue;
    if (address !== undefined)     event.address     = address;
    if (category !== undefined)    event.category    = category;
    if (price !== undefined)       event.price       = parseFloat(price);
    if (totalTickets !== undefined) event.totalTickets = parseInt(totalTickets, 10);

    await event.save();

    // Front-end expects { event }
    res.status(200).json({ event });
  } catch (err) {
    console.error('Event update failed:', err);
    res.status(500).json({ error: 'Event update failed. Please try again later.' });
  }
});

eventRouter.delete('/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const deleteEvent = await Event.findByIdAndDelete(id);
        if (!deleteEvent) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Event deletion failed. Please try again later.' });
    }
});




  // Add this to your eventRouter.js file



module.exports = eventRouter;