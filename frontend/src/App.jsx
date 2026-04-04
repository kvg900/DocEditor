import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Sparkles, User, LogOut } from 'lucide-react';
import Editor from './components/Editor';
import LandingPage from './components/LandingPage';
import CreateRoomPage from './components/CreateRoomPage';
import Dashboard from './components/Dashboard';
import { API_BASE, safeJson } from './utils/network';
import './App.css';

// ---- Components ----

function Navbar({ username }) {
  return (
    <nav className="navbar glass">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="landing-logo-container glass" style={{ padding: '0.4rem' }}>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <span className="brand-name">InkSynk</span>
        </Link>
        
        <div className="navbar-actions">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          {username && (
            <div className="navbar-user">
              <div className="user-indicator">
                <User className="w-4 h-4" />
                <span className="user-name">{username}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ---- Client Identity ----

const getClientId = () => {
  let id = localStorage.getItem('collab-editor-client-id');
  if (!id) {
    id = nanoid();
    localStorage.setItem('collab-editor-client-id', id);
  }
  return id;
};

// ---- Room Guard (Access Control) ----

function RoomGuard({ clientId }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [access, setAccess] = useState({ loading: true, allowed: false, reason: null });

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${roomId}/access?clientId=${clientId}`);
        const data = await safeJson(res);

        if (!cancelled) {
          if (res.ok && data.allowed) {
            setAccess({ loading: false, allowed: true, reason: null });
          } else {
            setAccess({ 
              loading: false, 
              allowed: false, 
              reason: data.reason || 'error' 
            });
          }
        }
      } catch {
        if (!cancelled) {
          setAccess({ loading: false, allowed: false, reason: 'network_error' });
        }
      }
    };

    checkAccess();
    return () => { cancelled = true; };
  }, [roomId, clientId]);

  if (access.loading) {
    return (
      <div className="guard-screen">
        <div className="guard-card glass-card">
          <div className="spinner" />
          <p>Verifying access to "{roomId}"...</p>
        </div>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="guard-screen">
        <div className="guard-card glass-card error">
          <div className="guard-icon">
            {access.reason === 'private' ? '🔒' : '🚫'}
          </div>
          <h2>Access Denied</h2>
          <p>
            {access.reason === 'private' && 'This is a private notebook. Only the owner can enter.'}
            {access.reason === 'not_found' && 'This notebook does not exist or has been deleted.'}
            {access.reason === 'network_error' && 'Could not reach the server. Please check your connection.'}
            {access.reason === 'error' && 'An unexpected error occurred while checking access.'}
          </p>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/')}
          >
            Return to Lobby
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
  const username = useMemo(() => localStorage.getItem('collab-editor-username') || 'Anonymous', []);

  return (
    <div className="app">
      {/* Universal Background Animation */}
      <div className="bg-animation">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <Navbar username={username} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateRoomPage clientId={clientId} />} />
          <Route path="/dashboard" element={<Dashboard clientId={clientId} />} />
          <Route path="/doc/:roomId" element={<RoomGuard clientId={clientId} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
