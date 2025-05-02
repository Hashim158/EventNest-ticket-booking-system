// src/components/MyFavorites.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './components/EventCard';

function Favorites() {
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [userData, setUserData]       = useState(null);
  const token = localStorage.getItem('token');

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Fetch the user's favourite events
  const fetchFavoriteEvents = async () => {
    if (!token) {
      console.error('No token—redirect to login');
      return;
    }
    try {
      const res = await fetch('http://localhost:9090/favourites/user', {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        console.error('Unauthorized: check your token or login again');
        return;
      }
      if (!res.ok) {
        console.error('Failed to fetch favourites:', res.status);
        return;
      }
      const { favourites } = await res.json();
      // extract just the event objects from each favourite
      const events = favourites.map(fav => fav.event);
      setFavoriteEvents(events);
    } catch (err) {
      console.error('Error fetching favourites:', err);
    }
  };

  // (Optional) Fetch user profile data if you need it
  const fetchUserData = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:9090/user', {
        headers: authHeaders(),
      });
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
    if (token) {
      fetchFavoriteEvents();
      fetchUserData();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-white-50">
      {/* —————— HEADER with logo + nav —————— */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-1">
              <span className="text-gray-800 font-bold text-4xl">Event</span>
              <span className="text-green-400 font-bold text-4xl">Nest</span>
            </Link>
            {/* Navigation links */}
            <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
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
                  className="hover:text-gray-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* —————— MAIN CONTENT: Your Favorite Events —————— */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-4">Your Favorite Events</h2>
        {favoriteEvents.length === 0 ? (
          <p className="text-gray-600">You haven't added any favorites yet.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Favorites;
