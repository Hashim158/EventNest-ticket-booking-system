import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTicketAlt,
  FaUser,
  FaExclamationCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const apiBase = 'http://localhost:9090';

const EventDetail = () => {
  const { id } = useParams();                // event ID from URL
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [availableTickets, setAvailableTickets] = useState(0);
  const [organizer, setOrganizer] = useState(null);
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Notification state
  const [notification, setNotification] = useState(null);

  // lightbox state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: `/event-details/${id}` } });
    } else {
      fetchEventDetails();
    }
  }, [id, token, navigate]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Helper to include Bearer token header
  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Show notification helper
  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  // Fetch event data and available tickets, then organizer info
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/event/${id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch event details');
      }
      const data = await res.json();
      setEvent(data);
      setAvailableTickets(data.totalTickets);

      // Normalize organizer ID and fetch its username
      const oid = data.organizer?.$oid || data.organizer;
      if (oid) {
        await fetchOrganizerDetails(oid);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizer username by ID
  const fetchOrganizerDetails = async (organizerId) => {
    try {
      setOrganizerLoading(true);
      const res = await fetch(
        `${apiBase}/user/organizer/${organizerId}`,
        { headers: authHeaders() }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch organizer details');
      }
      const { username } = await res.json();
      setOrganizer(username);
    } catch (err) {
      console.error(err);
      setOrganizer('Unknown');
    } finally {
      setOrganizerLoading(false);
    }
  };

  // Helpers for formatting
  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const formatTime = (ds) =>
    new Date(ds).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

  // Quantity selector limits
  const maxSelectable = Math.min(availableTickets, 5);
  const handleQuantityChange = (e) => {
    const v = parseInt(e.target.value, 10);
    if (v >= 1 && v <= maxSelectable) {
      setTicketQuantity(v);
    }
  };

  // Function to redirect to Stripe
  const redirectToStripeCheckout = async () => {
    try {
      setPaymentProcessing(true);

      // 1) First check if user already has tickets for this event
      const ticketResp = await fetch(`${apiBase}/ticket/user`, {
        headers: authHeaders(),
      });

      if (!ticketResp.ok) {
        throw new Error('Failed to fetch user tickets');
      }

      const { userTickets } = await ticketResp.json();
      const alreadyBooked = userTickets.some(t => t.event._id === id);

      if (alreadyBooked) {
        showNotification('You have already booked tickets for this event.', 'warning');
        setPaymentProcessing(false);
        return;
      }

      // 2) Create Stripe checkout session
      const response = await fetch(`${apiBase}/payment/create-checkout-session`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          eventId: id,
          quantity: ticketQuantity,
          eventTitle: event.title,
          price: event.price
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { url } = await response.json();

      // 3) Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Payment error:', error);
      showNotification('There was a problem processing your payment. Please try again.', 'error');
      setPaymentProcessing(false);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Events
        </button>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Event not found</h2>
      </div>
    );
  }

  // Render
  const mainImage = event.images?.[0]
    ? `${apiBase}/${event.images[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';
  const displayOrganizer = organizerLoading ? 'Loading...' : organizer || 'Unknown';

  return (
    <div className="min-h-screen bg-white-50">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div 
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center ${
              notification.type === 'error' 
                ? 'bg-red-50 border-l-4 border-red-500' 
                : notification.type === 'warning'
                ? 'bg-yellow-50 border-l-4 border-yellow-500'
                : 'bg-green-50 border-l-4 border-green-500'
            }`}
          >
            {notification.type === 'error' ? (
              <FaTimesCircle className="text-red-500 mr-2" />
            ) : notification.type === 'warning' ? (
              <FaExclamationCircle className="text-yellow-500 mr-2" />
            ) : (
              <FaExclamationCircle className="text-green-500 mr-2" />
            )}
            <span className={`mr-2 ${
              notification.type === 'error' 
                ? 'text-red-800' 
                : notification.type === 'warning'
                ? 'text-yellow-800'
                : 'text-green-800'
            }`}>
              {notification.message}
            </span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-600 hover:text-gray-800"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-white text-3xl leading-none"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Enlarged"
              className="max-h-[80vh] max-w-[90vw] rounded"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-1">
            <span className="text-gray-800 font-bold text-4xl">Event</span>
            <span className="text-green-400 font-bold text-4xl">Nest</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            {[
              'Sports',
              'Concert',
              'Workshop',
              'Exhibition',
              'Networking',
              'Favorites',
              'My Tickets',
              'My Events',
            ].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(/\s/g, '-')}`}
                className="hover:text-gray-900"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero image */}
          <div className="relative h-96 w-full">
            {event.images?.length ? (
              <img
                src={mainImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h1 className="text-3xl font-bold text-white">
                {capitalize(event.title)}
              </h1>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium text-white">
                {capitalize(event.category)}
              </span>
            </div>
          </div>

          {/* Details & sidebar */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: description, video, gallery, location */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {event.video && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Event Preview</h3>
                  <div className="w-full aspect-video rounded-lg overflow-hidden">
                    <video
                      className="w-full h-full object-cover"
                      controls
                    >
                      <source src={`${apiBase}/${event.video}`} type="video/mp4" />
                    </video>
                  </div>
                </div>
              )}

              {event.images?.length > 1 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Event Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.images.map((img, i) => {
                      const fullUrl = `${apiBase}/${img}`;
                      return (
                        <div key={i} className="h-48 overflow-hidden rounded-lg">
                          <img
                            src={fullUrl}
                            alt={`${event.title} – image ${i + 1}`}
                            className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
                            onClick={() => {
                              setSelectedImage(fullUrl);
                              setIsModalOpen(true);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold mb-3">Location</h3>
                <div className="flex items-start text-gray-700">
                  <FaMapMarkerAlt className="mr-2 mt-1 text-red-500" />
                  <div>
                    <p className="font-medium">{event.venue}</p>
                    <p>{event.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: purchase sidebar */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg shadow space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-600" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-blue-600" />
                    <span className="font-medium">{formatTime(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaTicketAlt className="mr-2 text-blue-600" />
                    <span className="font-medium">
                      {availableTickets} tickets available
                    </span>
                  </div>
                  {event.organizer && (
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-blue-600" />
                      <span className="font-medium">
                        Organized by: {displayOrganizer}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Price:</span>
                    <span className="text-xl font-bold">${event.price}</span>
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          ticketQuantity > 1 &&
                          setTicketQuantity(q => q - 1)
                        }
                        className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
                        disabled={paymentProcessing}
                      >
                        –
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max={maxSelectable}
                        value={ticketQuantity}
                        onChange={handleQuantityChange}
                        className="w-16 text-center border-t border-b border-gray-300 py-1"
                        disabled={paymentProcessing}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          ticketQuantity < maxSelectable &&
                          setTicketQuantity(q => q + 1)
                        }
                        className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
                        disabled={paymentProcessing}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${(event.price * ticketQuantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${(event.price * ticketQuantity).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={redirectToStripeCheckout}
                    disabled={availableTickets === 0 || paymentProcessing}
                    className={`w-full py-3 rounded-lg font-medium text-white ${
                      availableTickets === 0 || paymentProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {availableTickets === 0
                      ? 'Sold Out'
                      : paymentProcessing
                      ? 'Processing...'
                      : 'Purchase Tickets'}
                  </button>

                  <p className="text-red-600 text-sm text-center">
                    You can purchase up to {maxSelectable} ticket
                    {maxSelectable > 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;