import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import ManageBooking from "./pages/ManageBooking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRooms from "./pages/AdminRooms";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-midnight text-ivory">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
          <Route path="/manage" element={<ProtectedRoute><ManageBooking /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
