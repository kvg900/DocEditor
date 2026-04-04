import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap, Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinName, setJoinName] = useState(() => localStorage.getItem('username') || '');
  const [showJoin, setShowJoin] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinRoomId.trim() && joinName.trim()) {
      localStorage.setItem('username', joinName.trim());
      navigate(`/doc/${joinRoomId.trim()}`);
    }
  };

  const handleCreate = () => {
    if (joinName.trim()) {
      localStorage.setItem('username', joinName.trim());
    }
    navigate('/create');
  };

  return (
    <div className="landing-page">
      {/* Animated gradient orbs */}
      <div className="gradient-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="gradient-arc" />
      </div>

      {/* Hero Content */}
      <div className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hero-content"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hero-badge"
          >
            <Sparkles size={14} className="badge-sparkle" />
            <span>Redesigned for Focus</span>
          </motion.div>

          <h1 className="hero-title">
            Write Together.
            <br />
            <span className="hero-title-accent">Think Better.</span>
          </h1>

          <p className="hero-subtitle">
            A minimal, real-time collaborative editor. Create a room and start
            writing with your team no sign-ups, no friction.
          </p>

          {/* Name input (always visible) */}
          <div className="hero-name-field">
            <input
              type="text"
              placeholder="Your name"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              className="name-input"
              id="hero-name-input"
            />
          </div>

          {/* Action buttons */}
          <div className="hero-actions">
            <button onClick={handleCreate} className="primary-btn" id="create-room-btn">
              Create Room
              <ArrowRight className="btn-icon" />
            </button>

            <button
              onClick={() => setShowJoin(!showJoin)}
              className="secondary-btn"
              id="toggle-join-btn"
            >
              <Users className="btn-icon" />
              Join Room
            </button>
          </div>

          {/* Join form (expandable) */}
          <motion.div
            initial={false}
            animate={{
              height: showJoin ? 'auto' : 0,
              opacity: showJoin ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="join-section"
          >
            <form onSubmit={handleJoin} className="join-form">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="join-input"
                id="join-room-id-input"
              />
              <button
                type="submit"
                className="join-submit-btn"
                disabled={!joinRoomId.trim() || !joinName.trim()}
                id="join-room-submit-btn"
              >
                Join
                <ArrowRight className="btn-icon-sm" />
              </button>
            </form>
            {!joinName.trim() && showJoin && (
              <p className="join-hint">Please enter your name above to join.</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
