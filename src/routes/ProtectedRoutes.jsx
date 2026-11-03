import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoutes = () => {
  const reduxToken = useSelector((state) => state.auth.token);
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = reduxToken || storedToken;

  // If no token exists in either Redux or localStorage, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
