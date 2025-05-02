import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Footer from "./components/Footer";

function CreateEvent() {
  // derive today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: today,       // default to today
    time: "",
    venue: "",
    address: "",
    category: "",
    price: "",
    totalTickets: "",
    images: [],
    video: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState({ images: [], video: null });
  const token = localStorage.getItem("token");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    // Validation: disallow past dates
    if (new Date(formData.date) < new Date(today)) {
      toast.error("Please select today or a future date for your event.");
      return;
    }

    try {
      setIsLoading(true);
      const eventData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== "images" && key !== "video") {
          eventData.append(key, formData[key]);
        }
      });
      formData.images.forEach(img => eventData.append("images", img));
      if (formData.video) eventData.append("video", formData.video);

      const response = await fetch("http://localhost:9090/event/create", {
        method: "POST",
        headers: { Authorization: token },
        body: eventData
      });

      if (response.ok) {
        toast.success("Event created successfully!");
        // give the toast a moment before navigating away
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        toast.error("Failed to create event.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating event.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    
    if (id === "images") {
      const selectedImages = Array.from(files);
      setFormData(prevData => ({
        ...prevData,
        images: [...prevData.images, ...selectedImages]
      }));
      
      // Create image previews
      const imagePreviews = selectedImages.map(file => URL.createObjectURL(file));
      setPreview(prevPreview => ({
        ...prevPreview,
        images: [...prevPreview.images, ...imagePreviews]
      }));
    } else if (id === "video") {
      const selectedVideo = files[0];
      setFormData(prevData => ({
        ...prevData,
        video: selectedVideo
      }));
      
      // Create video preview
      const videoPreview = URL.createObjectURL(selectedVideo);
      setPreview(prevPreview => ({
        ...prevPreview,
        video: videoPreview
      }));
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    const updatedPreviews = [...preview.images];
    
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      images: updatedImages
    }));
    
    setPreview(prevPreview => ({
      ...prevPreview,
      images: updatedPreviews
    }));
  };

  const removeVideo = () => {
    setFormData(prevData => ({
      ...prevData,
      video: null
    }));
    
    setPreview(prevPreview => ({
      ...prevPreview,
      video: null
    }));
  };

  return (
    <div className="min-h-screen bg-white-50 flex flex-col">
      {/* Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />

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
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your Event</h2>
            
            <form onSubmit={handleCreateEvent} className="space-y-6">
              {/* Basic Info Section */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Event Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-gray-700 font-medium mb-1">Event Title*</label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a short, clear title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-gray-700 font-medium mb-1">Category*</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>Select category</option>
                      <option value="conference">Conference</option>
                      <option value="seminar">Seminar</option>
                      <option value="workshop">Workshop</option>
                      <option value="concert">Concert</option>
                      <option value="festival">Festival</option>
                      <option value="exhibition">Exhibition</option>
                      <option value="sport">Sports</option>
                      <option value="networking">Networking</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-1">Event Description*</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    placeholder="Describe your event in detail"
                    required
                  />
                </div>
              </div>
              
              {/* Date & Location Section */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">
                  Date & Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block mb-1">Event Date*</label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={today}  // disable past dates
                      className="w-full p-3 border rounded-lg focus:ring-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block mb-1">Event Time*</label>
                    <input
                      type="time"
                      id="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="venue" className="block text-gray-700 font-medium mb-1">Venue Name*</label>
                    <input
                      type="text"
                      id="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter venue name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-gray-700 font-medium mb-1">Venue Address*</label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full address of the venue"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Ticket Information Section */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Ticket Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-gray-700 font-medium mb-1">Ticket Price ($)*</label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Set to 0 for free events</p>
                  </div>
                  
                  <div>
                    <label htmlFor="totalTickets" className="block text-gray-700 font-medium mb-1">Available Tickets*</label>
                    <input
                      type="number"
                      id="totalTickets"
                      min="1"
                      value={formData.totalTickets}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of tickets available"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Media Upload Section */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Event Media</h3>
                
                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Event Images</label>
                  <div className="flex flex-col space-y-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="images" className="cursor-pointer flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="mt-2 text-sm font-medium text-blue-600">Click to upload images</span>
                        <span className="mt-1 text-xs text-gray-500">(Max 5 images, JPG or PNG)</span>
                      </label>
                    </div>
                    
                    {/* Image Previews */}
                    {preview.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Image Previews:</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {preview.images.map((src, index) => (
                            <div key={index} className="relative">
                              <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Video Upload */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Event Video (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      id="video"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="video" className="cursor-pointer flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 text-sm font-medium text-blue-600">Click to upload video</span>
                      <span className="mt-1 text-xs text-gray-500">(MP4 format, max 50MB)</span>
                    </label>
                  </div>
                  
                  {/* Video Preview */}
                  {preview.video && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Video Preview:</p>
                      <div className="relative">
                        <video 
                          src={preview.video} 
                          controls 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* QR Code Information */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-blue-800">QR Code Generation</h3>
                    <p className="text-sm text-gray-600 mt-1">Unique QR codes will be automatically generated for each ticket sold, enabling easy verification at your event.</p>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className={`px-8 py-3 font-semibold text-lg rounded-lg text-white focus:outline-none transition duration-300 ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Event...
                    </div>
                  ) : (
                    'Create Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default CreateEvent;
