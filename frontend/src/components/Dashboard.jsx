import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Lock, 
  Globe, 
  Link as LinkIcon, 
  FileText, 
  Inbox,
  ArrowRight
} from 'lucide-react';
import { API_BASE, safeJson } from '../utils/network';
import './Dashboard.css';

const Dashboard = ({ clientId }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms?clientId=${clientId}`);
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to load notebooks');
      }

      setRooms(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError('Could not load your notebooks');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this notebook? This cannot be undone.')) return;

    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}?clientId=${clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRooms(rooms.filter((r) => r.roomId !== roomId));
      } else {
        const data = await safeJson(res);
        alert(data.error || 'Failed to delete notebook');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  const [copyStatus, setCopyStatus] = useState(null);

  const handleCopyLink = (e, roomId) => {
    e.stopPropagation();
    const url = `${window.location.origin}/doc/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopyStatus(roomId);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  useEffect(() => {
    loadRooms();
  }, [clientId]);

  const getVisibilityIcon = (visibility) => {
    if (visibility === 'private') return <Lock className="w-3 h-3" />;
    if (visibility === 'unlisted') return <LinkIcon className="w-3 h-3" />;
    if (visibility === 'public') return <Globe className="w-3 h-3" />;
    return null;
  };

  const myRooms = rooms.filter(r => r.createdBy === clientId);
  const publicRooms = rooms.filter(r => r.createdBy !== clientId && r.visibility === 'public');

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loader-container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <FileText className="w-8 h-8 text-purple-500" />
          Workspace
        </h1>
        <button onClick={() => navigate('/create')} className="primary-btn">
          <Plus className="w-5 h-5" />
          Create New
        </button>
      </div>

      {rooms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="empty-dashboard glass-card"
        >
          <Inbox className="empty-icon" />
          <h2 className="empty-title">No documents yet</h2>
          <p className="empty-subtitle">Create your first notebook to get started</p>
          <button onClick={() => navigate('/create')} className="secondary-btn">
            Create Document
          </button>
        </motion.div>

      ) : (
        <div className="dashboard-content">
          {myRooms.length > 0 && (
            <div className="section mb-12">
              <h2 className="text-xl font-semibold mb-6 opacity-60 flex items-center gap-2">
                Created by you
              </h2>
              <div className="notebook-grid">
                {myRooms.map((room) => (
                  <motion.div
                    key={room.roomId}
                    whileHover={{ scale: 1.02 }}
                    className="notebook-card glass-card"
                    onClick={() => navigate(`/doc/${room.roomId}`)}
                  >
                    <div className="notebook-card-header">
                      <div className="notebook-icon-wrapper">
                        <FileText className="w-5 h-5 opacity-60" />
                      </div>
                      <div className="notebook-actions">
                        <button 
                          className="notebook-action-btn"
                          onClick={(e) => handleCopyLink(e, room.roomId)}
                          title="Copy link"
                        >
                          {copyStatus === room.roomId ? <span style={{fontSize: '10px', color: '#10b981'}}>Copied!</span> : <Copy className="w-4 h-4" />}
                        </button>

                        <button 
                          className="notebook-action-btn delete-btn"
                          onClick={(e) => handleDelete(e, room.roomId)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="notebook-name">{room.roomName}</div>
                    <div className="notebook-meta">
                      <span className="flex items-center gap-1 opacity-60">
                        {getVisibilityIcon(room.visibility)}
                        {room.visibility.charAt(0).toUpperCase() + room.visibility.slice(1)}
                      </span>
                      <span className="opacity-40">{room.roomId}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {publicRooms.length > 0 && (
            <div className="section">
              <h2 className="text-xl font-semibold mb-6 opacity-60 flex items-center gap-2">
                Public Notebooks
              </h2>
              <div className="notebook-grid">
                {publicRooms.map((room) => (
                  <motion.div
                    key={room.roomId}
                    whileHover={{ scale: 1.02 }}
                    className="notebook-card glass-card"
                    onClick={() => navigate(`/doc/${room.roomId}`)}
                  >
                    <div className="notebook-card-header">
                      <div className="notebook-icon-wrapper">
                        <Globe className="w-5 h-5 opacity-60" />
                      </div>
                      <div className="notebook-actions">
                        <button 
                          className="notebook-action-btn"
                          onClick={(e) => handleCopyLink(e, room.roomId)}
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="notebook-name">{room.roomName}</div>
                    <div className="notebook-meta">
                      <span className="opacity-40">{room.roomId}</span>
                      <ArrowRight className="w-4 h-4 opacity-40 ml-auto" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
