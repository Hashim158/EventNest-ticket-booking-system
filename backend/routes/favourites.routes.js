// src/routes/favourites.js
const express = require('express');
const Favourite = require('../models/favourites');
const Event     = require('../models/event');
const authMiddleware = require('../middleware/auth');

const favouritesRouter = express.Router();

/**
 * POST /favourites
 * Body: { eventId }
 * Adds the event to the logged-in user’s favourites (if not already favourited).
 */
favouritesRouter.post('/', authMiddleware, async (req, res) => {
  const { eventId } = req.body;
  try {
    // 1) Check event exists
    const ev = await Event.findById(eventId);
    if (!ev) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // 2) Prevent duplicates
    const exists = await Favourite.findOne({
      user:  req.userId,
      event: eventId,
    });
    if (exists) {
      return res
        .status(200)
        .json({ message: 'Already in favourites.', favourite: exists });
    }

    // 3) Create new favourite
    const fav = new Favourite({
      user:  req.userId,
      event: eventId,
    });
    await fav.save();

    res
      .status(201)
      .json({ message: 'Added to favourites.', favourite: fav });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Could not add to favourites. Try again later.' });
  }
});

/**
 * GET /favourites/user
 * Returns the logged-in user’s favourites, with populated event data.
 */
favouritesRouter.get('/user', authMiddleware, async (req, res) => {
  try {
    const userFavourites = await Favourite
      .find({ user: req.userId })
      .populate('event');
    res.status(200).json({ favourites: userFavourites });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to retrieve favourites.' });
  }
});

/**
 * DELETE /favourites/:favouriteId
 * Remove a favourite by its ID (only if owned by the user).
 */
favouritesRouter.delete('/:favouriteId', authMiddleware, async (req, res) => {
  const { favouriteId } = req.params;
  try {
    const fav = await Favourite.findById(favouriteId);
    if (!fav) {
      return res.status(404).json({ error: 'Favourite not found.' });
    }
    if (fav.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: 'Not authorized to remove this favourite.' });
    }
    await fav.deleteOne();
    res.status(200).json({ message: 'Favourite removed.' });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to remove favourite.' });
  }
});

module.exports = favouritesRouter;
