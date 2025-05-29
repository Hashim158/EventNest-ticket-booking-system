import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiFilter } from "react-icons/fi";
import EventCard from "./components/EventCard";
import Footer from "./components/Footer";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const categories = [
    "all",
    "conference",
    "seminar",
    "workshop",
    "concert",
    "festival",
    "exhibition",
    "sport",
    "networking",
    "other"
  ];

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    setSearchQuery("");
    setSelectedCategory("all");
  
    try {
      const res = await fetch("http://localhost:9090/event/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) throw new Error(res.statusText);
  
      const fetchedEvents = await res.json();
  
      // Get today's date without time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // Filter out past events
      const upcomingEvents = fetchedEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });
  
      // Sort by date
      upcomingEvents.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  
      setEvents(upcomingEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append("query", searchQuery);
      if (selectedCategory !== "all") searchParams.append("category", selectedCategory);
      
      const url = `http://localhost:9090/event/search?${searchParams.toString()}`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) throw new Error(res.statusText);
      const searchResults = await res.json();
      setEvents(searchResults);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const openUserProfile = () => {
    navigate('/user-profile');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              onClick={() => {
                setSearchQuery(""); 
                setSelectedCategory("all");
                fetchEvents();
              }} 
              className="flex items-center space-x-1 cursor-pointer"
            >
              <span className="text-gray-800 font-bold text-4xl">Event</span>
              <span className="text-green-400 font-bold text-4xl">Nest</span>
            </div>
            <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
              {[
                "Sports",
                "Concert",
                "Workshop",
                "Exhibition",
                "Networking",
                "Favorites",
                "My Tickets",
                "My Events",
                "Create Event",
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
            <button
              onClick={openUserProfile}
              className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiUser size={28} />
              <span className="ml-1 font-medium">Profile</span>
            </button>
          </div>
          <div className="mt-4 pb-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <FiSearch
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, artists, teams, and more"
                    className="w-full border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-300 rounded-full py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {searchQuery || selectedCategory !== "all" 
              ? "Search Results" 
              : "Upcoming Events"}
          </h2>
          {(searchQuery || selectedCategory !== "all") && (
            <button 
              onClick={fetchEvents}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Events
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">No events found. Try different search terms.</p>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;