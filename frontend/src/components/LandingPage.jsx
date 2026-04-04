import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

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
          Real-time collaborative <br />
          <span className="text-gradient">writing made simple.</span>
        </h1>

        <p className="landing-subtitle">
          Experience seamless collaboration with our ultra-minimalist editor. 
          Built for teams who value speed, privacy, and beautiful design.
        </p>

        <div className="landing-actions">
          <button
            onClick={() => navigate('/create')}
            className="primary-btn"
          >
            Get Started
            <ArrowRight className="w-5 h-5 transition-transform" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="secondary-btn"
          >
            View Saved Notebooks
          </button>
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

