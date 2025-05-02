// src/components/MyEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function MyEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEvents, setUserEvents] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    address: '',
    category: '',
    price: '',
    totalTickets: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const token = localStorage.getItem('token');
  const apiBase = 'http://localhost:9090';

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const fetchUserEvents = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/event`, { headers: authHeaders() });
      if (res.status === 401) {
        console.error('Unauthorized: check your token or login again');
        return;
      }
      if (!res.ok) {
        console.error('Failed to fetch user events:', res.status);
        return;
      }
      const { userEvents } = await res.json();
      setUserEvents(userEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load your events. Please try again.');
    }
  };

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/user`, { headers: authHeaders() });
      if (!res.ok) {
        console.error('Failed to fetch user data:', res.status);
        return;
      }
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    setIsEditing(false);
    setEditingEvent(null);
    setError('');
    setSuccessMessage('');
    if (token) {
      fetchUserEvents();
      fetchUserData();
    }
  }, [token, location.pathname]);

  const handleEditClick = (event) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().slice(0, 16);
    setFormData({
      title: event.title,
      description: event.description,
      date: formattedDate,
      venue: event.venue,
      address: event.address || '',
      category: event.category,
      price: event.price,
      totalTickets: event.totalTickets
    });
    setEditingEvent(event._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEvent(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch(`${apiBase}/event/${editingEvent}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      const { event } = await res.json();
      setUserEvents(userEvents.map(e => e._id === editingEvent ? event : e));
      setSuccessMessage('Event updated successfully!');
      setIsEditing(false);
      setEditingEvent(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update event. Please try again.');
    }
  };

  const categories = [
    'conference',
    'seminar',
    'workshop',
    'concert',
    'festival',
    'exhibition',
    'sport',
    'networking',
    'other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/dashboard" className="flex items-center space-x-1 group">
              <span className="text-gray-900 font-extrabold text-4xl transition-colors duration-300 group-hover:text-green-600">Event</span>
              <span className="text-green-500 font-extrabold text-4xl transition-colors duration-300 group-hover:text-green-600">Nest</span>
            </Link>
            <nav className="hidden md:flex space-x-1">
              {[
                "Sports",
                "Concert",
                "Workshop",
                "Exhibition",
                "Networking",
                "Favorites",
                "My Tickets",
                "My Events",
              ].map((label) => (
                <Link
                  key={label}
                  to={`/${label.toLowerCase().replace(/\s/g, "-")}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
                    label === "My Events" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => { if (label === "My Events") handleCancelEdit(); }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Event' : 'Your Events'}
          </h2>
          
          {!isEditing && (
            <Link
              to="/create-event"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Event
            </Link>
          )}
        </div>

        {/* Notification Messages */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm flex items-start">
            <svg className="h-5 w-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{successMessage}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm flex items-start">
            <svg className="h-5 w-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing ? (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 transition-all duration-300">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="Enter event title"
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date and Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="Enter venue name"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="Full venue address"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total Tickets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Tickets Available</label>
                  <input
                    type="number"
                    name="totalTickets"
                    value={formData.totalTickets}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="Number of tickets"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Describe your event..."
                />
              </div>

              {/* Form Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {userEvents.length === 0 ? (
              <div className="bg-white shadow-lg rounded-2xl p-16 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-xl font-medium text-gray-900">No events found</h3>
                <p className="mt-2 text-gray-600">You haven't created any events yet.</p>
                <Link
                  to="/create-event"
                  className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {userEvents.map(event => {
                  const firstImage = event.images && event.images.length > 0
                    ? `${apiBase}/${event.images[0]}`
                    : 'https://via.placeholder.com/400x300?text=No+Image';
                  
                  const eventDate = new Date(event.date);
                  const today = new Date();
                  const isUpcoming = eventDate > today;
                  
                  return (
                    <div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                      <div className="relative h-56 overflow-hidden">
                        {/* Category badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-semibold rounded-full capitalize">
                            {event.category}
                          </span>
                        </div>
                        
                        {/* Price badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                            ${event.price.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Event status badge */}
                        {!isUpcoming && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-md transform rotate-12">
                              Event Ended
                            </span>
                          </div>
                        )}
                        
                        <img
                          src={firstImage}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-green-600 transition-colors duration-300">{event.title}</h3>
                        
                        <div className="space-y-3 mb-6">
                          {/* Date */}
                          <div className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {eventDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              <span className="ml-1 font-medium">
                                {eventDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </span>
                          </div>
                          
                          {/* Venue */}
                          <div className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                          
                          {/* Tickets */}
                          <div className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <span>
                              {event.soldTickets ? event.soldTickets : 0} / {event.totalTickets} tickets sold
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleEditClick(event)}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <Link
                            to={`/admin/${event._id}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyEvents;