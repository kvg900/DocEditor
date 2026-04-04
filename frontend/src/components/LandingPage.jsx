import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const [joinRoomId, setJoinRoomId] = React.useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/doc/${joinRoomId.trim()}`);
    }
  };

  return (
    <div className="landing-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero-content"
      >
        <div className="landing-header">
          <div className="landing-logo-container glass">
            <Sparkles className="w-6 h-6" style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <span className="landing-brand">InkSynk</span>
        </div>

        <h1 className="landing-title">
          Collaborative writing <br />
          <span className="text-gradient">made simple.</span>
        </h1>

        <p className="landing-subtitle">
          Experience seamless real-time collaboration. 
          Create a new notebook or join an existing one to get started.
        </p>

        <div className="landing-actions-container">
          <div className="landing-main-action">
            <button
              onClick={() => navigate('/create')}
              className="primary-btn"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform" />
            </button>
          </div>

          <div className="landing-divider">
            <span>or join existing</span>
          </div>

          <form onSubmit={handleJoin} className="join-room-form">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="join-input"
            />
            <button type="submit" className="join-btn" disabled={!joinRoomId.trim()}>
              Join Room
            </button>
          </form>
        </div>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="landing-mockup glass-card"
      >
        <div className="mockup-inner">
          <div className="mockup-text">InkSynk Editor Mockup</div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;

