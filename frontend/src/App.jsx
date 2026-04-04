/**
 * App Component
 *
 * Root component that renders either:
 * - A Join screen (when no room in URL) for entering name + room ID
 * - The collaborative Editor (when URL has /doc/{id})
 *
 * [ADDED] Join/landing page with name + room ID inputs
 * [ADDED] MongoDB-backed room creation via POST /rooms
 * [ADDED] Recent Rooms list via GET /rooms
 */

import React, { useState, useMemo, useEffect } from 'react';
import Editor from './components/Editor';
import { API_BASE, safeJson } from './utils/network';
import './App.css';

// ---- URL-Based Room Routing ----

const extractRoomId = (value) => {
  if (!value) return null;

  let candidate = value.trim();
  if (!candidate) return null;

  for (let i = 0; i < 3; i += 1) {
    if (/^https?:\/\//i.test(candidate)) {
      try {
        candidate = new URL(candidate).pathname;
      } catch {
        break;
      }
    }

    const docParts = candidate.split('/doc/');
    if (docParts.length > 1) {
      candidate = docParts[docParts.length - 1];
    }

    candidate = candidate.replace(/^\/+/, '').split(/[/?#]/)[0];
  }

  const match = candidate.match(/[a-zA-Z0-9_-]+/);
  return match ? match[0] : null;
};

/**
 * Check if the current URL contains a room.
 * Returns the room ID if found, null otherwise.
 */
const getRoomFromUrl = () => {
  return extractRoomId(window.location.pathname);
};

// ---- Recent Rooms Component ----

function RecentRooms({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms`);
        const data = await safeJson(res);

        if (!res.ok) {
          throw new Error((data && data.error) || 'Failed to load rooms');
        }

        if (!cancelled) {
          setRooms(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError('Could not load recent rooms');
          setRooms([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="recent-rooms">
        <h3 className="recent-rooms-title">Recent Rooms</h3>
        <p className="recent-rooms-loading">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-rooms">
        <h3 className="recent-rooms-title">Recent Rooms</h3>
        <p className="join-error">{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) return null;

  return (
    <div className="recent-rooms">
      <h3 className="recent-rooms-title">Recent Rooms</h3>
      <ul className="recent-rooms-list">
        {rooms.slice(0, 10).map((room) => (
          <li key={room.roomId} className="recent-room-item">
            <button
              className="recent-room-btn"
              onClick={() => onSelectRoom(room.roomId)}
            >
              <span className="recent-room-name">{room.roomName}</span>
              <span className="recent-room-meta">
                <code>{room.roomId}</code>
                <span className="recent-room-date">
                  {new Date(room.createdAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Join Screen Component ----

function JoinScreen({ onJoin }) {
  const savedName = localStorage.getItem('collab-editor-username') || '';
  const [name, setName] = useState(savedName);
  const [roomInputName, setRoomInputName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Navigate to a room
  const navigateToRoom = (roomId) => {
    const finalName = name.trim() || 'Anonymous';
    localStorage.setItem('collab-editor-username', finalName);
    window.history.pushState(null, '', `/doc/${roomId}`);
    onJoin(roomId);
  };

  // Create a new room via API
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = roomInputName.trim();
    if (!trimmedName) {
      setError('Please enter a room name');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: trimmedName }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        setError((data && data.error) || 'Failed to create room');
        setCreating(false);
        return;
      }

      navigateToRoom(data.roomId);
    } catch {
      setError('Could not reach server');
      setCreating(false);
    }
  };

  // Join existing room by ID
  const handleJoinExisting = (e) => {
    e.preventDefault();
    const roomId = extractRoomId(joinRoomId);
    if (!roomId) {
      setError('Please enter a valid Room ID or link');
      return;
    }
    navigateToRoom(roomId);
  };

  return (
    <div className="join-screen">
      <div className="join-card">
        <h1 className="join-title">Collaborative Editor</h1>
        <p className="join-subtitle">Real-time editing powered by TipTap & Yjs</p>

        {/* Your Name */}
        <div className="join-form">
          <div className="join-field">
            <label htmlFor="user-name">Your Name</label>
            <input
              id="user-name"
              type="text"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Error message */}
          {error && <p className="join-error">{error}</p>}

          {/* Create New Room */}
          <form onSubmit={handleCreate} className="join-section">
            <label className="join-section-label">Create a New Room</label>
            <div className="join-row">
              <input
                id="room-name-input"
                type="text"
                placeholder="e.g. Sprint Planning Notes"
                value={roomInputName}
                onChange={(e) => { setRoomInputName(e.target.value); setError(''); }}
              />
              <button type="submit" className="join-btn create-btn" disabled={creating}>
                {creating ? '⏳' : '✨'} Create
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="join-divider"><span>or</span></div>

          {/* Join Existing Room */}
          <form onSubmit={handleJoinExisting} className="join-section">
            <label className="join-section-label">Join Existing Room</label>
            <div className="join-row">
              <input
                id="room-id-input"
                type="text"
                placeholder="Paste Room ID or link"
                value={joinRoomId}
                onChange={(e) => { setJoinRoomId(e.target.value); setError(''); }}
              />
              <button type="submit" className="join-btn join-existing-btn">
                🚀 Join
              </button>
            </div>
          </form>
        </div>

        {/* Recent Rooms */}
        <RecentRooms onSelectRoom={navigateToRoom} />
      </div>
    </div>
  );
}

// ---- Main App ----

function App() {
  // Check if URL already has a room
  const initialRoom = useMemo(() => getRoomFromUrl(), []);
  const [roomName, setRoomName] = useState(initialRoom);

  // No room in URL → show join screen
  if (!roomName) {
    return <JoinScreen onJoin={setRoomName} />;
  }

  // Room exists → show editor
  return (
    <div className="app">
      <header className="app-header">
        <h1>Collaborative Editor</h1>
        <p>Real-time editing powered by TipTap & Yjs — open multiple tabs to collaborate</p>
        <p className="room-link">
          Room: <code>{roomName}</code>
          <button
            className="copy-link-btn"
            onClick={() => {
              const shareableUrl = `${window.location.origin}/doc/${encodeURIComponent(roomName)}`;
              navigator.clipboard.writeText(shareableUrl);
            }}
            title="Copy shareable link"
          >
            📋 Copy Link
          </button>
        </p>
      </header>

      <Editor roomName={roomName} />
    </div>
  );
}

export default App;
