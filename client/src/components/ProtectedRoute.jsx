import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div style={{ color: "white" }}>Loading...</div>;

  // Not logged in → login
  if (!user) return <Navigate to="/login" />;

  // Check if profile is incomplete
  const profileIncomplete =
    !user.age ||
    !user.height ||
    !user.weight ||
    !user.gender ||
    !user.goal;

  const isDashboard = location.pathname === "/dashboard";

  // ALLOW /dashboard?edit=true always
  const isEditing = location.pathname === "/dashboard";

  // If profile is incomplete → allow only dashboard routes
  if (profileIncomplete && !isDashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
