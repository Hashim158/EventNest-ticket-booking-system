// index.js
const express = require('express');
const path    = require('path');
const app     = express();
require('dotenv').config();
console.log("MONGO URL:", process.env.mongoURL);
const cors            = require('cors');
const userRouter      = require('./routes/user.routes');
const eventRouter     = require('./routes/event.routes');
const ticketRouter    = require('./routes/ticket.routes');

const favouritesRouter = require('./routes/favourites.routes');  // ← add this
const connection      = require('./config/db');
const paymentRouter = require('./routes/payement.router');

app.use('/payment/webhook', express.raw({ type: 'application/json' }));


app.use(express.json());
app.use(cors());

// ★ Serve anything in backend/uploads under /uploads/**
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// root
app.get('/', (req, res) => {
  res.json('Welcome to the ticket booking app');
});

// your routes
app.use('/user',       userRouter);
app.use('/event',      eventRouter);
app.use('/ticket',     ticketRouter);
app.use('/favourites', favouritesRouter);  // ← and mount here
app.use('/payment', paymentRouter);
app.use('/api/payment', paymentRouter);




// make sure your .env has PORT (uppercase) or fallback
const PORT = process.env.PORT || process.env.port || 9090;

app.listen(PORT, async () => {
  try {
    await connection;
    console.log('✅ Connected to the db');
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
  }
  console.log(`🚀 Server is running at port ${PORT}`);
});
