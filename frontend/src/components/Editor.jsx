import React, { useMemo, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import Toolbar from './Toolbar';
import { API_BASE, getWsUrl } from '../utils/network';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import './Editor.css';

// ---- Identity & Helpers ----

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getUserName = () => {
  return localStorage.getItem('username') || 'Anonymous';
};

// ---- Editor Component ----

const Editor = ({ roomName, clientId }) => {
  const [users, setUsers] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting');
  const [synced, setSynced] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const userName = useMemo(() => getUserName(), []);
  const userColor = useMemo(() => getRandomItem(COLORS), []);

  const { ydoc, provider, indexeddbProvider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const wsUrl = getWsUrl(API_BASE, roomName, clientId);
    const provider = new WebsocketProvider(wsUrl, "", ydoc);
    const indexeddbProvider = new IndexeddbPersistence(roomName, ydoc);

    provider.on('sync', isSynced => {
      if (isSynced) setSynced(true);
    });

    return { ydoc, provider, indexeddbProvider };
  }, [roomName, clientId]);

  useEffect(() => {
    const awareness = provider.awareness;
    const handleStatus = ({ status }) => setConnectionState(status);

    awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    });

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().values());
      setUsers(states.filter((state) => state.user).map((state) => state.user));
    };

    awareness.on('change', updateUsers);
    provider.on('status', handleStatus);
    updateUsers();

    return () => {
      awareness.off('change', updateUsers);
      provider.off('status', handleStatus);
      provider.disconnect();
      indexeddbProvider.destroy();
      ydoc.destroy();
    };
  }, [provider, indexeddbProvider, ydoc, userName, userColor]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: provider,
        user: { name: userName, color: userColor },
      }),
    ],
  });

  return (
    <>
      {/* Loading Overlay */}
      <AnimatePresence>
        {!synced && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="loading-overlay"
          >
            <div className="loading-content">
              <div className="loading-logo">
                <Zap className="loading-icon" />
              </div>
              <div className="spinner" />
              <p className="loading-text">Preparing workspace…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Layout */}
      <div className="editor-layout">
        <Toolbar editor={editor} roomName={roomName} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: synced ? 1 : 0, y: synced ? 0 : 16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="editor-paper"
        >
          <EditorContent editor={editor} />
        </motion.div>

        {/* Users Popover */}
        <AnimatePresence>
          {showUsers && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="users-popover"
            >
              <div className="users-popover-header">
                Online now • {users.length}
              </div>
              <div className="users-popover-list">
                {users.map((user, index) => (
                  <div key={index} className="users-popover-item">
                    <div
                      className="avatar"
                      style={{ backgroundColor: user.color, marginLeft: 0, zIndex: 1 }}
                    >
                      {user.name[0]}
                    </div>
                    <span className="users-popover-name">
                      {user.name} {user.name === userName ? '(You)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Status Pill */}
        <button 
          className="status-pill" 
          id="editor-status-pill"
          onClick={() => setShowUsers(!showUsers)}
        >
          <span className={`status-dot ${connectionState}`} />
          <span className="status-text">
            {connectionState === 'connected'
              ? `${users.length} online`
              : 'Connecting…'}
          </span>

          <div className="status-divider" />

          <div className="avatar-stack">
            {users.slice(0, 4).map((user, index) => (
              <div
                key={index}
                className="avatar"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name[0]}
              </div>
            ))}
            {users.length > 4 && (
              <div className="avatar avatar-more">
                +{users.length - 4}
              </div>
            )}
          </div>
        </button>
      </div>
    </>
  );
};

export default Editor;
