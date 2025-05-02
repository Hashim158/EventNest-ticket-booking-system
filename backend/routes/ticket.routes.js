const express = require('express');
const ticketRouter = express.Router();
const Ticket = require('../models/ticket');
const Event = require('../models/event');
const authMiddleware = require('../middleware/auth');
const QRCode = require('qrcode');
const crypto = require('crypto');


// Update the POST ticket route to check for payment
ticketRouter.post('/', authMiddleware, async (req, res) => {
    const { eventId, quantity = 1, paymentComplete = false } = req.body;
    
    // If direct ticket creation without payment verification (only for testing)
    if (!paymentComplete) {
        return res.status(403).json({ error: 'Payment required to book tickets' });
    }
    
    try {
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        
        // Generate a unique ticket ID with event and user info
        const ticketUniqueId = crypto.randomUUID();
        const ticketData = {
            ticketId: ticketUniqueId,
            eventId: eventId,
            userId: req.userId,
            timestamp: Date.now()
        };
        
        // Convert to JSON string for QR code
        const ticketDataString = JSON.stringify(ticketData);
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(ticketDataString);
        
        // Create a new ticket associated with the logged-in user and the event
        const newTicket = new Ticket({
            user: req.userId,
            event: eventId,
            qrCode: qrCodeDataURL,
            quantity: quantity
        });

        await newTicket.save();
        
        // Update event's available tickets (optional)
        await Event.findByIdAndUpdate(eventId, {
            $inc: { totalTickets: -quantity }
        });
        
        res.status(201).json({ 
            message: 'Ticket booked successfully.', 
            ticket: newTicket 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ticket booking failed. Please try again later.' });
    }
});

// Create Ticket endpoint
/*ticketRouter.post('/', authMiddleware, async (req, res) => {
    const { eventId, quantity = 1 } = req.body;
    try {
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        
        // Generate a unique ticket ID with event and user info
        const ticketUniqueId = crypto.randomUUID();
        const ticketData = {
            ticketId: ticketUniqueId,
            eventId: eventId,
            userId: req.userId,
            timestamp: Date.now()
        };
        
        // Convert to JSON string for QR code
        const ticketDataString = JSON.stringify(ticketData);
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(ticketDataString);
        
        // Create a new ticket associated with the logged-in user and the event
        const newTicket = new Ticket({
            user: req.userId,
            event: eventId,
            qrCode: qrCodeDataURL,
            quantity: quantity
        });

        await newTicket.save();
        
        // Update event's available tickets (optional)
        await Event.findByIdAndUpdate(eventId, {
            $inc: { totalTickets: -quantity }
        });
        
        res.status(201).json({ 
            message: 'Ticket booked successfully.', 
            ticket: newTicket 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ticket booking failed. Please try again later.' });
    }
}); */

// Rest of your routes...


ticketRouter.get('/user', authMiddleware, async (req, res) => {
    try {
        // Retrieve tickets associated with the logged-in user
        const userTickets = await Ticket.find({ user: req.userId }).populate('event');
        res.status(200).json({ userTickets });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ticket retrieval failed. Please try again later.' });
    }
});



ticketRouter.delete('/:ticketId', authMiddleware, async (req, res) => {
    const ticketId = req.params.ticketId;
    try {
        // Find the ticket first (don't delete yet)
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }
        
        // Get the event ID and quantity before deleting
        const eventId = ticket.event;
        const quantity = ticket.quantity || 1;
        
        // Delete the ticket
        await Ticket.findByIdAndDelete(ticketId);
        
        // Update event's available tickets - add the tickets back
        await Event.findByIdAndUpdate(eventId, {
            $inc: { totalTickets: quantity }
        });

        res.status(200).json({ message: 'Ticket canceled successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ticket cancellation failed. Please try again later.' });
    }
});


// Add this new endpoint to your ticketRouter.js file

// Fetch tickets by event ID (for admin panel)
ticketRouter.get('/event/:eventId', authMiddleware, async (req, res) => {
    const { eventId } = req.params;
    
    try {
        // First check if this user is the organizer of the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        
        // Security check: Only allow the organizer to see ticket data
        if (event.organizer.toString() !== req.userId) {
            return res.status(403).json({ 
                error: 'Access denied. You must be the event organizer to view ticket data.' 
            });
        }
        
        // Fetch all tickets for this event
        const tickets = await Ticket.find({ event: eventId })
            .sort({ createdAt: -1 })  // Most recent first
            .populate('user', 'username email');  // Add user details if needed
            
        // Calculate total sales amount
        const totalSales = tickets.reduce((sum, ticket) => {
            return sum + (event.price * (ticket.quantity || 1));
        }, 0);
        
        // Calculate total number of attendees (sum of all ticket quantities)
        const totalAttendees = tickets.reduce((sum, ticket) => {
            return sum + (ticket.quantity || 1);
        }, 0);
        
        res.status(200).json({ 
            tickets,
            stats: {
                totalSales,
                totalAttendees,
                ticketCount: tickets.length
            }
        });
    } catch (err) {
        console.error('Error fetching tickets by event:', err);
        res.status(500).json({ error: 'Failed to retrieve ticket data. Please try again later.' });
    }
});


module.exports = ticketRouter;
