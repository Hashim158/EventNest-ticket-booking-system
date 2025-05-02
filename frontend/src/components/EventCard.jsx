// src/components/EventCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MapPin, Tag, DollarSign, Users } from 'lucide-react';

const capitalize = (str) =>
  !str ? '' : str.charAt(0).toUpperCase() + str.slice(1);

const EventCard = ({ event, apiBase = 'http://localhost:9090' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBase}/favourites/user`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const { favourites } = await res.json();
        const fav = favourites.find(f => f.event._id === event._id);
        if (fav) {
          setIsFavorite(true);
          setFavId(fav._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavourites();
  }, [event._id, apiBase, token]);

  const toggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      console.error('Login required to favourite.');
      return;
    }
    
    try {
      if (isFavorite) {
        const res = await fetch(`${apiBase}/favourites/${favId}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        if (res.ok) {
          setIsFavorite(false);
          setFavId(null);
        }
      } else {
        const res = await fetch(`${apiBase}/favourites`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ eventId: event._id }),
        });
        if (res.ok) {
          const { favourite } = await res.json();
          setIsFavorite(true);
          setFavId(favourite._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const firstImage =
    event.images && event.images.length > 0
      ? `${apiBase}/${event.images[0]}`
      : 'https://via.placeholder.com/400x300?text=No+Image';

  const formattedDate = new Date(event.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Format price with dollar sign if it doesn't have one
  const formattedPrice = 
    event.price && typeof event.price === 'string' && event.price.includes('$')
      ? event.price
      : `$${event.price}`;

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/event-details/${event._id}`} className="block">
        {/* Image Container with gradient overlay */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={firstImage}
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-600 py-1 px-3 rounded-full text-xs font-medium flex items-center">
            <Tag size={12} className="mr-1" />
            {capitalize(event.category)}
          </div>

          {/* Date Badge */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-blue-600 py-1 px-3 rounded-full text-xs font-medium flex items-center">
            <Calendar size={12} className="mr-1" />
            {formattedDate}
          </div>
          
          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1 px-3 rounded-full text-xs font-bold flex items-center">
            <DollarSign size={12} className="mr-1" />
            {formattedPrice}
          </div>
        </div>

        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors">
            {capitalize(event.title)}
          </h3>
          
          {/* Location with icon */}
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          
          {/* Additional info if available */}
          {event.capacity && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users size={14} className="mr-1 flex-shrink-0" />
              <span>{event.capacity} attendees</span>
            </div>
          )}
        </div>
      </Link>

      {/* Favorite button */}
      <button
        onClick={toggleFavourite}
        className={`
          absolute top-3 right-3 
          ${isHovered || isFavorite ? 'opacity-100' : 'opacity-0'} 
          transition-opacity duration-300 
          bg-white/80 backdrop-blur-sm p-2 rounded-full 
          hover:bg-white transform hover:scale-110 active:scale-95
          shadow-md 
        `}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          size={18} 
          className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
      </button>
    </div>
  );
};

export default EventCard;