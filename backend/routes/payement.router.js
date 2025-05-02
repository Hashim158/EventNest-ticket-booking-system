// Install stripe first: npm install stripe
const stripe = require('stripe')('sk_test_51RIv8JR25ed8XEqL14EnaLRjEgyRsh2c1SeAAC2dtVrKFfeDv1HNYtUrwLA3HkbsnbVPWs0C6F2PZkHvN5S3V5UL00HeJhHgA7');
const express = require('express');
const paymentRouter = express.Router();
const authMiddleware = require('../middleware/auth');

// Create a payment intent
paymentRouter.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { eventId, quantity, eventTitle, price } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: eventTitle,
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}&quantity=${quantity}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/event-details/${eventId}`,      
      metadata: {
        eventId,
        userId: req.userId,
        quantity
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

// Webhook to handle successful payments
paymentRouter.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      'whsec_3e63a263d20b87398db92737466f99591c0163909f4648fbb20942c07f5044e1' // Replace with your webhook secret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Create ticket after successful payment
    await createTicketAfterPayment(session);
  }

  res.status(200).json({received: true});
});

// Helper function to create ticket after payment
async function createTicketAfterPayment(session) {
  const { eventId, userId, quantity } = session.metadata;
  
  try {
    // Generate QR code
    const ticketUniqueId = require('crypto').randomUUID();
    const ticketData = {
      ticketId: ticketUniqueId,
      eventId,
      userId,
      timestamp: Date.now()
    };
    
    const ticketDataString = JSON.stringify(ticketData);
    const QRCode = require('qrcode');
    const qrCodeDataURL = await QRCode.toDataURL(ticketDataString);
    
    // Create ticket
    const Ticket = require('../models/ticket');
    const newTicket = new Ticket({
      user: userId,
      event: eventId,
      qrCode: qrCodeDataURL,
      quantity: parseInt(quantity, 10)
    });

    await newTicket.save();
    
    // Update event tickets
    const Event = require('../models/event');
    await Event.findByIdAndUpdate(eventId, {
      $inc: { totalTickets: -parseInt(quantity, 10) }
    });
    
  } catch (error) {
    console.error('Error creating ticket after payment:', error);
  }
}

module.exports = paymentRouter;