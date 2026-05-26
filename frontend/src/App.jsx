import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { Sun, Moon, Zap, User } from "lucide-react";
import Editor from "./components/Editor";
import LandingPage from "./components/LandingPage";
import CreateRoomPage from "./components/CreateRoomPage";
import ExplorePage from "./components/ExplorePage";
import HistoryPage from "./components/HistoryPage";
import { API_BASE, safeJson } from "./utils/network";
import { Analytics } from "@vercel/analytics/react";

import "./App.css";

// ---- Theme Manager ----

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("inksynk-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("inksynk-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggleTheme };
}

// ---- Components ----

function Navbar({ theme, toggleTheme }) {
  const username = localStorage.getItem("username");

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand" id="navbar-home-link">
          <div className="brand-logo">
            <Zap className="brand-icon" />
          </div>
          <span className="brand-name">DocFlow</span>
        </Link>

        <div className="navbar-actions">
          <Link to="/explore" className="navbar-link">
            Explore
          </Link>
          <Link to="/history" className="navbar-link">
            My Notebooks
          </Link>

          {username && (
            <div className="navbar-user" id="navbar-user-display">
              <User className="user-icon" />
              <span className="user-name">{username}</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            id="theme-toggle-btn"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="toggle-icon" />
            ) : (
              <Sun className="toggle-icon" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ---- Client Identity ----

const getClientId = () => {
  let id = localStorage.getItem("collab-editor-client-id");
  if (!id) {
    id = nanoid();
    localStorage.setItem("collab-editor-client-id", id);
  }
  return id;
};

// ---- Room Guard (Access Control) ----

function RoomGuard({ clientId }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [access, setAccess] = useState({
    loading: true,
    allowed: false,
    reason: null,
  });

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/rooms/${roomId}/access?clientId=${clientId}`,
        );
        const data = await safeJson(res);

        if (!cancelled) {
          if (res.ok && data.allowed) {
            setAccess({ loading: false, allowed: true, reason: null });
          } else {
            setAccess({
              loading: false,
              allowed: false,
              reason: data.reason || "error",
            });
          }
        }
      } catch {
        if (!cancelled) {
          setAccess({
            loading: false,
            allowed: false,
            reason: "network_error",
          });
        }
      }
    };

    checkAccess();
    return () => {
      cancelled = true; // cleanup function
    };
  }, [roomId, clientId]);

  if (access.loading) {
    return (
      <div className="guard-screen">
        <div className="guard-card">
          <div className="spinner" />
          <p className="guard-text">Connecting to room…</p>
        </div>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="guard-screen">
        <div className="guard-card guard-error">
          <div className="guard-icon">
            {access.reason === "private" ? "🔒" : "🚫"}
          </div>
          <h2 className="guard-title">Access Denied</h2>
          <p className="guard-message">
            {access.reason === "private" &&
              "This is a private notebook. Only the owner can enter."}
            {access.reason === "not_found" &&
              "This notebook does not exist or has been deleted."}
            {access.reason === "network_error" &&
              "Could not reach the server. Please check your connection."}
            {access.reason === "error" &&
              "An unexpected error occurred while checking access."}
          </p>
          <button
            className="primary-btn"
            onClick={() => navigate("/")}
            id="guard-return-btn"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <Editor roomName={roomId} clientId={clientId} />;
}

// ---- Main App ----

function App() {
  const clientId = useMemo(() => getClientId(), []);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route
            path="/create"
            element={<CreateRoomPage clientId={clientId} />}
          />
          <Route
            path="/doc/:roomId"
            element={<RoomGuard clientId={clientId} />}
          />
        </Routes>
      </main>
      <Analytics />
    </div>
  );
}

export default App;
