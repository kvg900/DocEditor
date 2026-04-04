import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Clock, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import './HistoryPage.css';

const getHistory = () => {
  try {
    const history = localStorage.getItem('inksynk-history');
    return history ? JSON.parse(history) : [];
  } catch (err) {
    return [];
  }
};

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Sort by last visited descending
    const h = getHistory().sort((a, b) => b.lastVisited - a.lastVisited);
    setHistory(h);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local notebook history?")) {
      localStorage.removeItem('inksynk-history');
      setHistory([]);
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="history-title"
        >
          My Notebooks
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="history-subtitle"
        >
          Your recently visited notebooks. This history is stored locally in your browser.
        </motion.p>
        {history.length > 0 && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
          >
             <button onClick={clearHistory} className="clear-history-btn">Clear History</button>
          </motion.div>
        )}
      </div>

      <div className="history-content">
        {history.length > 0 ? (
          <div className="room-grid">
            {history.map((room, index) => (
              <motion.div 
                key={room.roomId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Link to={`/doc/${room.roomId}`} className="room-card">
                  <div className="room-card-icon">
                    <Book />
                  </div>
                  <div className="room-card-content">
                    <h3 className="room-card-title">{room.roomId}</h3>
                    <div className="room-card-meta">
                      <Clock size={12} />
                      <span>Last visited {new Date(room.lastVisited).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Map size={48} className="empty-icon" />
            <h3>No recent notebooks</h3>
            <p>When you join or create a notebook, it will appear here.</p>
            <Link to="/create" className="primary-btn empty-action-btn">
              Create a Notebook
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
