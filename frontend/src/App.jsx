import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import "./styles/css/index.css";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import { ThemeProvider } from "./context/ThemeContext";

// ── Route guard ────────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  return localStorage.getItem("solar_user")
    ? children
    : <Navigate to="/auth/login" replace />;
}

function PublicRoute({ children }) {
  // Redirect already-logged-in users away from auth pages
  return localStorage.getItem("solar_user")
    ? <Navigate to="/dashboard" replace />
    : children;
}

function AppRoutes() {
  const isAuth = Boolean(localStorage.getItem("solar_user"));

  return (
    <Router>
      <Routes>
        <Route
          path="/auth/:type"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuth ? "/dashboard" : "/auth/login"} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={isAuth ? "/dashboard" : "/auth/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
