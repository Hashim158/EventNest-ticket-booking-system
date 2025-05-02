# EventNest - Modern Event Ticket Booking System

![EventNest Logo](https://github.com/Hashim158/EventNest-ticket-booking-system/raw/main/client/public/logo.png)

## Overview

EventNest is a comprehensive event ticket booking platform designed to streamline the process of discovering, booking, and managing events. With a modern and intuitive user interface, EventNest aims to provide a seamless experience for both event organizers and attendees.

## Features

- **User Authentication**: Secure registration and login system
- **Event Discovery**: Browse and search for events by category, date, and location
- **Ticket Booking**: Simple and secure ticket purchase process
- **QR Code Tickets**: Digital tickets with QR codes for easy verification
- **User Dashboard**: Manage bookings, favorites, and profile information
- **Organizer Tools**: Create, manage, and track events and ticket sales
- **Payment Integration**: Secure payment processing for ticket purchases
- **Responsive Design**: Fully responsive interface for all devices

## Technologies Used

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Stripe for payment processing

## Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hashim158/EventNest-ticket-booking-system.git
   cd EventNest-ticket-booking-system
   ```

2. **Install server dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**
   - Create a `.env` file in the server directory
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the server**
   ```bash
   cd ../backend
   npm start
   ```

6. **Start the client**
   ```bash
   cd ../frontend
   npm run dev
   ```

7. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```


## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user information

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event (organizer only)
- `PUT /api/events/:id` - Update an event (organizer only)
- `DELETE /api/events/:id` - Delete an event (organizer only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel a booking

## Contribution Guidelines

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- GitHub: [Hashim158](https://github.com/Hashim158)
- Email: hashim.siddque2002@gmail.com

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
