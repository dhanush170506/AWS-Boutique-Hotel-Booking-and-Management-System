import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles) {
    const normalizedRole = String(user?.role || "").trim().toLowerCase();
    const allowed = allowedRoles.map((role) => String(role || "").trim().toLowerCase());
    if (!allowed.includes(normalizedRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
