import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaTicketAlt, 
  FaUser, 
  FaIdCard, 
  FaVenusMars, 
  FaDownload, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaTimesCircle,
  FaQuestionCircle
} from 'react-icons/fa';

const apiBase = 'http://localhost:9090';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printingTicketId, setPrintingTicketId] = useState(null);
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState(null);
  // Notification state
  const [notification, setNotification] = useState(null);
  
  const token = localStorage.getItem('token');
  const ticketRefs = useRef({});
  
  useEffect(() => {
    fetchUserData();
    fetchUserTickets();
  }, []);

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
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  
  // Fetch user profile data
  const fetchUserData = async () => {
    try {
      // First we need to get the user ID
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;
      
      const response = await fetch(`${apiBase}/user/${userId}`, {
        headers: authHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userProfile = await response.json();
      setUserData(userProfile);
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Don't set error state here to avoid blocking ticket display
      // if user data fails to load
    }
  };
  
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/ticket/user`, {
        headers: authHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const { userTickets } = await response.json();
      // sort in-place by the event's date ascending
       userTickets.sort((a, b) =>
        new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
       );
      setTickets(userTickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    
  // Handle ticket cancellation confirmation
  const confirmCancelTicket = (ticketId) => {
    setTicketToCancel(ticketId);
    setShowConfirmModal(true);
  };

  // Handle ticket cancellation
  const handleCancelTicket = async () => {    
    try {
      const response = await fetch(`${apiBase}/ticket/${ticketToCancel}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel ticket');
      }
      
      // Remove the ticket from the list
      setTickets(tickets.filter(ticket => ticket._id !== ticketToCancel));
      showNotification('Ticket cancelled successfully', 'success');
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setShowConfirmModal(false);
      setTicketToCancel(null);
    }
  };

  // Print/Download ticket as PDF
  const printTicket = (ticketId) => {
    const ticketEl = ticketRefs.current[ticketId];
    if (!ticketEl) return;

    // Set active ticket for printing
    setPrintingTicketId(ticketId);
    
    // Use browser print
    setTimeout(() => {
      const content = ticketEl.innerHTML;
      const printWindow = window.open('', '_blank');
      
      // HTML for the print window
      printWindow.document.write(`
        <html>
          <head>
            <title>Event Ticket</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .ticket-container { max-width: 800px; margin: 0 auto; }
              .digital-ticket { border: 4px solid #3b82f6; border-radius: 8px; overflow: hidden; }
              .ticket-header { background-color: #2563eb; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
              .brand { font-weight: bold; font-size: 24px; }
              .brand-highlight { color: #86efac; font-weight: bold; font-size: 24px; }
              .ticket-section { padding: 20px; border-bottom: 1px solid #e5e7eb; }
              .ticket-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 12px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
              .info-item { margin-bottom: 8px; }
              .info-label { font-weight: bold; }
              .qr-section { text-align: center; padding: 16px; }
              .qr-code { border: 2px solid #d1d5db; padding: 8px; border-radius: 4px; display: inline-block; }
              .ticket-footer { background-color: #f3f4f6; padding: 12px; text-align: center; font-size: 12px; color: #6b7280; }
              .watermark { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0.1; }
              .watermark-text { transform: rotate(45deg); font-size: 60px; font-weight: bold; color: #93c5fd; }
              @media print {
                body { -webkit-print-color-adjust: exact; color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              ${content}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    }, 300);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Digital Ticket Component
  const DigitalTicket = ({ ticket, userData }) => {
    return (
      <div className="digital-ticket bg-white border-4 border-blue-500 rounded-lg overflow-hidden relative">
        {/* Ticket header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-2xl">Event</span>
            <span className="text-green-300 font-bold text-2xl">Nest</span>
          </div>
          <div className="text-lg font-semibold">E-TICKET</div>
        </div>
        
        {/* Event details */}
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{ticket.event.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" />
              <span>{formatDate(ticket.event.date)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2 text-blue-600" />
              <span>{formatTime(ticket.event.date)}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" />
              <span>{ticket.event.venue}</span>
            </div>
            <div className="flex items-center">
              <FaTicketAlt className="mr-2 text-blue-600" />
              <span>Quantity: {ticket.quantity || 1}</span>
            </div>
          </div>
        </div>
        
        {/* Attendee information */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Attendee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              <span><strong>Name:</strong> {userData?.username || 'N/A'}</span>
            </div>
            {userData?.cnic && (
              <div className="flex items-center">
                <FaIdCard className="mr-2 text-blue-600" />
                <span><strong>CNIC:</strong> {userData.cnic}</span>
              </div>
            )}
            {userData?.gender && (
              <div className="flex items-center">
                <FaVenusMars className="mr-2 text-blue-600" />
                <span><strong>Gender:</strong> {userData.gender}</span>
              </div>
            )}
            {userData?.number && (
              <div className="flex items-center">
                <i className="fas fa-phone mr-2 text-blue-600"></i>
                <span><strong>Phone:</strong> {userData.number}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* QR Code and Ticket ID */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Ticket Information</h3>
            <p className="text-sm text-gray-600">Ticket ID: {ticket._id}</p>
            <p className="text-sm text-gray-600">Issued: {new Date(ticket.createdAt || Date.now()).toLocaleString()}</p>
            <p className="text-xs mt-3 text-gray-500">Present this ticket with valid ID at event entrance</p>
          </div>
          
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-2">Scan QR Code</p>
            <div className="border-2 border-gray-300 p-2 rounded">
              {ticket.qrCode ? (
                <img src={ticket.qrCode} alt="Ticket QR Code" className="w-32 h-32" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">QR Code</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 p-3 text-center text-xs text-gray-600">
          <p>EventNest - Digital Ticket System</p>
        </div>
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="transform rotate-45 text-6xl font-bold text-blue-300">EventNest</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <FaCheckCircle className="text-green-500 mr-2" />
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <FaQuestionCircle className="text-blue-500 text-2xl mr-3" />
              <h3 className="text-lg font-bold">Confirm Cancellation</h3>
            </div>
            <p className="mb-6">Are you sure you want to cancel this ticket? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                No, Keep Ticket
              </button>
              <button 
                onClick={handleCancelTicket}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Cancel Ticket
              </button>
            </div>
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
            <Link to="/dashboard" className="hover:text-gray-900">Events</Link>
            <Link to="/my-tickets" className="text-blue-600 font-semibold">My Tickets</Link>
          </nav>
        </div>
      </header>
      
     
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
        
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">You don't have any tickets yet.</p>
            <Link 
              to="/dashboard" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  {/* Digital Ticket Preview */}
                  <div 
                    className="mb-6" 
                    ref={el => ticketRefs.current[ticket._id] = el}
                  >
                    <DigitalTicket ticket={ticket} userData={userData} />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-4">
                    <Link 
                      to={`/event-details/${ticket.event._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    >
                      Event Details
                    </Link>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => printTicket(ticket._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <FaDownload className="mr-1" /> Download PDF
                      </button>
                      <button
                        onClick={() => confirmCancelTicket(ticket._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;