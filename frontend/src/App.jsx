import React from "react";
import { Routes, Route } from "react-router-dom";
import SignupPage from "./SignUpPage";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import CreateEvent from "./CreateEvent";
import MyEvents from "./MyEvents";
import EventDetail from "./EventDetail";
import Sports from "./Sports";
import Concerts from "./Concerts";
import Workshop from "./Workshop";
import Networking from "./Networking";
import Exhibition from "./Exhibition";
import UserProfile from "./UserProfile";
import MyTickets from "./MyTickets";
import Favorites from "./Favorietes";
import PaymentSuccess from "./PaymentSuccess";
import Admin from "./Admin";

function App() {
  return (
    <div className="min-h-screen bg-white transition-colors">
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/event-details/:id" element={<EventDetail />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/concert" element={<Concerts />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/networking" element={<Networking />} />
        <Route path="/exhibition" element={<Exhibition />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin/:eventId" element={<Admin />} />
        </Routes>
    </div>
  );
}

export default App;
