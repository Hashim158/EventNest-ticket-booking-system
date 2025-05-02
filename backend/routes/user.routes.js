const express = require('express');
const userRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

// Health-check
userRouter.get('/', (req, res) => {
  res.json('Welcome to the user router');
});

// Register
userRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userPresent = await User.findOne({ email });
    if (userPresent) {
      return res.status(400).json({ error: 'User already registered, please login instead.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.token,
      { expiresIn: '24h' }
    );

    // strip password before sending user object
    const { password: _, ...userData } = newUser.toObject();
    res.status(201).json({ message: 'User registered successfully.', token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

// Login
userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userPresent = await User.findOne({ email });
    if (!userPresent) {
      return res.status(401).json({ error: 'User is not registered. Please register first.' });
    }
    const isPasswordValid = await bcrypt.compare(password, userPresent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please enter the correct password.' });
    }

    const token = jwt.sign(
      { userId: userPresent._id },
      process.env.token,
      { expiresIn: '24h' }
    );
    res.status(200).json({ token, message: 'User logged in successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// Fetch profile (protected)
userRouter.get("/:id", authMiddleware, async (req, res) => {
  const requesterId = req.userId;          // set by authMiddleware
  const { id } = req.params;

  if (requesterId !== id) {
    return res.status(403).json({ error: 'Forbidden: cannot view another user’s profile.' });
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// ── NEW: Public organizer lookup ──
// Note: we still require a valid token here; drop authMiddleware if you want
// fully public access.
userRouter.get(
    '/organizer/:id',
    authMiddleware,
    async (req, res) => {
      try {
        const user = await User
          .findById(req.params.id)
          .select('-password -cnic -number -gender -address'); 
        if (!user) {
          return res.status(404).json({ error: 'Organizer not found.' });
        }
        // send back only the fields you consider “public”
        res.status(200).json({
          username: user.username,
          email:    user.email,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching organizer details.' });
      }
    }
  );

// Update profile (protected)
userRouter.put('/:id', authMiddleware, async (req, res) => {
  const requesterId = req.userId;
  const { id } = req.params;

  if (requesterId !== id) {
    return res.status(403).json({ error: 'Forbidden: cannot update another user’s profile.' });
  }

  const {
    username,
    email,
    cnic,
    number,
    gender,
    address
  } = req.body;

  try {
    // atomic update
    const updated = await User.findByIdAndUpdate(
      id,
      {
        // only overwrite if provided
        ...(username  !== undefined && { username }),
        ...(email     !== undefined && { email }),
        ...(cnic      !== undefined && { cnic }),
        ...(number    !== undefined && { number }),
        ...(gender    !== undefined && { gender }),
        ...(address   !== undefined && { address })
      },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully.', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'User update failed. Please try again later.' });
  }
});

module.exports = userRouter;
