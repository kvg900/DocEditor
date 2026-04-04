import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, safeJson } from '../utils/network';
import { FileText, Search, Clock, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import './ExplorePage.css';

const ExplorePage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms`);
        const data = await safeJson(res);
        if (Array.isArray(data)) {
          setRooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => 
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="explore-page">
      <div className="explore-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="explore-title"
        >
          Explore
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="explore-subtitle"
        >
          Discover public notebooks created by the community.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="explore-search"
        >
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </motion.div>
      </div>

      <div className="explore-content">
        {loading ? (
          <div className="explore-loading">
            <div className="spinner" />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="room-grid">
            {filteredRooms.map((room, index) => (
              <motion.div 
                key={room.roomId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link to={`/doc/${room.roomId}`} className="room-card">
                  <div className="room-card-icon">
                    <FileText />
                  </div>
                  <div className="room-card-content">
                    <h3 className="room-card-title">{room.roomName}</h3>
                    <div className="room-card-meta">
                      <Clock size={12} />
                      <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileQuestion size={48} className="empty-icon" />
            <h3>No notebooks found</h3>
            <p>We couldn't find any public notebooks matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
