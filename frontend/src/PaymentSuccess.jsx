import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);

  const sessionId = searchParams.get('session_id');
  const eventId = searchParams.get('eventId');
  const quantity = searchParams.get('quantity');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Verify the payment by checking if a ticket exists
    const verifyPayment = async () => {
      if (!sessionId || !eventId || !quantity || !token) {
        setError('Missing required payment information');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:9090/ticket/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Could not verify payment');
        }

        const { userTickets } = await response.json();
        // Simplest check: does a ticket for this event exist?
        const matchingTicket = userTickets.find(
          (ticket) => ticket.event._id === eventId
        );

        if (matchingTicket) {
          setTicketInfo(matchingTicket);
        } else {
          setError(
            'Ticket processing in progress. Please check My Tickets in a few moments.'
          );
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('An error occurred while verifying your payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, eventId, quantity, token]);

  // Auto-redirect to tickets page after 5 seconds
  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        navigate('/my-tickets');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, error, navigate]);

  // Animated background circles
  const circles = [
    { size: 'h-64 w-64', color: 'bg-green-100', top: '-top-20', left: '-left-20', delay: 0 },
    { size: 'h-32 w-32', color: 'bg-blue-100', top: 'top-40', right: '-right-10', delay: 0.2 },
    { size: 'h-48 w-48', color: 'bg-purple-100', bottom: '-bottom-20', right: '20%', delay: 0.4 },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4" />
          <div className="animate-pulse absolute inset-0 rounded-full h-16 w-16 border-2 border-green-300 opacity-75" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Verifying your payment...</h2>
        <p className="text-gray-500 mt-2">This will just take a moment</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="relative bg-white p-8 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
          {circles.map((circle, index) => (
            <motion.div
              key={index}
              className={`absolute rounded-full ${circle.size} ${circle.color} opacity-50`}
              style={{ [circle.top]: 0, [circle.left]: 0, [circle.right]: 0, [circle.bottom]: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ delay: circle.delay, duration: 0.8 }}
            />
          ))}
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Payment Verification Issue
            </h2>
            
            <p className="text-gray-600 mb-8 text-center leading-relaxed">
              {error}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                to={`/event-details/${eventId}`}
                className="px-4 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Return to Event
              </Link>
              <Link
                to="/my-tickets"
                className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                View My Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format event date
  const eventDate = ticketInfo?.event?.date
    ? new Date(ticketInfo.event.date)
    : null;

  const formattedDate = eventDate
    ? eventDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Processing...';

  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Success state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white p-8 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        {circles.map((circle, index) => (
          <motion.div
            key={index}
            className={`absolute rounded-full ${circle.size} ${circle.color} opacity-50`}
            style={{ [circle.top]: 0, [circle.left]: 0, [circle.right]: 0, [circle.bottom]: 0 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ delay: circle.delay, duration: 0.8 }}
          />
        ))}

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <FaCheckCircle className="text-green-500 text-4xl" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 text-center">Payment Successful!</h1>
            <p className="text-gray-600 mt-2 text-center">
              Your payment has been processed and your tickets are ready!
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 mb-6"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaTicketAlt className="mr-2" />
                  <span className="font-medium text-lg">Event Ticket</span>
                </div>
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                  x{quantity}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4 line-clamp-2">{ticketInfo?.event?.title || 'Event'}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-white/80" />
                  <span>{formattedDate}</span>
                </div>
                {formattedTime && (
                  <div className="flex items-center">
                    <div className="w-5 text-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>{formattedTime}</span>
                  </div>
                )}
                {ticketInfo?.event?.venue && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-white/80" />
                    <span>{ticketInfo.event.venue}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute left-0 right-0 -top-1 h-2 flex">
              <div className="w-2 h-2 rounded-full bg-gray-100" />
              <div className="flex-1 border-t-2 border-dashed border-gray-200 h-0 my-auto" />
              <div className="w-2 h-2 rounded-full bg-gray-100" />
            </div>
            
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-1">
                You will be redirected to your tickets page in a few seconds...
              </p>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5 }}
                  className="bg-green-500 h-full"
                />
              </div>
            </div>
            
            <Link
              to="/my-tickets"
              className="block w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View My Tickets
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;