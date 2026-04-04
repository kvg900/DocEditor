import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, Globe, ArrowLeft, PlusCircle } from 'lucide-react';
import { API_BASE, safeJson } from '../utils/network';
import './CreateRoomPage.css';

const CreateRoomPage = ({ clientId }) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [visibility, setVisibility] = useState('unlisted');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    // Save username to localStorage
    localStorage.setItem('username', username.trim());

    setCreating(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomName.trim(),
          clientId,
          visibility,
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        setError(data?.error || 'Failed to create room');
        setCreating(false);
        return;
      }

      navigate(`/doc/${data.roomId}`);
    } catch {
      setError('Could not reach server. Please try again.');
      setCreating(false);
    }
  };

  const visibilityOptions = [
    {
      id: 'unlisted',
      icon: Link2,
      label: 'Link Only',
      desc: 'Anyone with the link can join',
    },
    {
      id: 'public',
      icon: Globe,
      label: 'Public',
      desc: 'Visible to everyone',
    },
  ];

  return (
    <div className="create-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="create-card"
      >
        <div className="create-header">
          <h1 className="create-title">Create a Room</h1>
          <p className="create-subtitle">
            Set up a collaborative space in seconds.
          </p>
        </div>

        <form onSubmit={handleCreate} className="create-form">
          {/* Username field */}
          <div className="field-group">
            <label className="field-label" htmlFor="create-username">
              Your Name
            </label>
            <input
              id="create-username"
              type="text"
              className="field-input"
              placeholder="e.g. Alice"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
            />
          </div>

          {/* Room name field */}
          <div className="field-group">
            <label className="field-label" htmlFor="create-room-name">
              Room Name
            </label>
            <input
              id="create-room-name"
              type="text"
              className="field-input"
              placeholder="e.g. Project Brainstorm"
              value={roomName}
              onChange={(e) => { setRoomName(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          {/* Visibility picker */}
          <div className="field-group">
            <label className="field-label">Room Type</label>
            <div className="visibility-options">
              {visibilityOptions.map((opt) => (
                <label key={opt.id} className="vis-option" htmlFor={`vis-${opt.id}`}>
                  <input
                    type="radio"
                    name="visibility"
                    id={`vis-${opt.id}`}
                    value={opt.id}
                    checked={visibility === opt.id}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <div className="vis-card">
                    <opt.icon className="vis-icon" />
                    <div className="vis-text">
                      <span className="vis-label">{opt.label}</span>
                      <span className="vis-desc">{opt.desc}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="create-submit-btn"
            disabled={creating || !roomName.trim() || !username.trim()}
            id="create-room-submit"
          >
            {creating ? (
              <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
            ) : (
              <>
                <PlusCircle className="btn-icon" />
                Create Room
              </>
            )}
          </button>
        </form>

        <button onClick={() => navigate(-1)} className="back-link" id="create-back-btn">
          <ArrowLeft className="back-icon" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default CreateRoomPage;
