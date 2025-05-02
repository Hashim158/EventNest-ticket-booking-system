import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Calendar, MapPin, DollarSign, CreditCard, ArrowLeft, BarChart } from "lucide-react";
import Footer from "./components/Footer";

function Admin() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAttendees: 0,
    averageTicketsPerUser: 0,
  });

  const apiBase = "http://localhost:9090";
  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch event + tickets together
  useEffect(() => {
    if (!eventId || !token) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1) Event
        const evtRes = await fetch(`${apiBase}/event/${eventId}`, {
          headers: authHeaders,
        });
        if (!evtRes.ok) throw new Error("Failed to fetch event data");
        const evt = await evtRes.json();
        setEventData(evt);

        // 2) Tickets
        const ticRes = await fetch(`${apiBase}/ticket/event/${eventId}`, {
          headers: authHeaders,
        });
        if (!ticRes.ok) throw new Error("Failed to fetch ticket data");
        const { tickets = [] } = await ticRes.json();
        setTicketData(tickets);
      } catch (err) {
        console.error(err);
        setError("Could not load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [eventId, token]);

  // Recalculate stats whenever eventData.price or ticketData changes
  useEffect(() => {
    if (!eventData) return;

    if (ticketData.length === 0) {
      setStats({ totalSales: 0, totalAttendees: 0, averageTicketsPerUser: 0 });
      return;
    }

    const uniqueUsers = new Set(ticketData.map((t) => t.user._id));
    const totalQuantity = ticketData.reduce(
      (sum, t) => sum + (t.quantity || 1),
      0
    );
    const totalSales = ticketData.reduce(
      (sum, t) => sum + ((eventData.price || 0) * (t.quantity || 1)),
      0
    );

    setStats({
      totalSales,
      totalAttendees: totalQuantity,
      averageTicketsPerUser: totalQuantity / uniqueUsers.size,
    });
  }, [eventData, ticketData]);

  if (loading && !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md shadow">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-1">
              <span className="text-gray-800 font-bold text-3xl">Event</span>
              <span className="text-green-500 font-bold text-3xl">Nest</span>
            </Link>
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
                  className="hover:text-green-500 transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {eventData ? (
          <>
            {/* Back button */}
            <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-green-500 mb-6 transition-colors duration-200">
              <ArrowLeft size={18} className="mr-1" />
              <span>Back to Dashboard</span>
            </Link>
            
            {/* Event Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {eventData.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={18} className="mr-2 text-green-500" />
                      <span>
                        {new Date(eventData.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={18} className="mr-2 text-green-500" />
                      <span>{eventData.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Admin View
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-105 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Total Sales
                  </h2>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalSales.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">From {ticketData.length} transactions</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-105 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Attendees
                  </h2>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalAttendees}
                </p>
                <p className="text-sm text-gray-500 mt-2">Total tickets sold</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-105 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Avg. Tickets
                  </h2>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart size={24} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageTicketsPerUser.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Per customer</p>
              </div>
            </div>

            {/* Attendee List */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="text-gray-700 mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Attendees
                    </h2>
                  </div>
                  {ticketData.length > 0 && (
                    <span className="text-sm text-gray-500">
                      Showing {ticketData.length} {ticketData.length === 1 ? 'customer' : 'customers'}
                    </span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-600">Loading attendee data...</p>
                </div>
              ) : ticketData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketData.map((ticket) => {
                        const { _id, purchaseDate, quantity, user } = ticket;
                        const qty = quantity || 1;
                        return (
                          <tr key={_id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 font-medium text-sm">
                                    {(user.username || user._id).substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.username || user._id}
                                  </div>
                                  {user.email && (
                                    <div className="text-xs text-gray-500">
                                      {user.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(purchaseDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(purchaseDate).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {qty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <CreditCard size={16} className="mr-1 text-gray-500" />
                                ${((eventData.price || 0) * qty).toFixed(2)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-1">
                    No tickets have been purchased for this event yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Attendees will appear here once tickets are sold.
                  </p>
                </div>
              )}
            </div>
            
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No event data available.</p>
            <p className="text-gray-500 mt-2">Check the event ID or try again later.</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
        <Footer />
    </div>
  );
}

export default Admin;