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
import { nanoid } from 'nanoid';
import Editor from './components/Editor';
import { API_BASE, safeJson } from './utils/network';
import './App.css';

// ---- Components ----

function Navbar({ username }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => window.location.href = '/'}>
          <span className="brand-icon">✍️</span>
          <span className="brand-name">InkSync</span>
        </div>
        
        {username && (
          <div className="navbar-user">
            <div className="user-indicator">
              <span className="user-dot" />
              <span className="user-label">Active:</span>
              <span className="user-name">{username}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ---- Client Identity ----

/**
 * Get or generate a persistent unique ID for this browser.
 * This ID is used for ownership/access control without accounts.
 */
const getClientId = () => {
  let id = localStorage.getItem('collab-editor-client-id');
  if (!id) {
    id = nanoid();
    localStorage.setItem('collab-editor-client-id', id);
  }
  return id;
};

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

function RecentRooms({ clientId, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms?clientId=${clientId}`);
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to load rooms');
      }

      setRooms(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError('Could not load recent rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;

    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}?clientId=${clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRooms(rooms.filter((r) => r.roomId !== roomId));
      } else {
        const data = await safeJson(res);
        alert(data.error || 'Failed to delete room');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const handleCopyLink = (e, roomId) => {
    e.stopPropagation();
    const url = `${window.location.origin}/doc/${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  useEffect(() => {
    loadRooms();
  }, [clientId]);

  if (loading) {
    return (
      <div className="recent-rooms">
        <h3 className="recent-rooms-title">Recent Rooms</h3>
        <div className="skeleton-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-item" />
          ))}
        </div>
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

  const myRooms = rooms.filter(r => r.createdBy === clientId);
  const publicRooms = rooms.filter(r => r.createdBy !== clientId && r.visibility === 'public');

  if (rooms.length === 0) {
    return (
      <div className="recent-rooms empty">
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No rooms found. Create one to start syncing!</p>
        </div>
      </div>
    );
  }

  const renderRoomList = (list, title) => {
    if (list.length === 0) return null;
    return (
      <div className="room-section">
        <h3 className="recent-rooms-title">{title}</h3>
        <ul className="recent-rooms-list">
          {list.slice(0, 5).map((room) => {
            const isOwner = room.createdBy === clientId;
            const icon = room.visibility === 'private' ? '🔒' : room.visibility === 'unlisted' ? '🔗' : '🌍';
            
            return (
              <li key={room.roomId} className="recent-room-item">
                <button
                  className="recent-room-btn"
                  onClick={() => onSelectRoom(room.roomId)}
                >
                  <div className="recent-room-main">
                    <span className="room-visibility-icon" title={room.visibility}>{icon}</span>
                    <span className="recent-room-name">{room.roomName}</span>
                  </div>
                  <span className="recent-room-meta">
                    <code>{room.roomId}</code>
                  </span>
                </button>
                <div className="room-actions">
                  <button 
                    className="action-btn copy-btn" 
                    onClick={(e) => handleCopyLink(e, room.roomId)}
                    title="Copy Join Link"
                  >
                    📋
                  </button>
                  {isOwner && (
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => handleDelete(e, room.roomId)}
                      title="Delete room"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="recent-rooms">
      {renderRoomList(myRooms, 'My Rooms')}
      {renderRoomList(publicRooms, 'Public Rooms')}
    </div>
  );
}

// ---- Join Screen Component ----

function JoinScreen({ clientId, onJoin }) {
  const savedName = localStorage.getItem('collab-editor-username') || '';
  const [name, setName] = useState(savedName);
  const [roomInputName, setRoomInputName] = useState('');
  const [visibility, setVisibility] = useState('private');
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
        body: JSON.stringify({ 
          roomName: trimmedName, 
          clientId, 
          visibility 
        }),
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
        <div className="join-header">
          <span className="join-logo">✍️</span>
          <h1 className="join-title">InkSync</h1>
          <p className="join-subtitle">Real-time collaborative editing, simplified.</p>
        </div>

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
            </div>
            
            <div className="visibility-selector">
              <label>Room Visibility:</label>
              <div className="visibility-options">
                {['private', 'unlisted', 'public'].map((v) => (
                  <label key={v} className="visibility-option">
                    <input
                      type="radio"
                      name="visibility"
                      value={v}
                      checked={visibility === v}
                      onChange={(e) => setVisibility(e.target.value)}
                    />
                    <span className="visibility-label">
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              <p className="visibility-desc">
                {visibility === 'private' && 'Only you can see and join this room.'}
                {visibility === 'unlisted' && 'Not in room list, but anyone with the link can join.'}
                {visibility === 'public' && 'Anyone can see it in the room list and join.'}
              </p>
            </div>

            <button type="submit" className="join-btn create-btn" disabled={creating}>
              {creating ? '⏳' : '✨'} Create Room
            </button>
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
        <RecentRooms clientId={clientId} onSelectRoom={navigateToRoom} />
      </div>
    </div>
  );
}

// ---- Room Guard (Access Control) ----

function RoomGuard({ roomName, clientId }) {
  const [access, setAccess] = useState({ loading: true, allowed: false, reason: null });

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${roomName}/access?clientId=${clientId}`);
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
  }, [roomName, clientId]);

  if (access.loading) {
    return (
      <div className="guard-screen">
        <div className="guard-card">
          <div className="spinner" />
          <p>Verifying room access...</p>
        </div>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="guard-screen">
        <div className="guard-card error">
          <div className="guard-icon">
            {access.reason === 'private' ? '🔒' : '🚫'}
          </div>
          <h2>Access Denied</h2>
          <p>
            {access.reason === 'private' && 'This is a private room. Only the owner can enter.'}
            {access.reason === 'not_found' && 'This room does not exist or has been deleted.'}
            {access.reason === 'network_error' && 'Could not reach the server. Please check your connection.'}
            {access.reason === 'error' && 'An unexpected error occurred while checking access.'}
          </p>
          <button 
            className="join-btn" 
            onClick={() => window.location.href = '/'}
          >
            🏠 Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  return <Editor roomName={roomName} clientId={clientId} />;
}

// ---- Main App ----

function App() {
  const clientId = useMemo(() => getClientId(), []);
  const username = useMemo(() => localStorage.getItem('collab-editor-username'), []);

  // Check if URL already has a room
  const initialRoom = useMemo(() => getRoomFromUrl(), []);
  const [roomName, setRoomName] = useState(initialRoom);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRoomName(getRoomFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // No room in URL → show join screen
  if (!roomName) {
    return (
      <>
        <Navbar />
        <JoinScreen clientId={clientId} onJoin={setRoomName} />
      </>
    );
  }

  // Room exists → show guard (which then shows editor)
  return (
    <div className="app">
      <Navbar username={username} />
      
      <main className="main-content">
        <header className="app-header">
          <div className="header-info">
            <h1>{roomName}</h1>
            <p>Real-time collaborative session</p>
          </div>
          
          <div className="room-link-container">
            <code>ID: {roomName}</code>
            <button
              className="copy-link-btn"
              onClick={() => {
                const shareableUrl = `${window.location.origin}/doc/${encodeURIComponent(roomName)}`;
                navigator.clipboard.writeText(shareableUrl);
                alert('Room link copied!');
              }}
              title="Copy shareable link"
            >
              📋 Copy Link
            </button>
          </div>
        </header>

        <RoomGuard roomName={roomName} clientId={clientId} />
      </main>
    </div>
  );
}

export default App;
