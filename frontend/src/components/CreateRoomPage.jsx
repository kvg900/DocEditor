import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Globe, Link, ArrowLeft, PlusCircle } from 'lucide-react';
import { API_BASE, safeJson } from '../utils/network';
import './CreateRoomPage.css';

const CreateRoomPage = ({ clientId }) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Please enter a notebook name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomName: roomName.trim(), 
          clientId, 
          visibility 
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        setError(data?.error || 'Failed to create notebook');
        setCreating(false);
        return;
      }

      // Navigate to the new room
      navigate(`/doc/${data.roomId}`);
    } catch {
      setError('Could not reach server. Please try again.');
      setCreating(false);
    }
  };

  const getVisibilityHelper = () => {
    if (visibility === 'private') return 'Only you can see and join this notebook.';
    if (visibility === 'unlisted') return 'Anyone with the link can join.';
    if (visibility === 'public') return 'Visible to everyone in the community.';
    return '';
  };

  return (
    <div className="create-room-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="create-room-card glass-card"
      >
        <div className="create-room-header">
          <h1 className="create-room-title">New Notebook</h1>
          <p className="create-room-subtitle">Create a collaborative space for your thoughts.</p>
        </div>

        <form onSubmit={handleCreate} className="create-room-form">
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="room-name">Notebook Name</label>
            <input
              id="room-name"
              type="text"
              className="form-input"
              placeholder="e.g. Project Specs, Daily Journal"
              value={roomName}
              onChange={(e) => { setRoomName(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          <div className="form-group mb-8">
            <label className="form-label">Privacy</label>
            <div className="visibility-grid">
              {[
                { id: 'private', icon: Lock, label: 'Private' },
                { id: 'unlisted', icon: Link, label: 'Unlisted' },
                { id: 'public', icon: Globe, label: 'Public' },
              ].map((item) => (
                <label key={item.id} className="visibility-item">
                  <input
                    type="radio"
                    name="visibility"
                    value={item.id}
                    checked={visibility === item.id}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <div className="visibility-box">
                    <item.icon className="visibility-icon" />
                    <span className="visibility-name">{item.label}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="visibility-helper">{getVisibilityHelper()}</p>
          </div>

          {error && <p className="error-message" style={{ color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="create-btn" disabled={creating || !roomName.trim()}>
            {creating ? (
              <span className="loader" />
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Create Notebook
              </>
            )}
          </button>
        </form>

        <button onClick={() => navigate(-1)} className="back-link">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default CreateRoomPage;
