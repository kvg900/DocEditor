/**
 * App Component
 *
 * Root component that renders either:
 * - A Join screen (when no room in URL) for entering name + room ID
 * - The collaborative Editor (when URL has /doc/{id})
 *
 * [ADDED] Join/landing page with name + room ID inputs
 */

import React, { useState, useMemo } from 'react';
import Editor from './components/Editor';
import './App.css';

// ---- URL-Based Room Routing ----

/** Generate a random 8-character alphanumeric ID */
const generateRoomId = () =>
  Math.random().toString(36).substring(2, 10);

/**
 * Check if the current URL contains a room.
 * Returns the room ID if found, null otherwise.
 */
const getRoomFromUrl = () => {
  const match = window.location.pathname.match(/^\/doc\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// ---- Join Screen Component ----

function JoinScreen({ onJoin }) {
  const savedName = localStorage.getItem('collab-editor-username') || '';
  const [name, setName] = useState(savedName);
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    const finalName = name.trim() || 'Anonymous';
    const finalRoom = roomId.trim() || generateRoomId();

    // Persist name
    localStorage.setItem('collab-editor-username', finalName);

    // Navigate to the room
    window.history.pushState(null, '', `/doc/${finalRoom}`);
    onJoin(finalRoom);
  };

  return (
    <div className="join-screen">
      <div className="join-card">
        <h1 className="join-title">Collaborative Editor</h1>
        <p className="join-subtitle">Real-time editing powered by TipTap & Yjs</p>

        <form onSubmit={handleJoin} className="join-form">
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

          <div className="join-field">
            <label htmlFor="room-id">Room ID <span className="optional">(optional)</span></label>
            <input
              id="room-id"
              type="text"
              placeholder="Leave empty to create a new room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button type="submit" className="join-btn">
            {roomId.trim() ? '🚀 Join Room' : '✨ Create New Room'}
          </button>
        </form>
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
            onClick={() => navigator.clipboard.writeText(window.location.href)}
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
