import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import OverviewPage from "./pages/OverviewPage";
import AdminPanel from "./pages/AdminPanel";
import ProgressPage from "./pages/ProgressPage";
import SuggestWorkoutsPage from "./pages/WorkoutsPage";
import SuggestMealsPage from "./pages/MealsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop"; // ✅ ADD THIS

function App() {
  return (
    <>
      {/* 🔥 Global scroll fix */}
      <ScrollToTop />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <OverviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suggest-workouts"
          element={
            <ProtectedRoute>
              <SuggestWorkoutsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suggest-meals"
          element={
            <ProtectedRoute>
              <SuggestMealsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
