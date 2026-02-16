import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}