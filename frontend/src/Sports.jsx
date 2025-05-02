import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventCard from "./components/EventCard";

function Sports() {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const fetchEvents = async () => {
    if (!token) return;
    try {
      // Corrected URL to match the backend's endpoint parameter
      // Using "sport" singular to match the category value in database
      const res = await fetch(
        "http://localhost:9090/event/all",
        { headers: authHeaders() }
      );
      if (!res.ok) {
        console.error("Failed to fetch sports events:", res.status);
        return;
      }
      const events= await res.json();
      const sportsEvents = events.filter(event => event.category === "sport")
        .sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setEvents(sportsEvents);
    } catch (err) {
      console.error("Error fetching sports events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* —————— MAIN CONTENT: Sports Events —————— */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-4">Sports Events</h2>

        {events.length === 0 ? (
          <p className="text-gray-600">No sports events found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Sports;