import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
